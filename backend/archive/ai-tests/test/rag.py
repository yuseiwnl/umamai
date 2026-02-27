import faiss

index = faiss.IndexFlatL2(1536)
food_items = []

def add_to_index(embedding, metadata):
    index.add(embedding.reshape(1, -1))
    food_items.append(metadata)

def search(query_embedding, k=3):
    D, I = index.search(query_embedding.reshape(1, -1), k)
    return [food_items[i] for i in I[0] if i < len(food_items)]