import asyncio
import os
from datetime import datetime
from urllib.parse import urljoin
from playwright.async_api import async_playwright
from supabase import create_client, Client
from dotenv import load_dotenv

# Load Supabase credentials
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

AREA_URLS = {
    "Shinjuku": "https://tabelog.com/tokyo/A1304/A130401/rstLst/",
    "Tokyo": "https://tabelog.com/tokyo/A1301/A130101/rstLst/",
    "Akihabara": "https://tabelog.com/tokyo/A1310/A131001/rstLst/",
    "Asakusa": "https://tabelog.com/tokyo/A1311/A131102/rstLst/",
    "Odaiba": "https://tabelog.com/tokyo/A1313/A131306/rstLst/",
    "Shinagawa": "https://tabelog.com/tokyo/A1315/A131501/rstLst/",
    "Shibuya": "https://tabelog.com/tokyo/A1303/A130301/rstLst/"
}

global_place_counter = 1

async def scrape_restaurants():
    global global_place_counter

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()

        for area, url in AREA_URLS.items():
            print(f"\n📍 Scraping area: {area}")
            page = await context.new_page()
            await page.goto(url)
            await page.wait_for_selector(".list-rst__wrap")

            restaurants = await page.query_selector_all(".list-rst__wrap")
            count = 0

            for restaurant in restaurants:
                if count >= 10:
                    break

                try:
                    rating_elem = await restaurant.query_selector(".c-rating__val")
                    rating_str = await rating_elem.text_content() if rating_elem else None
                    if not rating_str:
                        continue
                    rating = float(rating_str.strip())
                    if rating < 3.3:
                        continue

                    name_elem = await restaurant.query_selector(".list-rst__rst-name a")
                    name = await name_elem.text_content() if name_elem else None
                    detail_url = await name_elem.get_attribute("href") if name_elem else None
                    if not name or not detail_url:
                        continue

                    place_id = str(global_place_counter)
                    global_place_counter += 1

                    existing = supabase.table("restaurants").select("id").eq("place_id", place_id).execute()
                    if existing.data:
                        print(f"⚠️ Skipping duplicate place_id: {place_id}")
                        continue

                    detail_page = await context.new_page()
                    await detail_page.goto(detail_url)
                    await detail_page.wait_for_timeout(1500)

                    address_elem = await detail_page.query_selector(".rstinfo-table__address span")
                    address = await address_elem.text_content() if address_elem else None

                    desc_elem = await detail_page.query_selector(".rdheader-subname")
                    description = await desc_elem.text_content() if desc_elem else ""

                    restaurant_data = {
                        "name": name,
                        "place_id": place_id,
                        "address": address,
                        "rating": rating,
                        "description": description,
                        "location": area,
                        "created_at": datetime.utcnow().isoformat()
                    }
                    rest_response = supabase.table("restaurants").insert(restaurant_data).execute()
                    if not rest_response.data:
                        print(f"❌ Failed to insert restaurant: {name}")
                        await detail_page.close()
                        continue

                    restaurant_id = rest_response.data[0]['id']

                    # Insert default menu items
                    default_menu_items = [
                        {"name": "Chef's Recommendation", "description": "Top pick from the chef."},
                        {"name": "Lunch Set A", "description": "Includes main, side, and drink."},
                        {"name": "Seasonal Special", "description": "Rotating dish with seasonal ingredients."}
                    ]

                    for item in default_menu_items:
                        supabase.table("menu_items").insert({
                            "restaurant_id": restaurant_id,
                            "name": item["name"],
                            "description": item["description"],
                            "image_url": "",
                            "created_at": datetime.utcnow().isoformat(),
                            "updated_at": datetime.utcnow().isoformat(),
                            "classification": "menu"
                        }).execute()

                    # Scrape images from /smp2/ photo tab
                    await detail_page.goto(detail_url + "dtlphotolst/1/smp2/", wait_until="domcontentloaded", timeout=60000)
                    await detail_page.wait_for_timeout(2000)
                    imgs = await detail_page.query_selector_all("img")

                    count_img = 0
                    for img in imgs:
                        if count_img >= 10:
                            break
                        src = await img.get_attribute("data-original") or await img.get_attribute("src")
                        if not src:
                            continue
                        img_url = urljoin("https:", src)
                        supabase.table("menu_items").insert({
                            "restaurant_id": restaurant_id,
                            "name": f"{name} Image {count_img+1}",
                            "image_url": img_url,
                            "description": f"Photo {count_img+1} from {name}",
                            "created_at": datetime.utcnow().isoformat(),
                            "updated_at": datetime.utcnow().isoformat(),
                            "classification": "food"
                        }).execute()
                        count_img += 1

                    await detail_page.close()
                    count += 1
                    await page.wait_for_timeout(2000)

                except Exception as e:
                    print(f"⚠️ Error: {e}")
                    continue

        await browser.close()

if __name__ == "__main__":
    asyncio.run(scrape_restaurants())
