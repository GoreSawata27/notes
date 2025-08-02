import { useState } from "react";

export default function StarRating() {
  const [rating, setRating] = useState(0);

  const handleStarClick = (index: number) => {
    setRating(index + 1);
  };

  return (
    <div className="flex items-center gap-2">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          role="button"
          tabIndex={0}
          onClick={() => handleStarClick(i)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleStarClick(i);
          }}
          className="cursor-pointer text-2xl"
        >
          {i < rating ? "⭐" : "☆"}
        </span>
      ))}
      <span className="ml-2">Rating - {rating}</span>
    </div>
  );
}
