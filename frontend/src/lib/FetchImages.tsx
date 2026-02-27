import { createClient } from "./supabase/server";

export type ImageItem = {
  uuid: string;
  image_url: string;
  name: string;
  description: string;
  restaurant: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
};

export async function fetchImages({
  limit = 20,
  offset = 0,
}: { limit?: number; offset?: number } = {}): Promise<ImageItem[]> {
  const normalizedLimit = Number.isFinite(limit)
    ? Math.max(0, Math.floor(limit!))
    : 20;
  const normalizedOffset = Number.isFinite(offset)
    ? Math.max(0, Math.floor(offset!))
    : 0;

  if (normalizedLimit === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select(
      "id, restaurants(name, address), name, description, image_url, uuid"
    )
    .order("id", { ascending: false })
    .range(normalizedOffset, normalizedOffset + normalizedLimit - 1);

  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }

  return data.map((item: any) => ({
    uuid: item.uuid,
    image_url: item.image_url,
    name: item.name,
    description: item.description,
    restaurant: item.restaurants,
  }));
}

export async function fetchLikedImages(userId: string): Promise<ImageItem[]> {
  const supabase = await createClient();
  const { data: likedItems, error: likedError } = await supabase
    .from("liked_posts")
    .select("menu_item_id")
    .eq("user_id", userId);

  if (likedError || !likedItems?.length) return [];

  const menuItemIds = likedItems.map((i) => i.menu_item_id);
  console.log(menuItemIds);

  const { data: menuItems, error: menuError } = await supabase
    .from("menu_items")
    .select("restaurants(name, address), name, description, image_url, uuid")
    .in("uuid", menuItemIds);

  if (menuError || !menuItems) return [];

  return menuItems.map((item: any) => ({
    uuid: item.uuid,
    image_url: item.image_url,
    name: item.name,
    description: item.description,
    restaurant: item.restaurants,
  }));
}

export async function fetchUploadedImages(
  userId: string
): Promise<ImageItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("restaurants(name, address), name, description, image_url, uuid")
    .eq("uploaded_by", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Supabase fetch error (uploaded images):", error);
    return [];
  }

  return data.map((item: any) => ({
    uuid: item.uuid,
    image_url: item.image_url,
    name: item.name,
    description: item.description,
    restaurant: item.restaurants,
  }));
}
