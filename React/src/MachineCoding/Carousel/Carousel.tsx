import { useState } from "react";

interface Image {
  src: string;
  alt: string;
}

interface CarouselProps {
  images: Image[];
}

export default function Carousel({ images }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    if (currentIndex < 1) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex === images.length - 1) return;
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="text-center">
      <img
        className="h-72 w-96 object-cover mx-auto"
        src={images[currentIndex].src}
        alt={images[currentIndex].alt}
      />

      <div className="flex justify-center gap-4 mt-4">
        <button onClick={handlePrev} disabled={currentIndex === 0}>
          Prev
        </button>
        <button onClick={handleNext} disabled={currentIndex === images.length - 1}>
          Next
        </button>
      </div>
    </div>
  );
}
