from abc import ABC, abstractmethod
import os
import google.generativeai as genai
from typing import Optional
import requests
import base64

class ImageGenerator(ABC):
    @abstractmethod
    def generate_image(self, prompt: str, output_path: str) -> bool:
        pass

class GeminiImageGenerator(ImageGenerator):
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = None

    def generate_image(self, prompt: str, output_path: str) -> bool:
        try:
            if hasattr(genai, 'ImageGenerationModel'):
                self.model = genai.ImageGenerationModel("imagen-3.0-generate-001")
                response = self.model.generate_images(
                    prompt=prompt,
                    number_of_images=1,
                )
                if response.images:
                    response.images[0].save(output_path)
                    return True
            else:
                print("ImageGenerationModel not found in SDK.")
                return False
            return False
        except Exception as e:
            print(f"Error generating image with Gemini: {e}")
            return False

class NanoBananaImageGenerator(ImageGenerator):
    """
    Uses a local Stable Diffusion API (like Automatic1111) or a compatible endpoint.
    Assuming standard SD API: POST /sdapi/v1/txt2img
    """
    def __init__(self, api_url: str = "http://127.0.0.1:7860"):
        self.api_url = api_url

    def generate_image(self, prompt: str, output_path: str) -> bool:
        try:
            payload = {
                "prompt": prompt,
                "steps": 20,
                "width": 512,
                "height": 512
            }
            response = requests.post(f"{self.api_url}/sdapi/v1/txt2img", json=payload)
            if response.status_code == 200:
                r = response.json()
                image_data = base64.b64decode(r['images'][0])
                with open(output_path, 'wb') as f:
                    f.write(image_data)
                return True
            else:
                print(f"NanoBanana Error: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"Error generating image with NanoBanana: {e}")
            return False

class MockImageGenerator(ImageGenerator):
    def generate_image(self, prompt: str, output_path: str) -> bool:
        from PIL import Image
        img = Image.new('RGB', (256, 256), color = 'red')
        img.save(output_path)
        return True

def get_image_generator(provider: str, api_key: str = None) -> Optional[ImageGenerator]:
    if provider == "gemini":
        return GeminiImageGenerator(api_key)
    elif provider == "nanobanana": # Or whatever local SD provider
        return NanoBananaImageGenerator()
    elif provider == "mock":
        return MockImageGenerator()
    return None
