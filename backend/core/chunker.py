"""
Text Chunking and Token Management
Optimized for minimal API costs
"""
import re
from typing import List, Tuple

def estimate_tokens(text: str, model: str = "gpt-4o") -> int:
    """
    Accurately count token count for text using tiktoken.
    Falls back to a safe len(text) // 3 if tiktoken is unavailable.
    """
    if not text:
        return 0
    try:
        import tiktoken
        try:
            encoding = tiktoken.encoding_for_model(model)
        except KeyError:
            encoding = tiktoken.get_encoding("cl100k_base")
        return len(encoding.encode(text, disallowed_special=()))
    except Exception:
        return max(1, len(text) // 3)

def extract_key_content(text: str, max_tokens: int = 25000) -> str:
    """
    Extract key content to reduce API costs while maintaining quality.
    Uses structural markers but falls back to context-rich snippets if markers are missing.
    """
    if not text:
        return ""
    
    # If document already fits within token limit, do not truncate or modify it
    char_limit = max_tokens * 4
    if len(text) <= char_limit:
        return text
        
    # Multilingual-safe definition extraction (English, Romance/Germanic languages, symbols)
    definitions = re.findall(
        r'([A-Z\u00C0-\u024F][a-z\u00C0-\u024F]+(?:\s+[A-Z\u00C0-\u024F][a-z\u00C0-\u024F]+)*)\s+(?:is|are|means|refers to|defined as|consists of|es|est|ist|son|\:|\-|\u2013|\u2014)\s+([^.!?\n]+[.!?])',
        text,
        re.MULTILINE
    )
    
    # Universal list/bullet structures
    bullet_points = re.findall(r'^[•\-\*\+\u2022\u2023\u25E6\u2043\u2219]\s*(.+)$', text, re.MULTILINE)
    numbered_points = re.findall(r'^\d+[\.\)]\s+(.+)$', text, re.MULTILINE)
    
    # Headings (markdown and uppercase headings in any language)
    headings = re.findall(r'^#{1,6}\s+(.+)$', text, re.MULTILINE)
    headings += re.findall(r'^([A-Z\u00C0-\u024F][A-Z\u00C0-\u024F\s]{5,})$', text, re.MULTILINE)
    
    # Emphasized/bold text
    emphasized = re.findall(r'\*\*(.+?)\*\*', text)
    
    key_content = []
    
    for term, definition in definitions[:50]:
        key_content.append(f"Definition: {term} - {definition}")
    
    for item in (bullet_points + numbered_points)[:50]:
        if len(item.strip()) > 6:
            key_content.append(f"Point: {item.strip()}")
            
    for heading in headings[:30]:
        key_content.append(f"\nSection: {heading.strip()}\n")
    
    for item in emphasized[:40]:
        if 5 < len(item) < 120:
            key_content.append(f"Important: {item}")
            
    combined_extracted = '\n'.join(key_content)
    
    # If regex extraction failed to find structured text (e.g., narrative document or non-English text),
    # return the full text so the caller falls back to sliding window chunking (Strategy 3)
    # instead of blindly slicing characters out of the middle.
    if len(combined_extracted) < 1000:
        return text
        
    if estimate_tokens(combined_extracted) > max_tokens:
        return combined_extracted[:char_limit]
        
    return combined_extracted if len(combined_extracted) > 200 else text[:char_limit]


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
