"""
Text Chunking and Token Management
Optimized for minimal API costs
"""
import re
from typing import List, Tuple

def estimate_tokens(text: str) -> int:
    """
    Estimate token count for text
    Rule of thumb: 1 token ≈ 4 characters
    """
    return len(text) // 4

def extract_key_content(text: str, max_tokens: int = 25000) -> str:
    """
    Extract only the most important content to reduce API costs
    This can reduce tokens by 60-80% while maintaining quality
    """
    # Find definitions (high value for flashcards)
    definitions = re.findall(
        r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|are|means|refers to|defined as)\s+([^.!?]+[.!?])',
        text,
        re.MULTILINE
    )
    
    # Find bullet points and lists (structured information)
    bullet_points = re.findall(r'[•\-\*]\s*(.+)', text)
    numbered_points = re.findall(r'\d+\.\s+(.+)', text)
    
    # Find headings (topic markers)
    headings = re.findall(r'^#{1,6}\s+(.+)$', text, re.MULTILINE)
    headings += re.findall(r'^([A-Z][A-Z\s]+)$', text, re.MULTILINE)  # ALL CAPS headings
    
    # Find bold/emphasized text (usually important)
    emphasized = re.findall(r'\*\*(.+?)\*\*', text)
    emphasized += re.findall(r'__(.+?)__', text)
    
    # Build key content (prioritize by importance)
    key_content = []
    
    # 1. Definitions (highest priority)
    for term, definition in definitions[:30]:
        key_content.append(f"{term}: {definition}")
    
    # 2. Headings with context
    for heading in headings[:15]:
        if len(heading.strip()) > 3:  # Skip very short headings
            key_content.append(f"\n## {heading.strip()}\n")
    
    # 3. Emphasized content
    for item in emphasized[:20]:
        if len(item) > 10:  # Skip very short items
            key_content.append(item)
    
    # 4. Bullet points
    for item in bullet_points[:25]:
        key_content.append(f"• {item}")
    
    # 5. Numbered points
    for item in numbered_points[:25]:
        key_content.append(item)
    
    # Combine and check token limit
    combined = '\n'.join(key_content)
    
    # If still too large, truncate
    if estimate_tokens(combined) > max_tokens:
        # Take only the most important parts
        combined = '\n'.join(key_content[:max_tokens // 100])
    
    return combined if combined else text[:max_tokens * 4]

def chunk_text(text: str, max_tokens: int = 25000) -> List[str]:
    """
    Split text into chunks that fit within token limits
    Smart splitting by paragraphs to maintain context
    """
    max_chars = max_tokens * 4
    
    # If text is small enough, return as-is
    if len(text) <= max_chars:
        return [text]
    
    chunks = []
    current_chunk = ""
    
    # Split by double newlines (paragraphs)
    paragraphs = text.split('\n\n')
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        
        # If this paragraph alone is too large, split it further
        if len(para) > max_chars:
            # Split by sentences
            sentences = re.split(r'([.!?]+\s+)', para)
            for sentence in sentences:
                if len(current_chunk) + len(sentence) > max_chars:
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                    current_chunk = sentence
                else:
                    current_chunk += sentence
        else:
            # Normal paragraph handling
            if len(current_chunk) + len(para) + 2 > max_chars:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = para + '\n\n'
            else:
                current_chunk += para + '\n\n'
    
    # Add final chunk
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    return chunks if chunks else [text]

def optimize_for_cost(text: str, max_tokens: int = 25000) -> Tuple[str, bool]:
    """
    Optimize text for minimal API cost
    Returns: (optimized_text, was_optimized)
    """
    estimated = estimate_tokens(text)
    
    # If small enough, no optimization needed
    if estimated < max_tokens:
        return text, False
    
    # Try semantic extraction first (cheapest option)
    extracted = extract_key_content(text, max_tokens)
    
    if estimate_tokens(extracted) < max_tokens:
        return extracted, True
    
    # If extraction still too large, return first chunk
    chunks = chunk_text(extracted, max_tokens)
    return chunks[0], True
