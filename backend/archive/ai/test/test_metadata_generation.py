import os
from app.gpt_parser import generate_food_metadata

output_dir = "outputs"
for filename in os.listdir(output_dir):
    if filename.endswith(".txt"):
        with open(os.path.join(output_dir, filename), encoding="utf-8") as f:
            text = f.read()
            metadata = generate_food_metadata(text)
            print(f"Metadata for {filename}:")
            print(metadata)
            print("\n---\n")