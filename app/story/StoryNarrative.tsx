"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const SYMBOLS = ["diamond", "leaf", "hands", "sun", "wave", "dot", "orbit", "spark"] as const;
type StorySymbolName = (typeof SYMBOLS)[number];

function StorySymbol({ name }: { name: StorySymbolName }) {
  const paths: Record<StorySymbolName, React.ReactNode> = {
    diamond: <path d="m12 3 8 9-8 9-8-9 8-9Z M4 12h16 M8 7.5 12 21l4-13.5" />,
    leaf: <path d="M19 4C9 4 4 9 4 18c9 0 14-5 15-14Z M4 18c3-3 6-5 10-7" />,
    hands: <path d="M3 12.5 7 9l4 3V7a1 1 0 0 1 2 0v4l1-5a1 1 0 0 1 2 .3l-.5 5.1 1.4-3.2a1 1 0 0 1 1.8.8l-2 5.5c-.7 2-2.4 3.5-4.5 3.5H8.5a4 4 0 0 1-3.2-1.6L3 13.5Z" />,
    sun: <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />,
    wave: <path d="M3 12c2.5-5 5-5 7.5 0s5 5 7.5 0 3-5 3-5 M3 17c2.5-5 5-5 7.5 0s5 5 7.5 0 3-5 3-5" />,
    dot: <circle cx="12" cy="12" r="4" />,
    orbit: <><circle cx="12" cy="12" r="2" /><ellipse cx="12" cy="12" rx="9" ry="4" /><ellipse cx="12" cy="12" rx="4" ry="9" /></>,
    spark: <path d="m12 2 1.5 7.5L21 12l-7.5 1.5L12 21l-1.5-7.5L3 12l7.5-2.5L12 2Z" />,
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden>
      {paths[name]}
    </svg>
  );
}

export function StoryNarrative({ paragraphs }: { paragraphs: string[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto max-w-6xl overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24"
      onMouseLeave={() => setActiveIndex(0)}
    >
      <div className="pointer-events-none absolute left-5 top-16 hidden h-[calc(100%-8rem)] w-px bg-stone-200 sm:block" />
      <div
        className="story-progress pointer-events-none absolute left-[3px] top-16 hidden w-[3px] rounded-full bg-amber-600 sm:block"
        style={{ transform: `scaleY(${isVisible ? 1 : 0})` }}
      />

      <div className="mb-10 flex items-end justify-between gap-6 sm:mb-14 sm:pl-8">
        <p
          className={`max-w-sm text-sm leading-relaxed text-stone-500 transition-all duration-1000 sm:text-base ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          A quiet beginning, shaped by intention, craft and the belief that
          beauty can be responsible too.
        </p>
        <span className="hidden text-[0.62rem] font-medium uppercase tracking-[0.28em] text-amber-700 sm:block">
          The AURJA perspective
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5 sm:pl-8">
        {paragraphs.map((paragraph, index) => {
          const isLead = index === 0;
          const isActive = activeIndex === index;
          const words = paragraph.split(" ");
          const symbol = SYMBOLS[index % SYMBOLS.length];

          return (
            <article
              key={paragraph}
              tabIndex={0}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              className={`story-card group relative overflow-hidden rounded-[1.5rem] border p-6 transition-[opacity,transform,background-color,border-color,box-shadow] duration-700 sm:p-8 ${
                isLead ? "md:col-span-2" : ""
              } ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              } ${
                isActive
                  ? "border-amber-300 bg-white shadow-[0_18px_45px_rgba(120,78,24,0.12)]"
                  : "border-stone-200 bg-white/75"
              }`}
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <span
                aria-hidden
                className={`absolute inset-y-0 left-0 w-1 origin-top bg-amber-600 transition-transform duration-700 ${
                  isActive ? "scale-y-100" : "scale-y-0"
                }`}
              />
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-3 text-amber-700">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-700/25 bg-amber-50/70 transition-transform duration-500 group-hover:rotate-6">
                    <StorySymbol name={symbol} />
                  </span>
                  <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em]">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </p>
                </div>
                <span
                  aria-hidden
                  className={`mt-1 h-px bg-amber-700/40 transition-all duration-500 ${
                    isActive ? "w-14" : "w-8"
                  }`}
                />
              </div>
              <div className={isLead ? "mt-8 grid gap-8 lg:grid-cols-[1fr_180px] lg:items-end" : "mt-10"}>
                <p
                  className={`leading-relaxed ${
                    isLead
                      ? "max-w-3xl font-display text-2xl leading-tight text-stone-800 sm:text-3xl"
                      : "text-base text-stone-600 sm:text-lg"
                  }`}
                >
                  {words.map((word, wordIndex) => (
                    <span
                      key={`${word}-${wordIndex}`}
                      className={`story-word inline-block transition-[opacity,transform] duration-500 ${
                        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                      }`}
                      style={{ transitionDelay: `${index * 90 + wordIndex * 22}ms` }}
                    >
                      {word}
                      {wordIndex < words.length - 1 ? "\u00a0" : ""}
                    </span>
                  ))}
                </p>
                {isLead ? (
                  <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[1rem] border border-stone-200 bg-stone-100 lg:block">
                    <Image
                      src="/ringsetting.webp"
                      alt="A close study of form and jewellery detail"
                      fill
                      sizes="180px"
                      className="object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute inset-x-3 bottom-3 border-t border-white/60 pt-2 text-[0.55rem] uppercase tracking-[0.2em] text-white">
                      Form, feeling, intention
                    </span>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}