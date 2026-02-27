import requests
from .config import GOOGLE_API_KEY

def get_restaurant(location="35.7148,139.7967", radius=1000):
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": location,
        "radius": radius,
        "type": "restaurant",
        "opennow": True,
        "key": GOOGLE_API_KEY
    }
    response = requests.get(url, params=params).json()
    for r in response.get("results", []):
        if r.get("rating", 0) >= 4.0:
            return r["place_id"], r["name"]
    return None, None

def get_photo_references(place_id):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "photos",
        "key": GOOGLE_API_KEY
    }
    response = requests.get(url, params=params).json()
    return [p["photo_reference"] for p in response.get("result", {}).get("photos", [])][:10]

def get_image_url(photo_reference):
    return f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference={photo_reference}&key={GOOGLE_API_KEY}"