import typer
import os
import random
from dotenv import load_dotenv
from backend.core.llm import get_llm_client
from backend.core.generator import FlashcardGenerator
from backend.core.schemas import DeckConfig
from backend.core.anki import AnkiDeckBuilder

load_dotenv()

app = typer.Typer()

from backend.core.images import get_image_generator
import tempfile

@app.command()
def generate(
    input_file: str = typer.Argument(..., help="Path to the input text file"),
    output: str = typer.Option("output.apkg", help="Path to the output .apkg file"),
    provider: str = typer.Option("gemini", help="LLM provider: gemini, openai, anthropic, ollama"),
    model: str = typer.Option(None, help="Model name (for Ollama)"),
    deck_name: str = typer.Option("MeshCards Deck", help="Name of the Anki deck"),
    difficulty: str = typer.Option("Intermediate", help="Difficulty: Beginner, Intermediate, Advanced"),
    style: str = typer.Option("Mixed", help="Style: Conceptual, Vocabulary, Formula, Mixed"),
    max_cards: int = typer.Option(20, help="Maximum number of cards to generate"),
    images: bool = typer.Option(False, help="Enable AI image generation for cards")
):
    """
    Generate Anki flashcards from a text file.
    """
    if not os.path.exists(input_file):
        typer.echo(f"Error: Input file '{input_file}' not found.")
        raise typer.Exit(code=1)

    with open(input_file, "r", encoding="utf-8") as f:
        text = f.read()

    # Get API key from env
    api_key = os.getenv(f"{provider.upper()}_API_KEY")
    if provider != "ollama" and not api_key:
        typer.echo(f"Error: {provider.upper()}_API_KEY environment variable not set.")
        raise typer.Exit(code=1)

    typer.echo(f"Initializing {provider} client...")
    try:
        llm_client = get_llm_client(provider, api_key, model)
    except Exception as e:
        typer.echo(f"Error initializing LLM client: {e}")
        raise typer.Exit(code=1)

    generator = FlashcardGenerator(llm_client)
    config = DeckConfig(
        name=deck_name,
        difficulty=difficulty,
        style=style,
        max_cards=max_cards
    )

    typer.echo("Generating flashcards...")
    try:
        cards = generator.generate_flashcards(text, config)
        typer.echo(f"Generated {len(cards)} cards.")
    except Exception as e:
        typer.echo(f"Error generating cards: {e}")
        raise typer.Exit(code=1)

    image_map = {}
    if images:
        typer.echo("Generating images...")
        # Use Gemini for images as requested/default
        img_gen = get_image_generator("gemini", os.getenv("GEMINI_API_KEY"))
        
        if not img_gen:
             typer.echo("Warning: Could not initialize Image Generator (check GEMINI_API_KEY). Skipping images.")
        else:
            with tempfile.TemporaryDirectory() as temp_dir:
                for i, card in enumerate(cards):
                    if card.image_prompt:
                        typer.echo(f"  Generating image for card {i+1}...")
                        img_filename = f"card_{i}_{random.randint(1000,9999)}.png"
                        img_path = os.path.join(temp_dir, img_filename)
                        if img_gen.generate_image(card.image_prompt, img_path):
                            image_map[i] = img_path
                        else:
                            typer.echo(f"  Failed to generate image for card {i+1}")

                typer.echo("Creating Anki deck...")
                builder = AnkiDeckBuilder()
                builder.create_apkg_with_images(cards, deck_name, output, image_map)
                typer.echo(f"Success! Deck saved to {output}")
                return

    typer.echo("Creating Anki deck...")
    builder = AnkiDeckBuilder()
    builder.create_apkg(cards, deck_name, output)
    
    typer.echo(f"Success! Deck saved to {output}")

if __name__ == "__main__":
    app()
