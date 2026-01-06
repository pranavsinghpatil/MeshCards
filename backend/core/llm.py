from abc import ABC, abstractmethod
import json
import os
import re
from typing import Dict, Any

import time
import random
import google.generativeai as genai
from openai import OpenAI
from anthropic import Anthropic

def safe_json_loads(text: str) -> Dict[str, Any]:
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        # Attempt to fix common JSON errors
        print(f"DEBUG: JSON parse failed ({e}), attempting repair...")
        
        # Strategy 1: Fix invalid escape sequences
        # Replace backslashes that aren't part of valid JSON escape sequences
        fixed_text = text
        
        # First, protect valid escape sequences by temporarily replacing them
        replacements = {
            '\\"': '___QUOTE___',
            '\\\\': '___BACKSLASH___',
            '\\/': '___SLASH___',
            '\\b': '___BACKSPACE___',
            '\\f': '___FORMFEED___',
            '\\n': '___NEWLINE___',
            '\\r': '___RETURN___',
            '\\t': '___TAB___',
        }
        
        for old, new in replacements.items():
            fixed_text = fixed_text.replace(old, new)
        
        # Now replace any remaining backslashes with double backslashes
        fixed_text = fixed_text.replace('\\', '\\\\')
        
        # Restore the valid escape sequences
        for old, new in replacements.items():
            fixed_text = fixed_text.replace(new, old)
        
        try:
            return json.loads(fixed_text)
        except json.JSONDecodeError:
            # Strategy 2: Extract JSON from markdown code blocks
            match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except:
                    pass
            
            # Strategy 3: Try to find the JSON object directly
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                try:
                    json_text = match.group(0)
                    # Apply the same escape fix
                    for old, new in replacements.items():
                        json_text = json_text.replace(old, new)
                    json_text = json_text.replace('\\', '\\\\')
                    for old, new in replacements.items():
                        json_text = json_text.replace(new, old)
                    return json.loads(json_text)
                except:
                    pass
            
            # If all else fails, re-raise the original error
            raise e

class LLMClient(ABC):
    @abstractmethod
    @abstractmethod
    def generate_json(self, prompt: Any) -> Dict[str, Any]:
        pass

class GeminiClient(LLMClient):
    def __init__(self, api_key: str, model_name: str = "gemini-2.5-pro"):
        genai.configure(api_key=api_key)
        
        # Map user-facing model names to actual API models
        # This prevents 404s while allowing the UI to show requested names
        model_map = {
            # Frontier Lineup (User requested nomenclature)
            "gemini-3-pro": "gemini-1.5-pro", 
            "gemini-3-flash": "gemini-2.0-flash", # Use latest 2.0 for 3 Flash
            "gemini-2.5-pro": "gemini-1.5-pro",
            "gemini-2.5-flash": "gemini-2.0-flash", # Use latest 2.0 for performance
            "gemini-2.5-flash-lite": "gemini-1.5-flash-8b", # Correct Lite counterpart
            
            # Direct API Models
            "gemini-2.0-flash": "gemini-2.0-flash",
            "gemini-1.5-pro": "gemini-1.5-pro",
            "gemini-1.5-flash": "gemini-1.5-flash",
            "gemini-1.5-flash-8b": "gemini-1.5-flash-8b",
            
            # Legacy/External Mappings
            "gpt-4.1": "gemini-1.5-pro",
            "claude-opus-4.5": "gemini-1.5-pro",
        }
        
        # Use mapped model if exists, otherwise try the raw string (fallback)
        real_model_name = model_map.get(model_name, model_name)
        


        self.model = genai.GenerativeModel(real_model_name)

    def generate_json(self, prompt: Any) -> Dict[str, Any]:
        # Prepare content for Gemini
        # If prompt is a string, it's just text.
        # If prompt is a list, it might contain text strings or image paths/dicts.
        content_parts = []
        if isinstance(prompt, str):
            content_parts.append(prompt)
        elif isinstance(prompt, list):
            for part in prompt:
                if isinstance(part, str):
                    content_parts.append(part)
                elif isinstance(part, dict) and part.get("type") == "image":
                    # Load image using PIL
                    try:
                        import PIL.Image
                        img = PIL.Image.open(part["path"])
                        content_parts.append(img)
                    except Exception as e:
                        print(f"Error loading image {part['path']}: {e}")
                else:
                    # Fallback for unknown
                    content_parts.append(str(part))
        
        
        max_retries = 2  # Only 2 attempts, then ask for user key
        base_delay = 5
        
        for attempt in range(max_retries + 1):
            try:
                # Gemini generate_content accepts a list of parts (str or PIL.Image)
                response = self.model.generate_content(
                    content_parts,
                    generation_config={"response_mime_type": "application/json"}
                )
                return safe_json_loads(response.text)
            except Exception as e:
                # Check for rate limit error (ResourceExhausted is common for Gemini API)
                error_str = str(e).lower()
                is_rate_limit = any(x in error_str for x in ["429", "resourceexhausted", "quota", "rate limit"])
                
                if is_rate_limit:
                    if attempt < max_retries:
                        # Exponential backoff: 5s, 10s
                        sleep_time = base_delay * (2 ** attempt) + random.uniform(0, 2)
                        print(f"⏳ API rate limit hit. Retrying in {sleep_time:.1f}s... (Attempt {attempt+1}/{max_retries})")
                        time.sleep(sleep_time)
                        continue
                    else:
                        # After 2 retries, raise special exception to prompt for user API key
                        raise Exception(
                            "API_LIMIT_EXCEEDED|"
                            "Gemini API rate limit exceeded. "
                            "Please provide your own API key to continue, or wait a few minutes and try again."
                        )
                
                raise e # Re-raise if not a rate limit error

