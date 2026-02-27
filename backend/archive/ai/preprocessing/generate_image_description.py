import os
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client
from PIL import Image
import requests
from io import BytesIO

import torch
from transformers import BlipProcessor, BlipForQuestionAnswering

# Load environment
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
assert SUPABASE_URL and SUPABASE_KEY, "❌ Missing Supabase credentials in .env"

# Init Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load BLIP model and processor (local)
print("🧠 Loading BLIP model...")
from transformers import BlipProcessor, BlipForQuestionAnswering

print("🧠 Loading BLIP VQA model...")
device = "cuda" if torch.cuda.is_available() else "cpu"
processor = BlipProcessor.from_pretrained("Salesforce/blip-vqa-base")
model = BlipForQuestionAnswering.from_pretrained("Salesforce/blip-vqa-base").to(device)


# Step 1: Fetch all image URLs
def fetch_images():
    print("🔍 Fetching images from Supabase...")
    response = supabase.table("menu_items_test").select("id, image_url").execute()
    return response.data if response and response.data else []

# Step 2: Generate description from image
def describe_image(url: str) -> str:
    try:
        response = requests.get(url)
        image = Image.open(BytesIO(response.content)).convert("RGB")

        question = "Describe this food in detail"
        inputs = processor(image, question, return_tensors="pt").to(device)
        out = model.generate(**inputs)
        answer = processor.decode(out[0], skip_special_tokens=True)
        return answer

    except Exception as e:
        print(f"❌ Error processing {url}: {e}")
        return ""

# Step 3: Update Supabase table
def update_descriptions():
    images = fetch_images()
    for img in images:
        description = describe_image(img["image_url"])
        if description:
            print(f"🖼 {img['image_url']}\n → {description}")
            supabase.table("menu_items_test").update({
                "description": description,
                "updated_at": datetime.now().isoformat()
            }).eq("id", img["id"]).execute()

# Run the process
if __name__ == "__main__":
    update_descriptions()
