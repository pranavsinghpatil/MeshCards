# Gemini Vision API Integration

## Overview
MeshCards now supports **image-based flashcard generation** using Gemini's vision capabilities. Users can upload screenshots, diagrams, notes, or any educational images and generate flashcards from them.

## Supported Image Formats
- `.png`
- `.jpg` / `.jpeg`
- `.webp`
- `.gif`
- `.bmp`

## How It Works

### 1. Image Detection
When a user uploads files, the backend automatically detects image files by their extension and processes them differently from text files.

### 2. Vision Processing
- Images are passed directly to Gemini's vision-capable models
- The AI "sees" the image content and extracts educational information
- Flashcards are generated based on visual content (diagrams, formulas, text in images, etc.)

### 3. Multimodal Prompts
The system creates a multimodal prompt containing:
- Text instructions for the AI
- One or more images
- Configuration (difficulty, style, max cards)

## Usage

### For Users
1. Click "Upload Files" in the Studio
2. Select one or more image files
3. (Optional) Add text instructions or context
4. Click "Generate Deck"
5. AI analyzes the images and creates flashcards

### Examples
- **Screenshot of lecture slides** → Flashcards about key concepts
- **Diagram of cell structure** → Q&A about cell components
- **Handwritten notes** → Flashcards from the notes
- **Formula sheet** → Cards testing formula knowledge
- **Infographic** → Cards about the information presented

## Technical Implementation

### Backend Changes

#### `backend/main.py`
- Detects image files during upload
- Stores image paths separately from text content
- Passes images to vision-capable models

#### `backend/core/generator.py`
- New method: `generate_flashcards_multimodal()`
- Builds vision-specific prompts
- Handles multimodal content (text + images)

#### `backend/core/llm.py`
- Already supported multimodal input
- Uses PIL to load images
- Passes images to Gemini API

### Flow Diagram
```
User uploads image
    ↓
Backend detects image file
    ↓
Image stored temporarily
    ↓
Multimodal prompt created (instruction + image)
    ↓
Sent to Gemini Vision API
    ↓
AI analyzes image content
    ↓
Flashcards generated
    ↓
Temporary image cleaned up
```

## Limitations

### Current
- Only works with Gemini models (vision-capable)
- OpenAI/Claude not yet supported for images
- No OCR fallback for non-vision models

### Future Enhancements
- [ ] Support OpenAI GPT-4 Vision
- [ ] Add Claude Vision support
- [ ] OCR fallback for other providers
- [ ] Multiple image support (already implemented!)
- [ ] Image preprocessing (rotation, enhancement)

## Best Practices

### For Best Results
1. **Clear images**: Use high-resolution, well-lit images
2. **Focused content**: One topic per image works best
3. **Add context**: Provide text instructions with images
4. **Readable text**: Ensure any text in images is legible

### What Works Well
- ✅ Lecture slides
- ✅ Textbook diagrams
- ✅ Handwritten notes (if clear)
- ✅ Charts and graphs
- ✅ Formula sheets
- ✅ Infographics

### What Might Not Work
- ❌ Very blurry images
- ❌ Images with no educational content
- ❌ Extremely complex diagrams without context
- ❌ Images with tiny, unreadable text

## Error Handling

### No Cards Generated
If the AI returns 0 cards from an image:
- Image might be unclear or not educational
- Try adding text context/instructions
- Check image quality and resolution
- Ensure image contains learnable content

### Supported Models
Only Gemini models support vision currently. If using OpenAI/Claude, images will be skipped.

## Testing

### Test Cases
1. Upload a screenshot of lecture slides → Should generate relevant cards
2. Upload a diagram → Should create Q&A about diagram elements
3. Upload multiple images → Should analyze all images
4. Upload image + text → Should combine both sources
5. Upload non-image file → Should process as text normally
