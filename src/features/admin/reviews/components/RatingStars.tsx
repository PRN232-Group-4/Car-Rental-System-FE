import { Star, StarHalf } from "lucide-react";

interface RatingStarsProps {
  rating: number; // 1 to 5 (e.g., 4, 4.5, 5)
  showNumber?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function RatingStars({
  rating,
  showNumber = true,
  size = "md",
  className = "",
}: RatingStarsProps) {
  const roundedRating = Math.max(0, Math.min(5, Number(rating) || 0));
  const fullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating % 1 >= 0.4 && roundedRating % 1 <= 0.8;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  const starSizeClass = sizeMap[size];

  return (
    <div
      role="img"
      aria-label={`${roundedRating} trên 5 sao`}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      {showNumber && (
        <span className="font-mono text-xs font-bold tabular-nums text-ink">
          {roundedRating.toFixed(1)}
        </span>
      )}

      <div className="flex items-center gap-0.5 text-primary" aria-hidden="true">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className={`${starSizeClass} fill-primary text-primary`} />
        ))}
        {hasHalfStar && (
          <StarHalf className={`${starSizeClass} fill-primary text-primary`} />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className={`${starSizeClass} text-line fill-transparent`} />
        ))}
      </div>
    </div>
  );
}
