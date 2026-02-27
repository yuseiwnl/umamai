import openai
from .config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

def generate_food_metadata(text):
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
    return response.choices[0].message.content.strip()