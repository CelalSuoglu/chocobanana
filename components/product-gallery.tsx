"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

/** Swipeable product photos: scroll-snap on touch, arrows and dots on desktop. */
export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const many = images.length > 1;

  function go(next: number) {
    const el = track.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(images.length - 1, next));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={track}
        className="store-card flex aspect-square snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(event) => {
          const el = event.currentTarget;
          setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
        }}
        aria-roledescription={many ? "carousel" : undefined}
      >
        {images.map((src, i) => (
          <div key={src} className="relative h-full w-full shrink-0 snap-center">
            <Image
              src={src}
              alt={many ? `${alt} (${i + 1}/${images.length})` : alt}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        ))}
      </div>
      {many ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-xl text-chocolate shadow disabled:opacity-0 md:flex"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(index + 1)}
            disabled={index === images.length - 1}
            className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-xl text-chocolate shadow disabled:opacity-0 md:flex"
          >
            ›
          </button>
          <div className="mt-3 flex justify-center gap-2">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Photo ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === index ? "bg-chocolate" : "bg-chocolate/25"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
