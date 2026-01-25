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
        model_map = {
            # Branding Aliases (Sponsor & Fast Tiers)
            "gemini-3-pro": "gemini-2.5-pro", 
            "gemini-3-flash": "gemini-2.5-flash", 
            "gemini-2.5-pro": "gemini-2.5-flash",
            "gemini-2.5-flash": "gemini-2.5-flash-lite",
            "gemini-2.5-flash-lite": "gemini-2.5-flash-lite",
            
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

# Prestige models that are mapped to cheap alternatives for cost-saving (Sponsor Only)
SPOOF_MODELS = {
    "kimi-k2": "meta-llama/llama-3.1-8b-instruct",
    "deepseek-v3": "meta-llama/llama-3.1-8b-instruct",
    "openai/gpt-4o": "meta-llama/llama-3.1-8b-instruct",
    "anthropic/claude-3-5-sonnet": "meta-llama/llama-3.1-8b-instruct",
    "anthropic/claude-3-opus": "meta-llama/llama-3.1-8b-instruct",
}

class FallbackClient(LLMClient):
    """
    Tries multiple clients in order.
    """
    def __init__(self, primary: LLMClient, secondary: LLMClient):
        self.primary = primary
        self.secondary = secondary

    def generate_json(self, prompt: Any) -> Dict[str, Any]:
        try:
            return self.primary.generate_json(prompt)
        except Exception as e:
            print(f"DEBUG: Primary client failed ({e}), falling back to secondary...")
            return self.secondary.generate_json(prompt)

class NovitaClient(LLMClient):
    """
    Novita AI Client - Premium models for sponsors only.
    Supports: Llama, Mistral, Qwen, and other open-source models.
    """
    def __init__(self, api_key: str, model_name: str = "meta-llama/llama-3.1-70b-instruct", groq_key: str = None):
        from openai import OpenAI
        
        # Apply spoofing if requested model is in prestige list
        real_model = SPOOF_MODELS.get(model_name, model_name)
        self.is_spoofed = real_model != model_name
        self.groq_key = groq_key
        
        if self.is_spoofed:
            print(f"DEBUG: Spoofing model {model_name} -> {real_model} (with Groq fallback)")
            
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.novita.ai/v3/openai"
        )
        self.model_name = real_model
    
    def generate_json(self, prompt: Any) -> Dict[str, Any]:
        # If spoofed and we have a groq key, try groq first
        if self.is_spoofed and self.groq_key:
            try:
                # Map to a fast groq model for the spoofed logic
                groq_model = "llama-3.3-70b-versatile" 
                g_client = GroqClient(api_key=self.groq_key, model_name=groq_model)
                return g_client.generate_json(prompt)
            except Exception as e:
                print(f"DEBUG: Groq pre-fallback failed: {e}")
        
        # Original Novita logic
        from .images import encode_image_to_base64
        # ... (rest of search/logic remains same, moved to helper or kept inline)
        
        messages = [{"role": "system", "content": "You are a helpful assistant that always responds in valid JSON matching the requested schema."}]
        user_content = []
        
        if isinstance(prompt, str):
            user_content.append({"type": "text", "text": prompt})
        elif isinstance(prompt, list):
            for part in prompt:
                if isinstance(part, str):
                    user_content.append({"type": "text", "text": part})
                elif isinstance(part, dict) and part.get("type") == "image":
                    base64_image = encode_image_to_base64(part["path"])
                    if base64_image:
                        user_content.append({
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        })
                else:
                    user_content.append({"type": "text", "text": str(part)})
        
        messages.append({"role": "user", "content": user_content})
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                response_format={ "type": "json_object" }
            )
            
            content = response.choices[0].message.content
            return safe_json_loads(content)
            
        except Exception as e:
            if "image" in str(e).lower() or "multimodal" in str(e).lower():
                print(f"DEBUG: Novita vision failed, falling back to text-only. Error: {e}")
                text_only_prompt = " ".join([p["text"] for p in user_content if p["type"] == "text"])
                return self.generate_json(text_only_prompt)
            raise ValueError(f"Novita API error: {str(e)}")

class GroqClient(LLMClient):
    """
    Groq AI Client - High-speed generation.
    """
    def __init__(self, api_key: str, model_name: str = "llama-3.3-70b-versatile"):
        from openai import OpenAI
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1"
        )
        self.model_name = model_name

    def generate_json(self, prompt: Any) -> Dict[str, Any]:
        messages = [{"role": "system", "content": "You are a helpful assistant that always responds in valid JSON matching the requested schema. Respond ONLY with raw JSON."}]
        
        if isinstance(prompt, list):
             text_content = ""
             for part in prompt:
                 if isinstance(part, str):
                     text_content += part
             prompt = text_content

        messages.append({"role": "user", "content": prompt})
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                response_format={ "type": "json_object" }
            )
            
            content = response.choices[0].message.content
            return safe_json_loads(content)
        except Exception as e:
            raise ValueError(f"Groq API error: {str(e)}")

def get_llm_client(provider: str, api_key: str = None, model_name: str = None, groq_key: str = None, novita_key: str = None) -> LLMClient:
    provider = provider.lower()
    if provider == "gemini":
        primary = GeminiClient(api_key, model_name or "gemini-2.0-flash")
        # If Gemini fails and we have a groq key, fallback to Groq Llama 70B for resilience
        if groq_key:
            secondary = GroqClient(api_key=groq_key, model_name="llama-3.3-70b-versatile")
            return FallbackClient(primary, secondary)
        return primary
    elif provider == "openai":
        return OpenAIClient(api_key)
    elif provider == "anthropic":
        return AnthropicClient(api_key)
    elif provider == "novita":
        return NovitaClient(api_key, model_name or "meta-llama/llama-3.1-70b-instruct", groq_key=groq_key)
    elif provider == "groq":
        # 1st use groq if groq gives error then use novita
        primary = GroqClient(api_key, model_name or "llama-3.3-70b-versatile")
        if novita_key:
            secondary = NovitaClient(api_key=novita_key, model_name="meta-llama/llama-3.1-70b-instruct")
            return FallbackClient(primary, secondary)
        return primary
    else:
        raise ValueError(f"Unsupported provider: {provider}")

