import genanki
from typing import List
from .schemas import Flashcard
import random
import os
import uuid

class AnkiDeckBuilder:
    def __init__(self):
        # Basic Model
        self.basic_model = genanki.Model(
            1607392319,
            'MeshCards Basic',
            fields=[
                {'name': 'Question'},
                {'name': 'Answer'},
                {'name': 'Image'},
            ],
            templates=[
                {
                    'name': 'Card 1',
                    'qfmt': '<div style="text-align: center;">{{Question}}</div><br>{{Image}}',
                    'afmt': '{{FrontSide}}<hr id="answer"><div style="text-align: center;">{{Answer}}</div>',
                },
            ],
            css='.card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; }\n.mathjx { font-size: 1.2em; }'
        )
        
        # Cloze Model
        self.cloze_model = genanki.Model(
            998877661,
            'MeshCards Cloze',
            model_type=genanki.Model.CLOZE,
            fields=[
                {'name': 'Text'},
                {'name': 'Extra'},
                {'name': 'Image'},
            ],
            templates=[
                {
                    'name': 'Cloze',
                    'qfmt': '{{cloze:Text}}<br>{{Image}}',
                    'afmt': '{{cloze:Text}}<br>{{Image}}<br><hr>{{Extra}}',
                },
            ],
            css='.card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; }\n.cloze { font-weight: bold; color: blue; }'
        )

    def create_apkg(self, cards: List[Flashcard], deck_name: str, output_path: str):
        # Generate a random deck ID
        deck_id = random.randrange(1 << 30, 1 << 31)
        deck = genanki.Deck(deck_id, deck_name)
        print(f"DEBUG: Creating deck '{deck_name}' with ID {deck_id}")

        for i, card in enumerate(cards):
            tags = [t.replace(" ", "_") for t in card.tags]
            print(f"DEBUG: Adding card {i+1}: {card.front[:30]}...")
            
            if card.type == "cloze":
                note = genanki.Note(
                    model=self.cloze_model,
                    fields=[card.front, card.back, ""],
                    tags=tags,
                    guid=str(uuid.uuid4())
                )
            else:
                note = genanki.Note(
                    model=self.basic_model,
                    fields=[card.front, card.back, ""],
                    tags=tags,
                    guid=str(uuid.uuid4())
                )
            deck.add_note(note)

        print(f"DEBUG: Writing deck with {len(deck.notes)} notes to {output_path}")
        genanki.Package(deck).write_to_file(output_path)

    def _validate_media_path(self, img_path: str) -> str:
        import tempfile
        real_path = os.path.realpath(img_path)
        allowed_dirs = [os.path.realpath(tempfile.gettempdir()), os.path.realpath(os.getcwd())]
        if not any(os.path.commonpath([real_path, d]) == d for d in allowed_dirs):
            raise ValueError(f"Security error: Media path '{img_path}' is outside allowed directories.")
        if not os.path.isfile(real_path):
            raise FileNotFoundError(f"Media file not found: {img_path}")
        return real_path

    def create_apkg_with_images(self, cards: List[Flashcard], deck_name: str, output_path: str, image_map: dict = None):
        deck_id = random.randrange(1 << 30, 1 << 31)
        deck = genanki.Deck(deck_id, deck_name)
        media_files = []

        for i, card in enumerate(cards):
            tags = [t.replace(" ", "_") for t in card.tags]
            
            image_val = ""
            if image_map and i in image_map:
                img_path = self._validate_media_path(image_map[i])
                img_filename = os.path.basename(img_path)
                image_val = f'<img src="{img_filename}">'
                media_files.append(img_path)

            if card.type == "cloze":
                note = genanki.Note(
                    model=self.cloze_model,
                    fields=[card.front, card.back, image_val],
                    tags=tags,
                    guid=str(uuid.uuid4())
                )
            else:
                note = genanki.Note(
                    model=self.basic_model,
                    fields=[card.front, card.back, image_val],
                    tags=tags,
                    guid=str(uuid.uuid4())
                )
            deck.add_note(note)

        package = genanki.Package(deck)
        if media_files:
            package.media_files = media_files
        package.write_to_file(output_path)
