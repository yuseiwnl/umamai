from app.retrieve_restaurant import get_restaurant, get_photo_references, get_image_url
from app.ocr import download_image, run_ocr
from app.embedding import get_embedding
from app.rag import add_to_index, search

from app.config import OPENAI_API_KEY
import openai

openai.api_key = OPENAI_API_KEY

place_id, name = get_restaurant()
print("Using restaurant:", name)

photo_refs = get_photo_references(place_id)

for ref in photo_refs:
    url = get_image_url(ref)
    img = download_image(url)
    text = run_ocr(img)

    prompt = f"""
    Extract food items from the text below.
    For each item, output: 
    - name
    - description
    - tags (comma-separated keywords like 'fried', 'ramen', 'sweet')

    Text:
    {text}
    """

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a food menu parser."},
            {"role": "user", "content": prompt}
        ]
    )

    print("Metadata:\n", response.choices[0].message.content.strip())
    embedding = get_embedding(text)
    add_to_index(embedding, {"ocr_text": text, "image_url": url})

query = "karaage"
query_embedding = get_embedding(query)
results = search(query_embedding)

print("\nSearch Results:")
for item in results:
    print(item)
