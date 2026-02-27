"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { createClient } from "../supabase/client";

interface DeleteButtonProps {
  menuItemId: string;
  className?: string;
}

const supabase = await createClient();
export default function DeleteButton({
  menuItemId,
  className,
}: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setLoading(true);

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("uuid", menuItemId);

    setLoading(false);
    setOpen(false);

    if (error) {
      alert(`Failed to delete: ${error.message}`);
      return;
    }

    router.back();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/50 text-white backdrop-blur hover:bg-red-600 transition ${className}`}
          aria-label="Delete"
        >
          <FaTrash className="w-5 h-5" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-60 bg-white text-gray-900">
        <p className="text-sm font-medium mb-3">
          Are you sure you want to delete this item?
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-8 px-3"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
