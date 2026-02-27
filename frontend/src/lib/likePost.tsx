import { createClient } from "./supabase/client";

const supabase = createClient();

export async function likePost(userId: string, menuItemId: string) {
  const { error } = await supabase
    .from("liked_posts")
    .insert([{ user_id: userId, menu_item_id: menuItemId }]);

  if (error) console.error("Failed to like post:", error);
}

export async function unlikePost(userId: string, menuItemId: string) {
  const { error } = await supabase
    .from("liked_posts")
    .delete()
    .eq("user_id", userId)
    .eq("menu_item_id", menuItemId);

  if (error) console.error("Failed to unlike post:", error);
}

export async function hasUserLiked(
  userId: string,
  menuItemId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("liked_posts")
    .select("id")
    .eq("user_id", userId)
    .eq("menu_item_id", menuItemId)
    .maybeSingle();

  if (error) {
    console.error("Error checking liked post:", error);
    return false;
  }

  return !!data; // true if found, false if null
}
