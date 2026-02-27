import { fetchLikedImages, ImageItem } from "@/lib/FetchImages";
import ImageGrid from "@/lib/ImageGrid";
import { createClient } from "@/lib/supabase/server";
import Header from "@/lib/ui/Header";
import { redirect } from "next/navigation";

export default async function LikedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  let uploadedImages: ImageItem[] = await fetchLikedImages(data.claims.sub);

  return (
    <div className="bg-white min-h-screen">
      <Header title={"Liked"} />
      <ImageGrid images={uploadedImages} />
    </div>
  );
}
