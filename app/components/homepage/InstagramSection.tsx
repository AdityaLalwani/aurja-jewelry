"use client";

import Script from "next/script";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type UIEvent,
} from "react";
import { home, site } from "@/lib/site";
import { ArrowRightIcon, InstagramIcon } from "../icons";

declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process: () => void;
      };
    };
  }
}

const posts = [
  "https://www.instagram.com/p/DfEzkeCDTEZ/",
  "https://www.instagram.com/p/De_I63cDZK_/",
  "https://www.instagram.com/p/De6UvgklHNV/",
  "https://www.instagram.com/p/DeteCd0DVXX/",
  "https://www.instagram.com/reel/De00eI8Nzu0/",
  "https://www.instagram.com/reel/DeqwJsxhwEo/",
];

const carouselPosts = [
  { postUrl: posts[posts.length - 1], position: 0 },
  ...posts.map((postUrl, index) => ({ postUrl, position: index + 1 })),
  { postUrl: posts[0], position: posts.length + 1 },
];

export function InstagramSection() {
  const { instagram } = home;
  const profileUrl = `https://instagram.com/${site.instagram}`;
  const carouselRef = useRef<HTMLDivElement>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activePosition, setActivePosition] = useState(1);

  const scrollToPosition = useCallback(
    (position: number, behavior: ScrollBehavior = "smooth") => {
      const carousel = carouselRef.current;
      const card = carousel?.querySelector<HTMLElement>(
        `[data-slide-position="${position}"]`,
      );
      if (!carousel || !card) return;

      const carouselCenter =
        carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
      const cardCenter =
        card.getBoundingClientRect().left + card.offsetWidth / 2;

      carousel.scrollTo({
        left: carousel.scrollLeft + cardCenter - carouselCenter,
        behavior,
      });
    },
    [],
  );

  useEffect(() => {
    scrollToPosition(1, "instant");

    return () => {
      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current);
      }
    };
  }, [scrollToPosition]);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const carousel = event.currentTarget;
    const center = carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
    const cards = carousel.querySelectorAll<HTMLElement>("[data-slide-position]");
    let nearestPosition = 1;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card) => {
      const cardCenter = card.getBoundingClientRect().left + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPosition = Number(card.dataset.slidePosition);
      }
    });

    const normalizedIndex =
      nearestPosition === 0
        ? posts.length - 1
        : nearestPosition === posts.length + 1
          ? 0
          : nearestPosition - 1;
    setActivePosition(nearestPosition);
    setActiveIndex((currentIndex) =>
      currentIndex === normalizedIndex ? currentIndex : normalizedIndex,
    );

    if (settleTimerRef.current !== null) {
      clearTimeout(settleTimerRef.current);
    }

    settleTimerRef.current = setTimeout(() => {
      if (nearestPosition === 0) {
        scrollToPosition(posts.length, "instant");
      } else if (nearestPosition === posts.length + 1) {
        scrollToPosition(1, "instant");
      }
    }, 140);
  }

  return (
    <section
      id="social"
      className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24"
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex -rotate-2 items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-amber-800 shadow-sm">
          <InstagramIcon className="h-4 w-4" />
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em]">
            @{site.instagram}
          </span>
        </div>
        <h2 className="mt-4 font-display text-3xl font-normal leading-tight text-stone-900 sm:text-4xl">
          {instagram.heading}
          <span className="ml-2 inline-block rotate-6 text-amber-700">✳</span>
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-stone-600">
          A little sparkle, a little studio magic, and all the stories in between.
        </p>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-5 inline-flex items-center gap-3 border-b border-stone-400 pb-2 text-xs font-medium uppercase tracking-[0.16em] text-stone-800 transition-colors hover:border-amber-700 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/60"
        >
          {instagram.followLabel}
          <span aria-hidden className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </a>
      </div>

      <div
        ref={carouselRef}
        className="instagram-carousel mt-8 sm:mt-10"
        onScroll={handleScroll}
        role="region"
        aria-label="Instagram posts"
        aria-roledescription="carousel"
      >
        {carouselPosts.map(({ postUrl, position }) => {
          const index =
            position === 0
              ? posts.length - 1
              : position === posts.length + 1
                ? 0
                : position - 1;
          const isClone = position === 0 || position === posts.length + 1;

          return (
            <div
              key={`${position}-${postUrl}`}
              className={`instagram-carousel-card ${
                position === activePosition
                  ? "instagram-carousel-card--active"
                  : ""
              }`}
              data-slide-position={position}
              role="group"
              aria-label={`Instagram post ${index + 1} of ${posts.length}`}
              aria-roledescription="slide"
              aria-hidden={isClone}
              inert={isClone}
            >
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={postUrl}
                data-instgrm-version="14"
              >
                <a
                  className="instagram-embed-fallback"
                  href={postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramIcon className="h-8 w-8" />
                  View this post on Instagram
                </a>
              </blockquote>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() =>
            scrollToPosition(activeIndex === 0 ? 0 : activeIndex)
          }
          aria-label="Previous Instagram post"
          className="instagram-carousel-control"
        >
          <ArrowRightIcon className="h-4 w-4 rotate-180" />
        </button>
        <span
          className="min-w-14 text-center text-xs tabular-nums tracking-[0.16em] text-stone-600"
          aria-live="polite"
        >
          {String(activeIndex + 1).padStart(2, "0")} /{" "}
          {String(posts.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() =>
            scrollToPosition(
              activeIndex === posts.length - 1 ? posts.length + 1 : activeIndex + 2,
            )
          }
          aria-label="Next Instagram post"
          className="instagram-carousel-control"
        >
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-stone-500">
        <span aria-hidden className="instagram-scroll-cue">
          <ArrowRightIcon className="h-3 w-3" />
        </span>
        Swipe or scroll to explore
      </p>

      <Script
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
        onLoad={() => window.instgrm?.Embeds?.process()}
      />
    </section>
  );
}
