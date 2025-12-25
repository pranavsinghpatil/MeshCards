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
        - Max Cards: {config.max_cards} (You MUST attempt to generate close to this number, at least {int(config.max_cards * 0.8)})
        
        **Custom Context/Instructions**:
        {config.custom_instructions or "None"}
        
        **Instructions**:
        1. Extract the most important concepts, definitions, and relationships.
        2. Create Question/Answer pairs based on the selected **Style**.
        3. **Style Specifics**:
           - **Question & Answer (qa)**: Standard front/back cards.
           - **Cloze Deletion**: Use `{{c1::term}}` syntax for key terms to memorize. Set type to "cloze".
           - **Definition**: Front is the term, Back is the definition.
           - **True / False**: Front is a statement. Back is "True" or "False" with a brief explanation.
           - **Multiple Choice**: Front includes the question AND options (A, B, C, D). Back is the correct option and explanation.
           - **Scenario Based**: Front is a short real-world scenario/case followed by a question. Back is the solution.
        4. Ensure the answer is concise but complete.
        5. Add relevant tags (e.g., topic, concept type).
        6. If a concept is visual (e.g., a diagram, chart, or physical object), provide a short, descriptive `image_prompt`.
        7. **Advanced Formatting**:
           - **Math**: Use LaTeX syntax wrapped in `\( ... \)` for inline math and `\[ ... \]` for block math. IMPORTANT: You must escape backslashes in the JSON string (e.g., use `\\frac` instead of `\frac`).
           - **Code**: Use Markdown code blocks (```python ... ```) for code snippets.
        8. Output MUST be valid JSON matching this schema:
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
