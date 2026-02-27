"use client";

import { useState, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { likePost, unlikePost, hasUserLiked } from "@/lib/likePost";
import { useSupabaseSession } from "../supabase";

interface LikeButtonProps {
  menuItemId: string;
  className?: string;
}

export default function LikeButton({ menuItemId, className }: LikeButtonProps) {
  const session = useSupabaseSession();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const checkLike = async () => {
      const user = session?.user;
      if (!user) return;

      const isLiked = await hasUserLiked(user.id, menuItemId);
      setLiked(isLiked);
    };

    checkLike();
  }, [session, menuItemId]);

  const handleToggleLike = async () => {
    const user = session?.user;
    if (!user?.email) {
      alert("You must be logged in to like posts.");
      return;
    }

    if (!user) return;

    if (liked) {
      await unlikePost(user.id, menuItemId);
      setLiked(false);
    } else {
      await likePost(user.id, menuItemId);
      setLiked(true);
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/50 text-white backdrop-blur hover:bg-black/70 transition ${className}`}
    >
      {liked ? (
        <FaHeart className="w-5 h-5 text-red-500" />
      ) : (
        <FaRegHeart className="w-5 h-5" />
      )}
    </button>
  );
}
