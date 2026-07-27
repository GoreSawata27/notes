import type { Metadata } from "next";
import StarRating from "./_components/StarRating";

export const metadata: Metadata = {
  title: "Star Rating",
};

export default function StarRatingPage() {
  return <StarRating />;
}
