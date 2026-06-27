import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  /** Seed berbeda -> gambar berbeda namun stabil (tidak ganti tiap reload). */
  seed?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  /** "photo" = foto placeholder (picsum); "gradient" = blok gradient tanpa network. */
  variant?: "photo" | "gradient";
  priority?: boolean;
};

// Gambar placeholder untuk membuat layar "hidup" sebelum asset final tersedia.
// Ganti src/variant dengan asset asli saat siap. Domain picsum diizinkan di next.config.mjs.
export function PlaceholderImage({
  seed = "hunian",
  alt,
  width = 800,
  height = 600,
  className,
  variant = "photo",
  priority = false,
}: Props) {
  if (variant === "gradient") {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 via-muted to-primary/5",
          className,
        )}
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <span className="text-xs font-medium text-muted-foreground">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={`https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-full rounded-xl bg-muted object-cover", className)}
    />
  );
}
