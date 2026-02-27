"use client";

import { useSupabaseSession } from "@/lib/supabase";
import BackButton from "@/lib/ui/BackButton";
import DeleteButton from "@/lib/ui/DeleteButton";
import LikeButton from "@/lib/ui/LikeButton";
import Image from "next/image";

type DetailsImageProps = {
  id: string;
  src: string;
  userId: string;
};

export default function DetailsImage({ id, src, userId }: DetailsImageProps) {
  const currentId = useSupabaseSession()?.user.id;

  const isOwner = currentId === userId;

  return (
    <div className="relative w-screen aspect-square">
      <BackButton className="absolute top-4 left-4 z-1" />
      <LikeButton
        menuItemId={String(id)}
        className="absolute top-4 right-4 z-1"
      />
      {isOwner && (
        <DeleteButton
          menuItemId={String(id)}
          className="absolute top-4 right-16 z-10"
        />
      )}
      <Image
        src={src}
        alt="placeholder"
        fill
        className="object-cover"
        priority={true}
      />
    </div>
  );
}
