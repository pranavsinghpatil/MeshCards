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
                    'qfmt': '{{Question}}<br>{{Image}}',
                    'afmt': '{{FrontSide}}<hr id="answer">{{Answer}}',
                },
            ])
        
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
            ])

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

    def create_apkg_with_images(self, cards: List[Flashcard], deck_name: str, output_path: str, image_map: dict = None):
        deck_id = random.randrange(1 << 30, 1 << 31)
        deck = genanki.Deck(deck_id, deck_name)
        media_files = []

        for i, card in enumerate(cards):
            tags = [t.replace(" ", "_") for t in card.tags]
            
            image_val = ""
            if image_map and i in image_map:
                img_path = image_map[i]
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
