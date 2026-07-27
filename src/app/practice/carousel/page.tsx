import type { Metadata } from "next";
import Carousel from "./_components/Carousel";
import { images } from "./_components/Data";

export const metadata: Metadata = {
  title: "Carousel",
};

export default function CarouselPage() {
  return <Carousel images={images} />;
}
