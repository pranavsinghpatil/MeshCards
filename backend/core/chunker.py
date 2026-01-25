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
    Extract key content to reduce API costs while maintaining quality.
    Uses structural markers but falls back to context-rich snippets if markers are missing.
    """
    if not text:
        return ""
        
    # Find definitions
    definitions = re.findall(
        r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|are|means|refers to|defined as|consists of)\s+([^.!?]+[.!?])',
        text,
        re.MULTILINE
    )
    
    # Find list structures
    bullet_points = re.findall(r'^[•\-\*]\s*(.+)$', text, re.MULTILINE)
    numbered_points = re.findall(r'^\d+\.\s+(.+)$', text, re.MULTILINE)
    
    # Find headings
    headings = re.findall(r'^#{1,6}\s+(.+)$', text, re.MULTILINE)
    headings += re.findall(r'^([A-Z][A-Z\s]{5,})$', text, re.MULTILINE)  # ALL CAPS headings (min 5 chars)
    
    # Find bold/emphasized text
    emphasized = re.findall(r'\*\*(.+?)\*\*', text)
    
    # Build key content
    key_content = []
    
    # 1. Definitions
    for term, definition in definitions[:40]:
        key_content.append(f"Definition: {term} - {definition}")
    
    # 2. Structural points
    for item in (bullet_points + numbered_points)[:40]:
        if len(item.strip()) > 8:
            key_content.append(f"Point: {item.strip()}")
            
    # 3. Headings with context (try to find the paragraph following the heading)
    for heading in headings[:20]:
        key_content.append(f"\nSection: {heading.strip()}\n")
    
    # 4. Bold items
    for item in emphasized[:30]:
        if 5 < len(item) < 100:
            key_content.append(f"Important: {item}")
            
    # CHECK: If we extracted very little, the document might be unstructured
    # Fallback to taking the first 40% and last 20% of the text
    combined_extracted = '\n'.join(key_content)
    
    if len(combined_extracted) < 1000 and len(text) > 2000:
        # Document doesn't match our regex well, use a hybrid approach
        intro_cutoff = int(len(text) * 0.4)
        outro_start = int(len(text) * 0.8)
        
        fallback_text = text[:intro_cutoff] + "\n\n... [Skipped Middle Section] ...\n\n" + text[outro_start:]
        return fallback_text[:max_tokens * 4]
        
    # If we have extracted content, make sure it doesn't exceed limit
    if estimate_tokens(combined_extracted) > max_tokens:
        # Smart truncate: keep definitions and structural points first
        return combined_extracted[:max_tokens * 4]
        
    return combined_extracted if len(combined_extracted) > 200 else text[:max_tokens * 4]

def chunk_text(text: str, max_tokens: int = 25000, overlap_percent: float = 0.15) -> List[str]:
    """
    Split text into chunks with a sliding window overlap.
    Default overlap: 15%
    """
    max_chars = max_tokens * 4
    overlap_chars = int(max_chars * overlap_percent)
    
    if len(text) <= max_chars:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        # Calculate end point
        end = min(start + max_chars, len(text))
        
        # If we're not at the very end, try to find a natural breaking point
        if end < len(text):
            # Try to break at a double newline first
            last_break = text.rfind('\n\n', start + max_chars // 2, end)
            if last_break == -1:
                # Then single newline
                last_break = text.rfind('\n', start + max_chars // 2, end)
            if last_break == -1:
                # Then a sentence break
                last_break = text.rfind('. ', start + max_chars // 2, end)
            
            if last_break != -1:
                end = last_break
        
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        
        # Move start point back by overlap amount for the next chunk
        start = end - overlap_chars
        
        # Safety check: if start hasn't moved forward, force move it
        if start <= chunks[-1].find(text[start:start+10]):
              start = end # Fallback
        
        # If the remaining text is smaller than overlap, we're done
        if len(text) - start < overlap_chars:
            break
            
    return chunks if chunks else [text]

def optimize_for_cost(text: str, max_tokens: int = 25000) -> Tuple[str, bool]:
    """
    Optimize text for minimal API cost.
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
    
    # If extraction still too large, return first chunk with overlap logic context
    chunks = chunk_text(extracted, max_tokens)
    return chunks[0], True
