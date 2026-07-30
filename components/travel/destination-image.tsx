"use client";

import * as React from "react";
import Image from "next/image";
import { imageUrl } from "@/lib/data/destinations";
import { cn } from "@/lib/utils";

interface DestinationImageProps {
  seed: string;
  alt: string;
  palette: { from: string; to: string };
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Destination photography with a graceful degradation path: a tinted
 * gradient renders instantly (and stays if the network image fails),
 * the photo fades in over it once loaded.
 */
export function DestinationImage({
  seed,
  alt,
  palette,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  className,
}: DestinationImageProps) {
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{ backgroundImage: `linear-gradient(140deg, ${palette.from}, ${palette.to})` }}
    >
      {!failed && (
        <Image
          src={imageUrl(seed)}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "object-cover transition-opacity duration-700",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
      {/* Legibility scrim for overlaid text */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-navy/10 to-transparent" />
    </div>
  );
}
