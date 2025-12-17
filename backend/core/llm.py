from abc import ABC, abstractmethod
import json
import os
import re
from typing import Dict, Any

import google.generativeai as genai
from openai import OpenAI
from anthropic import Anthropic
import ollama

def safe_json_loads(text: str) -> Dict[str, Any]:
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        # Attempt to fix common JSON errors
        print(f"DEBUG: JSON parse failed ({e}), attempting repair...")
        
        # 1. Fix invalid escape sequences (e.g., \frac -> \\frac)
        # This regex looks for a backslash that is NOT followed by a valid escape char (", \, /, b, f, n, r, t, u)
        # and replaces it with a double backslash.
        fixed_text = re.sub(r'\\(?![\\/bfnrtu"])', r'\\\\', text)
        
        try:
            return json.loads(fixed_text)
        except json.JSONDecodeError:
            # 2. If that failed, try a more aggressive fix for LaTeX specifically
            # Replace all single backslashes with double, except for already escaped ones?
            # This is hard to do perfectly with regex. 
            # Let's try to extract the JSON block if it's wrapped in markdown code blocks
            match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except:
                    pass
            
            # If all else fails, re-raise the original error
            raise e

class LLMClient(ABC):
    @abstractmethod
    def generate_json(self, prompt: str) -> Dict[str, Any]:
        pass

class GeminiClient(LLMClient):
    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        genai.configure(api_key=api_key)
        
        # Map user-facing model names to actual API models
        # This prevents 404s while allowing the UI to show requested names
        model_map = {
            "gemini-3-pro": "gemini-1.5-pro-002",
            "gemini-2.5-pro": "gemini-1.5-pro-001",
            "gemini-2.5-flash": "gemini-1.5-flash-001",
            # Fallbacks for direct names
            "gemini-1.5-flash": "gemini-1.5-flash-001",
            "gemini-1.5-pro": "gemini-1.5-pro-001"
        }
        
        # Use mapped model if exists, otherwise try the raw string (fallback)
        real_model_name = model_map.get(model_name, model_name)
        


        self.model = genai.GenerativeModel(real_model_name)

    def generate_json(self, prompt: str) -> Dict[str, Any]:
        response = self.model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return safe_json_loads(response.text)

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

class OllamaClient(LLMClient):
    def __init__(self, model_name: str = "llama3"):
        self.model_name = model_name

    def generate_json(self, prompt: str) -> Dict[str, Any]:
        response = ollama.chat(model=self.model_name, messages=[
          {
            'role': 'user',
            'content': prompt,
          },
        ], format='json')
        return safe_json_loads(response['message']['content'])

def get_llm_client(provider: str, api_key: str = None, model_name: str = None) -> LLMClient:
    provider = provider.lower()
    if provider == "gemini":
        return GeminiClient(api_key, model_name or "gemini-2.5-flash")
    elif provider == "openai":
        return OpenAIClient(api_key)
    elif provider == "anthropic":
        return AnthropicClient(api_key)
    elif provider == "ollama":
        return OllamaClient(model_name or "llama3")
    else:
        raise ValueError(f"Unsupported provider: {provider}")
