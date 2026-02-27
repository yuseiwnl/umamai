import os
from app.ocr import run_ocr_on_image

image_dir = "images"
for filename in os.listdir(image_dir):
    if filename.endswith(".jpg"):
        path = os.path.join(image_dir, filename)
        text = run_ocr_on_image(path)
        print(f"Extracted text from {filename}\n{text[:200]}...\n")