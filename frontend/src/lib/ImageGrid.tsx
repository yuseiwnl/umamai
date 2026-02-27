"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageItem } from "./FetchImages";

export default function ImageGrid({ images }: { images: ImageItem[] }) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {images.map((img) => (
        <div
          key={img.uuid}
          className="relative aspect-square w-full"
          onClick={() => router.push(`/details/${img.uuid}`)}
        >
          <Image
            src={img.image_url}
            alt={img.description || img.name || "Posted image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 33vw, 300px"
          />
        </div>
      ))}
    </div>
  );
}
