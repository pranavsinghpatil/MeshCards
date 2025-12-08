from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional
import shutil
import os
import tempfile
import random
from dotenv import load_dotenv

from src.core.llm import get_llm_client
from src.core.generator import FlashcardGenerator
from src.core.schemas import DeckConfig
from src.core.anki import AnkiDeckBuilder
from src.core.images import get_image_generator

load_dotenv()

app = FastAPI(title="MeshCards API", version="0.1.0")



@app.post("/generate")
async def generate_deck(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    provider: str = Form("gemini"),
    model: Optional[str] = Form(None),
    deck_name: str = Form("MeshCards Deck"),
    difficulty: str = Form("Intermediate"),
    style: str = Form("Mixed"),
    max_cards: int = Form(20),
    images: bool = Form(False)
):
    # Validate input
    if not file and not text:
        raise HTTPException(status_code=400, detail="Either file or text must be provided")

    tmp_path = None
    input_text = ""

    try:
        # 1. Get input text
        if text:
            input_text = text
        elif file:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as tmp_file:
                shutil.copyfileobj(file.file, tmp_file)
                tmp_path = tmp_file.name
            
            # TODO: Add PDF parsing support
            with open(tmp_path, "r", encoding="utf-8") as f:
                input_text = f.read()

        # 2. Initialize LLM
        api_key = os.getenv(f"{provider.upper()}_API_KEY")
        if provider != "ollama" and not api_key:
             raise HTTPException(status_code=500, detail=f"{provider.upper()}_API_KEY not set")
        
        llm_client = get_llm_client(provider, api_key, model)
        generator = FlashcardGenerator(llm_client)

        # 3. Generate Cards
        config = DeckConfig(
            name=deck_name,
            difficulty=difficulty,
            style=style,
            max_cards=max_cards
        )
        cards = generator.generate_flashcards(input_text, config)

        # 5. Generate Images (if enabled)
        image_map = {}
        if images:
            img_gen = get_image_generator("gemini", os.getenv("GEMINI_API_KEY"))
            if img_gen:
                temp_dir = tempfile.mkdtemp()
                for i, card in enumerate(cards):
                    if card.image_prompt:
                        img_filename = f"card_{i}_{random.randint(1000,9999)}.png"
                        img_path = os.path.join(temp_dir, img_filename)
                        if img_gen.generate_image(card.image_prompt, img_path):
                            image_map[i] = img_path

        # 6. Create .apkg
        builder = AnkiDeckBuilder()
        output_filename = f"{deck_name.replace(' ', '_')}.apkg"
        output_path = os.path.join(tempfile.gettempdir(), output_filename)
        
        if images:
            builder.create_apkg_with_images(cards, deck_name, output_path, image_map)
        else:
            builder.create_apkg(cards, deck_name, output_path)

        # 7. Return file
        return FileResponse(
            output_path, 
            media_type="application/octet-stream", 
            filename=output_filename
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

# Mount static files at the root (catch-all) - MUST BE LAST
app.mount("/", StaticFiles(directory="src/web", html=True), name="static")
