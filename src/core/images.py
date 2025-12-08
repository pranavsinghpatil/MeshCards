from abc import ABC, abstractmethod
import os
import google.generativeai as genai
from typing import Optional

class ImageGenerator(ABC):
    @abstractmethod
    def generate_image(self, prompt: str, output_path: str) -> bool:
        pass

class GeminiImageGenerator(ImageGenerator):
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        # Fallback or check availability
        self.model = None

    def generate_image(self, prompt: str, output_path: str) -> bool:
        try:
            # Experimental: Try using the model directly if class not found
            # or use a different method.
            # For now, let's print available attributes to debug
            # print(dir(genai))
            
            # If ImageGenerationModel is not available, we can't use it.
            # Let's try to instantiate it dynamically or catch error.
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
                print("ImageGenerationModel not found in SDK. Please upgrade google-generativeai.")
                return False
            return False
        except Exception as e:
            print(f"Error generating image with Gemini: {e}")
            return False

class MockImageGenerator(ImageGenerator):
    def generate_image(self, prompt: str, output_path: str) -> bool:
        # Create a simple colored square for testing
        from PIL import Image
        img = Image.new('RGB', (256, 256), color = 'red')
        img.save(output_path)
        return True

def get_image_generator(provider: str, api_key: str = None) -> Optional[ImageGenerator]:
    if provider == "gemini":
        return GeminiImageGenerator(api_key)
    elif provider == "mock":
        return MockImageGenerator()
    return None
