import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileHeader from "./components/ProfileHeader";
import ProfileStats from "./components/ProfileStats";
import ProfileBio from "./components/ProfileBio";
import ImageGrid from "@/lib/ImageGrid";
import { fetchUploadedImages, ImageItem } from "@/lib/FetchImages";
import Header from "@/lib/ui/Header";

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const user = data.claims.user_metadata; // user_metadata under JWTPayload
  const username = user.full_name;
  const avatarUrl = user.avatar_url;

  let uploadedImages: ImageItem[] = await fetchUploadedImages(data.claims.sub);

  return (
    <div className="bg-white min-h-screen">
      <Header title={"Profile"} />
      <div className="min-h-screen flex justify-center py-10">
        <div className="w-full space-y-4">
          <div className="mx-auto w-fit space-y-4 text-center">
            <ProfileHeader name={username} avatarUrl={avatarUrl} />
            {/*
            <ProfileStats postsCount={0} />
            <ProfileBio text="Vibe Coder TM" />
            */}
          </div>
          <ImageGrid images={uploadedImages} />
        </div>
      </div>
    </div>
  );
}
