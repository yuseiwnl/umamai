import {useCallback, useEffect, useMemo, useState} from 'react'
import {type FileError, type FileRejection, useDropzone} from 'react-dropzone'
import {useSupabaseSession} from "@/lib/supabase";
import {v4} from 'uuid';
import {useStore} from "@/lib/UseStore";
import { supabase } from '@/lib/supabase/client';
import { UploadPageValues } from '@/app/upload/page';

export default async function useSupabaseUpload(schema: UploadPageValues) {
const userId = useSupabaseSession()?.user.id

if (!userId) throw new Error("Missing user ID.");
  if (!schema.file) throw new Error("No image file provided.");

  // --- Date pathing ---
  const jst = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );
  const year = String(jst.getFullYear());
  const month = String(jst.getMonth() + 1).padStart(2, "0");
  const base = `users/${userId}`;
  const uuid = v4();

  // --- Upload file to your API endpoint ---
  const bucketName = "media-public";
  const path = `${base}/photos/${year}/${month}`;
  const objectKey = `${path}/${uuid}`;

  const form = new FormData();
  form.append("file", schema.file);
  form.append("bucket", bucketName);
  form.append("object_key", objectKey);
  form.append("cache_control", "3600");
  form.append("upsert", "false");

  const uploadResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/upload-image`,
    { method: "POST", body: form }
  );

  if (!uploadResponse.ok) {
    const msg = await uploadResponse.text().catch(() => "Upload failed");
    throw new Error(msg);
  }

  const uploaded = await uploadResponse.json();
  console.log("✅ Image uploaded:", uploaded);

  // --- Retrieve the selected restaurant from Zustand ---
  const { place } = useStore.getState();

  // --- Check or insert restaurant ---
  let restaurantId: number | null = null;
  if (place?.displayName) {
    const { data: existing, error: selectErr } = await supabase
      .from("restaurants")
      .select("id")
      .eq("name", place.displayName)
      .maybeSingle();

    if (selectErr) throw selectErr;
    restaurantId = existing?.id ?? null;

    if (!restaurantId) {
      const { data: inserted, error: insertErr } = await supabase
        .from("restaurants")
        .insert({
          name: place.displayName,
          address: place.formattedAddress,
          latitude: place.location?.lat(),
          longitude: place.location?.lng(),
          rating: place.rating,
          uuid: v4(),
        })
        .select("id")
        .single();

      if (insertErr) throw insertErr;
      restaurantId = inserted.id;
    }
  }

  // --- Insert menu item ---
  const insertPayload = {
    name: schema.name,
    description: schema.description,
    budget: schema.budget,
    uploaded_by: userId,
    restaurant_id: restaurantId,
    image_url: uploaded.signed_url,
    rating: 0,
    uuid,
  };

  const { error: insertErr } = await supabase
    .from("menu_items")
    .insert(insertPayload);

  if (insertErr) throw insertErr;

  console.log("✅ Menu item inserted successfully");
  return { success: true, uploaded };
}