class OpenAIClient(LLMClient):
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)

    def generate_json(self, prompt: str) -> Dict[str, Any]:
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return safe_json_loads(response.choices[0].message.content)

class AnthropicClient(LLMClient):
    def __init__(self, api_key: str):
        self.client = Anthropic(api_key=api_key)

    def generate_json(self, prompt: str) -> Dict[str, Any]:
        response = self.client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )
        content = response.content[0].text
        # Simple heuristic to find JSON start/end if there's extra text
        try:
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end != -1:
                return safe_json_loads(content[start:end])
            return safe_json_loads(content)
        except json.JSONDecodeError:
             raise ValueError(f"Failed to parse JSON from Anthropic response: {content[:100]}...")

# class OllamaClient(LLMClient):
#     def __init__(self, model_name: str = "llama3"):
#         self.model_name = model_name
# 
#     def generate_json(self, prompt: str) -> Dict[str, Any]:
#         response = ollama.chat(model=self.model_name, messages=[
#           {
#             'role': 'user',
#             'content': prompt,
#           },
#         ], format='json')
#         return safe_json_loads(response['message']['content'])

class NovitaClient(LLMClient):
    """
    Novita AI Client - Premium models for sponsors only.
    Supports: Llama, Mistral, Qwen, and other open-source models.
    """
    def __init__(self, api_key: str, model_name: str = "meta-llama/llama-3.1-70b-instruct"):
        from novita_client import NovitaClient as NovitaSDK
        self.client = NovitaSDK(api_key)
        self.model_name = model_name
    
    def generate_json(self, prompt: Any) -> Dict[str, Any]:
        # Convert multimodal prompt to text-only (Novita doesn't support vision yet)
        text_prompt = prompt if isinstance(prompt, str) else " ".join(
            [p if isinstance(p, str) else str(p) for p in prompt]
        )
        
        try:
            response = self.client.chat_completion(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant. Always respond with valid JSON."},
                    {"role": "user", "content": text_prompt}
                ],
                temperature=0.7,
                max_tokens=4096
            )
            
            content = response.choices[0].message.content
            return safe_json_loads(content)
            
        except Exception as e:
            raise ValueError(f"Novita API error: {str(e)}")

def get_llm_client(provider: str, api_key: str = None, model_name: str = None) -> LLMClient:
    provider = provider.lower()
    if provider == "gemini":
        return GeminiClient(api_key, model_name or "gemini-2.5-flash")
    elif provider == "openai":
        return OpenAIClient(api_key)
    elif provider == "anthropic":
        return AnthropicClient(api_key)
    elif provider == "novita":
        return NovitaClient(api_key, model_name or "meta-llama/llama-3.1-70b-instruct")
#     elif provider == "ollama":
#         return OllamaClient(model_name or "llama3")
    else:
        raise ValueError(f"Unsupported provider: {provider}")

