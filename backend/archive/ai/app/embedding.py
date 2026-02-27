import openai
import numpy as np
from .config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

def get_embedding(text):
    result = openai.Embedding.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return np.array(result['data'][0]['embedding'], dtype="float32")