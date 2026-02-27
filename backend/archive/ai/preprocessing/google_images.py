import os
import sys
import requests
from dotenv import load_dotenv
from datetime import datetime
from supabase import create_client, Client

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not GOOGLE_API_KEY or not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERROR: One or more required environment variables are missing.")
    sys.exit(1)

# Setup Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Define locations with their coordinates
LOCATIONS = {
    "Asakusa": "35.712964,139.794189",
    "Ikebukuro": "35.729926,139.710388",
    "Shinjuku": "35.689521,139.700804",
    "Odaiba": "35.625478,139.775408",
    "Ginza": "35.671611,139.763965"
}

# --- Step 1: Get restaurants with 4.0+ stars in specified location ---
def get_restaurants(location_name, location_coords, radius=1000, max_results=100):
    try:
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            "location": location_coords,
            "radius": radius,
            "type": "restaurant",
            "opennow": True,
            "key": GOOGLE_API_KEY
        }
        print(f"🔍 Requesting restaurants from Google Places API for {location_name}...")
        
        restaurants = []
        while len(restaurants) < max_results:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            if "results" not in data:
                print("⚠️ Unexpected response format from Google API:", data)
                break

            for r in data["results"]:
                if r.get("rating", 0) >= 4.0:
                    restaurant = {
                        "place_id": r["place_id"],
                        "name": r["name"],
                        "address": r.get("vicinity", ""),
                        "latitude": r["geometry"]["location"]["lat"],
                        "longitude": r["geometry"]["location"]["lng"],
                        "rating": r.get("rating"),
                        "location": location_name,
                        "created_at": datetime.now().isoformat()
                    }
                    restaurants.append(restaurant)
                    print(f"✅ Found restaurant: {r['name']} | Rating: {r['rating']} | Location: {location_name}")

            if "next_page_token" not in data:
                break
                
            params["pagetoken"] = data["next_page_token"]
            # Google API requires a short delay between requests when using page tokens
            import time
            time.sleep(2)

        print(f"ℹ️ Found {len(restaurants)} restaurants in {location_name}")
        return restaurants

    except Exception as e:
        print(f"❌ ERROR during restaurant lookup for {location_name}: {e}")
        return []

# --- Step 2: Get photo references from Google ---
def get_photo_references(place_id):
    try:
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {
            "place_id": place_id,
            "fields": "photos",
            "key": GOOGLE_API_KEY
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        photos = data.get("result", {}).get("photos", [])
        return [p["photo_reference"] for p in photos][:10] if photos else []

    except Exception as e:
        print(f"❌ ERROR while fetching photo references: {e}")
        return []

# --- Step 3: Create URL from photo reference ---
def build_image_url(photo_ref):
    return f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference={photo_ref}&key={GOOGLE_API_KEY}"

# --- Main Execution ---
if __name__ == "__main__":
    print("🚀 Starting: Insert restaurants and image URLs to Supabase")

    for location_name, location_coords in LOCATIONS.items():
        print(f"\n📍 Processing location: {location_name}")
        
        # Get restaurants for this location
        restaurants = get_restaurants(location_name, location_coords)
        if not restaurants:
            print(f"❌ No suitable restaurants found in {location_name}")
            continue

        # Insert restaurants into Supabase
        print(f"📥 Inserting {len(restaurants)} restaurants into Supabase...")
        result = supabase.table("restaurants_test").insert(restaurants).execute()
        if result.data is None:
            print(f"❌ Failed to insert restaurants for {location_name}:", result.error)
            continue

        print(f"✅ Successfully inserted restaurants for {location_name}")

        # Process each restaurant's images
        for restaurant in result.data:
            restaurant_id = restaurant["id"]
            photo_refs = get_photo_references(restaurant["place_id"])
            
            if not photo_refs:
                print(f"ℹ️ No image references found for restaurant {restaurant['name']}")
                continue

            # Prepare and insert menu_items
            menu_items = []
            for ref in photo_refs:
                menu_items.append({
                    "restaurant_id": restaurant_id,
                    "name": "",
                    "description": "",
                    "image_url": build_image_url(ref),
                    "created_at": datetime.now().isoformat()
                })

            print(f"📥 Inserting image URLs for restaurant {restaurant['name']}...")
            insert_result = supabase.table("menu_items_test").insert(menu_items).execute()
            if insert_result.data is None:
                print(f"❌ Failed to insert menu items for restaurant {restaurant['name']}:", insert_result.error)
                continue

            print(f"✅ Successfully inserted {len(menu_items)} menu items for restaurant {restaurant['name']}")

    print("\n✨ All locations processed!")
