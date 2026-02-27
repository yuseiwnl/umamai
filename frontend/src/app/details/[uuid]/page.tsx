import { createClient } from "@/lib/supabase/server";
import DetailsImage from "../components/DetailsImage";
import DetailsModal from "../components/DetailsModal";
import { ImageResponse } from "next/server";

export default async function DetailsPage(props: {
  params: Promise<{ uuid: string }>;
}) {
  const supabase = await createClient();
  const { uuid } = await props.params;

  const { data: image, error } = await supabase
    .from("menu_items")
    .select(
      "image_url, name, description, restaurants(name, address, latitude, longitude), uploaded_by, uuid"
    )
    .eq("uuid", uuid)
    .single<{
      uuid: string;
      image_url: string;
      name: string;
      description: string;
      restaurants: {
        name: string;
        address: string;
        latitude: number;
        longitude: number;
      };
      uploaded_by: string;
    }>();

  if (error || !image) {
    console.error("Supabase fetch error:", error);
    return [];
  }

  return (
    <>
      <DetailsImage
        id={image.uuid}
        src={image.image_url}
        userId={image.uploaded_by}
      />
      <DetailsModal
        uuid={image.uuid}
        image_url={image.image_url}
        name={image.name}
        description={image.description}
        restaurant={image.restaurants}
      />
    </>
  );
}
