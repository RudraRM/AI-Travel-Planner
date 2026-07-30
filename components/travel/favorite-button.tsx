"use client";

import { Heart } from "@phosphor-icons/react";
import { useAppStore, useHasMounted } from "@/lib/store";
import { cn } from "@/lib/utils";

export function FavoriteButton({ slug, className }: { slug: string; className?: string }) {
  const mounted = useHasMounted();
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const active = mounted && favorites.includes(slug);

  return (
    <button
      type="button"
      aria-label={active ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(slug);
      }}
      className={cn(
        "focus-ring flex size-9 cursor-pointer items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 active:scale-90",
        active ? "bg-white/90 text-sunset-deep" : "bg-navy/30 text-white hover:bg-navy/50",
        className
      )}
    >
      <Heart size={17} weight={active ? "fill" : "regular"} />
    </button>
  );
}
