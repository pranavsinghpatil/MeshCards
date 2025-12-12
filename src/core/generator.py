from typing import List
from .schemas import Flashcard, DeckConfig, GenerationResponse
from .llm import LLMClient

class FlashcardGenerator:
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client

    def generate_flashcards(self, text: str, config: DeckConfig) -> List[Flashcard]:
        prompt = self._build_prompt(text, config)
        print(f"DEBUG: Sending prompt to LLM (Length: {len(prompt)})")
        response_json = self.llm_client.generate_json(prompt)
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
        - Max Cards: {config.max_cards}
        
        **Custom Context/Instructions**:
        {config.custom_instructions or "None"}
        
        **Instructions**:
        1. Extract the most important concepts, definitions, and relationships.
        2. Create Question/Answer pairs.
        3. Ensure the answer is concise but complete.
        4. Add relevant tags (e.g., topic, concept type).
        5. If a concept is visual (e.g., a diagram, chart, or physical object), provide a short, descriptive `image_prompt`.
        6. **Advanced Formatting**:
           - **Cloze Deletion**: If a sentence has a key term to memorize, use `{{c1::term}}` syntax and set type to "cloze". Example: "The {{c1::mitochondria}} is the powerhouse of the cell."
           - **Math**: Use LaTeX syntax wrapped in `\( ... \)` for inline math and `\[ ... \]` for block math. IMPORTANT: You must escape backslashes in the JSON string (e.g., use `\\frac` instead of `\frac`).
           - **Code**: Use Markdown code blocks (```python ... ```) for code snippets.
        7. Output MUST be valid JSON matching this schema:
        {{
            "deck_name": "{config.name}",
            "cards": [
                {{
                    "type": "basic" or "cloze",
                    "front": "Question or Cloze Text",
                    "back": "Answer or Extra Info",
                    "tags": ["tag1", "tag2"],
                    "image_prompt": "A diagram showing..." (optional)
                }}
            ]
        }}

        **Source Text**:
        {text}
        """
