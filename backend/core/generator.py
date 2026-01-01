from typing import List
from .schemas import Flashcard, DeckConfig, GenerationResponse
from .llm import LLMClient

class FlashcardGenerator:
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client

    def generate_flashcards(self, text: str, config: DeckConfig) -> List[Flashcard]:
        """
        Generate flashcards with automatic optimization for minimal API cost
        """
        from .chunker import estimate_tokens, extract_key_content, chunk_text
        from .logging import logger
        import time
        
        # Estimate tokens
        estimated_tokens = estimate_tokens(text)
        logger.info(f"Input text: {len(text)} chars, ~{estimated_tokens} tokens")
        
        # Strategy 1: Small text - direct generation (most cost-effective)
        if estimated_tokens < 20000:
            logger.info("Using direct generation (small text)")
            prompt = self._build_prompt(text, config)
            response_json = self.llm_client.generate_json(prompt)
            generation_response = GenerationResponse(**response_json)
            return generation_response.cards
        
        # Strategy 2: Medium text - semantic extraction (60-80% cost reduction)
        elif estimated_tokens < 50000:
            logger.info("Using semantic extraction (medium text)")
            extracted = extract_key_content(text, max_tokens=20000)
            extracted_tokens = estimate_tokens(extracted)
            logger.info(f"Extracted key content: {len(extracted)} chars, ~{extracted_tokens} tokens (reduced by {100 - (extracted_tokens/estimated_tokens*100):.1f}%)")
            
            prompt = self._build_prompt(extracted, config)
            response_json = self.llm_client.generate_json(prompt)
            generation_response = GenerationResponse(**response_json)
            return generation_response.cards
        
        # Strategy 3: Large text - chunking with extraction (necessary for very large docs)
        else:
            logger.info("Using chunked generation (large text)")
            
            # First, try to extract key content to reduce size
            extracted = extract_key_content(text, max_tokens=40000)
            extracted_tokens = estimate_tokens(extracted)
            logger.info(f"Extracted key content: ~{extracted_tokens} tokens (reduced by {100 - (extracted_tokens/estimated_tokens*100):.1f}%)")
            
            # If extraction is still too large, chunk it
            if extracted_tokens > 25000:
                chunks = chunk_text(extracted, max_tokens=20000)
                logger.info(f"Split into {len(chunks)} chunks")
                
                all_cards = []
                cards_per_chunk = max(1, config.max_cards // len(chunks))
                
                for i, chunk in enumerate(chunks):
                    logger.info(f"Processing chunk {i+1}/{len(chunks)}")
                    
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
                        response_json = self.llm_client.generate_json(prompt)
                        generation_response = GenerationResponse(**response_json)
                        all_cards.extend(generation_response.cards)
                    except Exception as e:
                        logger.error(f"Chunk {i+1} failed: {e}")
                        # Continue with other chunks
                    
                    # Small delay between chunks to avoid rate limits
                    if i < len(chunks) - 1:
                        time.sleep(2)
                
                # Return up to max_cards
                return all_cards[:config.max_cards]
            else:
                # Extracted content fits in one call
                prompt = self._build_prompt(extracted, config)
                response_json = self.llm_client.generate_json(prompt)
                generation_response = GenerationResponse(**response_json)
                return generation_response.cards
    
    def generate_flashcards_multimodal(self, prompt_parts: list, config: DeckConfig) -> List[Flashcard]:
        """
        Generate flashcards from multimodal input (text + images).
        prompt_parts: List containing text strings and image dicts
        """
        # Build the instruction prompt
        instruction = self._build_multimodal_prompt(config)
        
        # Combine instruction with the provided parts
        full_prompt = [instruction] + prompt_parts
        
        print(f"DEBUG: Sending multimodal prompt to LLM (Parts: {len(full_prompt)})")
        response_json = self.llm_client.generate_json(full_prompt)
        print(f"DEBUG: Received response from LLM: {response_json}")
        
        # Validate against schema
        generation_response = GenerationResponse(**response_json)
        return generation_response.cards

    def _build_prompt(self, text: str, config: DeckConfig) -> str:
        return f"""
        You are an expert tutor helping a student create Anki flashcards.
        
        **Goal**: Create a list of high-quality flashcards from the provided text.
        
        **Configuration**:
        - Difficulty: {config.difficulty}
        - Style: {config.style}
        - Max Cards: {config.max_cards} (You MUST attempt to generate close to this number, at least {int(config.max_cards * 0.8)})
        
        **Custom Context/Instructions**:
        {config.custom_instructions or "None"}
        
        **Instructions**:
        1. Extract the most important concepts, definitions, and relationships.
        2. Create Question/Answer pairs based on the selected **Style**.
        3. **Style Specifics**:
           - **Question & Answer (qa)**: Standard front/back cards.
           - **Cloze Deletion**: Use `{{{{c1::term}}}}` syntax for key terms to memorize. Set type to "cloze".
           - **Definition**: Front is the term, Back is the definition.
           - **True / False**: Front is a statement. Back is "True" or "False" with a brief explanation.
           - **Multiple Choice**: Front includes the question AND options (A, B, C, D). Back is the correct option and explanation.
           - **Scenario Based**: Front is a short real-world scenario/case followed by a question. Back is the solution.
        4. Ensure the answer is concise but complete.
        5. Add relevant tags (e.g., topic, concept type).
        6. If a concept is visual (e.g., a diagram, chart, or physical object), provide a short, descriptive `image_prompt`.
        7. **Advanced Formatting**:
           - **Math**: Use LaTeX syntax wrapped in `\\( ... \\)` for inline math and `\\[ ... \\]` for block math. IMPORTANT: You must escape backslashes in the JSON string (e.g., use `\\\\frac` instead of `\\frac`).
           - **Code**: Use Markdown code blocks (```python ... ```) for code snippets.
        8. Output MUST be valid JSON matching this schema:
        {{{{
            "deck_name": "{config.name}",
            "cards": [
                {{{{
                    "type": "basic" or "cloze",
                    "front": "Question or Cloze Text",
                    "back": "Answer or Extra Info",
                    "tags": ["tag1", "tag2"],
                    "image_prompt": "A diagram showing..." (optional)
                }}}}
            ]
        }}}}

        **Source Text**:
        {text}
        """
    
    def _build_multimodal_prompt(self, config: DeckConfig) -> str:
        """Build prompt for vision-based flashcard generation"""
        return f"""
        You are an expert tutor helping a student create Anki flashcards from visual content.
        
        **Goal**: Analyze the provided image(s) and create high-quality flashcards from the content you see.
        
        **Configuration**:
        - Difficulty: {config.difficulty}
        - Style: {config.style}
        - Max Cards: {config.max_cards} (Generate close to this number based on the content in the images)
        
        **Custom Context/Instructions**:
        {config.custom_instructions or "None"}
        
        **Instructions**:
        1. Carefully analyze ALL images provided.
        2. Extract key concepts, definitions, diagrams, formulas, or any educational content.
        3. Create Question/Answer pairs based on what you see in the images.
        4. For diagrams or visual elements, describe them clearly in the question.
        5. Follow the same style guidelines as text-based cards.
        6. Output MUST be valid JSON matching this schema:
        {{{{
            "deck_name": "{config.name}",
            "cards": [
                {{{{
                    "type": "basic" or "cloze",
                    "front": "Question based on image content",
                    "back": "Answer with explanation",
                    "tags": ["tag1", "tag2"],
                    "image_prompt": "Description of visual element" (optional)
                }}}}
            ]
        }}}}
        
        Analyze the images below and generate flashcards:
        """
