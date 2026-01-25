from typing import List
from .schemas import Flashcard, DeckConfig, GenerationResponse
from .llm import LLMClient

class FlashcardGenerator:
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client

    async def generate_flashcards_async(self, text: str, config: DeckConfig, on_progress=None) -> List[Flashcard]:
        """
        Generate flashcards with automatic optimization and parallel processing.
        """
        from .chunker import estimate_tokens, extract_key_content, chunk_text
        from .logging import logger
        import asyncio
        
        def report(msg):
            if on_progress:
                on_progress(msg)
        
        # Estimate tokens
        estimated_tokens = estimate_tokens(text)
        logger.info(f"Input text: {len(text)} chars, ~{estimated_tokens} tokens")
        
        # Strategy 1: Small text - direct generation
        if estimated_tokens < 20000:
            logger.info("Using direct generation (small text)")
            report("Generating flashcards...")
            prompt = self._build_prompt(text, config)
            response_json = await asyncio.to_thread(self.llm_client.generate_json, prompt)
            generation_response = GenerationResponse(**response_json)
            return generation_response.cards
        
        # Strategy 2: Medium text - semantic extraction
        elif estimated_tokens < 50000:
            logger.info("Using semantic extraction (medium text)")
            report("Optimizing content...")
            extracted = extract_key_content(text, max_tokens=20000)
            extracted_tokens = estimate_tokens(extracted)
            
            prompt = self._build_prompt(extracted, config)
            response_json = await asyncio.to_thread(self.llm_client.generate_json, prompt)
            generation_response = GenerationResponse(**response_json)
            return generation_response.cards
        
        # Strategy 3: Large text - parallel chunking
        else:
            logger.info("Using parallel chunked generation (large text)")
            report("Optimizing large document...")
            
            # First, try to extract key content to reduce size
            extracted = extract_key_content(text, max_tokens=60000)
            extracted_tokens = estimate_tokens(extracted)
            
            # Use sliding window chunking
            chunks = chunk_text(extracted, max_tokens=20000, overlap_percent=0.15)
            logger.info(f"Split into {len(chunks)} chunks for parallel processing")
            report(f"Processing {len(chunks)} parts in parallel...")
            
            all_cards = []
            cards_per_chunk = max(2, config.max_cards // len(chunks))
            
            async def process_chunk(idx, chunk):
                # Adjust config for this chunk
                chunk_config = DeckConfig(
                    name=config.name,
                    difficulty=config.difficulty,
                    style=config.style,
                    max_cards=cards_per_chunk,
                    model_name=config.model_name,
                    custom_instructions=config.custom_instructions
                )
                try:
                    prompt = self._build_prompt(chunk, chunk_config)
                    # Use to_thread to keep LLM calls from blocking the event loop
                    response_json = await asyncio.to_thread(self.llm_client.generate_json, prompt)
                    chunk_res = GenerationResponse(**response_json)
                    return chunk_res.cards
                except Exception as e:
                    logger.error(f"Chunk {idx+1} failed: {e}")
                    return []

            # Process all chunks concurrently
            tasks = [process_chunk(i, chunk) for i, chunk in enumerate(chunks)]
            results = await asyncio.gather(*tasks)
            
            for chunk_cards in results:
                all_cards.extend(chunk_cards)
            
            return all_cards[:config.max_cards]

    def generate_flashcards(self, text: str, config: DeckConfig, on_progress=None) -> List[Flashcard]:
        """
        Synchronous wrapper for generate_flashcards_async.
        This allows it to be called from the existing thread-based job executor.
        """
        import asyncio
        import threading
        
        try:
            # Try to get existing loop
            loop = asyncio.get_event_loop()
        except RuntimeError:
            # Create new loop if none exists in this thread
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        return loop.run_until_complete(self.generate_flashcards_async(text, config, on_progress))
    
    def generate_flashcards_multimodal(self, prompt_parts: list, config: DeckConfig) -> List[Flashcard]:
        """
        Generate flashcards from multimodal input (text + images).
        """
        instruction = self._build_multimodal_prompt(config)
        full_prompt = [instruction] + prompt_parts
        
        response_json = self.llm_client.generate_json(full_prompt)
        generation_response = GenerationResponse(**response_json)
        return generation_response.cards

    def _build_prompt(self, text: str, config: DeckConfig) -> str:
        # Prioritize custom instructions/focus area
        focus_block = ""
        if config.custom_instructions:
            focus_block = f"""
            **MANDATORY FOCUS AREA**: 
            The user has requested to focus specifically on: "{config.custom_instructions}"
            You MUST prioritize information related to this focus area above all other content.
            """

        return f"""
        You are an expert tutor helping a student create high-quality Anki flashcards.
        
        **Goal**: Create exactly {config.max_cards} cards from the source text.
        
        **Settings**:
        - Difficulty: {config.difficulty}
        - Style: {config.style}
        {focus_block}
        
        **Core Instructions**:
        1. Extract the most important concepts, definitions, and relationships.
        2. Format Question/Answer pairs based on the '{config.style}' style.
        3. If a Focus Area is specified above, prioritize it.
        4. Output MUST be valid JSON.
        
        **Style Specifics**:
        - **qa**: Standard front/back.
        - **cloze**: Use {{{{c1::term}}}} syntax. Set type to "cloze".
        - **definition**: Front=Term, Back=Definition.
        - **mcq**: Front=Question + Options A,B,C,D. Back=Correct Answer + Reason.
        
        **Anki Formatting**:
        - Math: Use `\\( ... \\)` for inline, `\\[ ... \\]` for block. Escape backslashes in JSON (e.g. `\\\\frac`).
        - Code: Use markdown code blocks (```python ... ```).

        **Response Schema**:
        {{{{
            "deck_name": "{config.name}",
            "cards": [
                {{{{
                    "type": "basic" or "cloze",
                    "front": "...",
                    "back": "...",
                    "tags": ["topic"],
                    "image_prompt": "visual description" (optional)
                }}}}
            ]
        }}}}

        **Source Text**:
        {text}
        """
    
    def _build_multimodal_prompt(self, config: DeckConfig) -> str:
        """Build prompt for vision-based flashcard generation"""
        focus_block = ""
        if config.custom_instructions:
            focus_block = f"**User Focus Area**: {config.custom_instructions}\n"

        return f"""
        You are an expert tutor analyzing images to create Anki flashcards.
        
        **Goal**: Extract key educational content from the images.
        
        **Settings**:
        - Difficulty: {config.difficulty}
        - Max Cards: {config.max_cards}
        {focus_block}
        
        **Instructions**:
        1. Analyze ALL images carefully.
        2. Create Question/Answer pairs based on visual data (diagrams, text, handwriting).
        3. Follow the standard Anki formatting (Math, Code, JSON).
        
        **Response Schema**:
        {{{{
            "deck_name": "{config.name}",
            "cards": [{{{{ "type": "basic", "front": "...", "back": "...", "tags": [] }}}}]
        }}}}
        """
