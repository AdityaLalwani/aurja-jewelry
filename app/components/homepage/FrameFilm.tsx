"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/lib/site";

const FRAME_SOURCES = (() => {
  const matchFrame = (name: string) => {
    const match = name.match(/^ezgif-frame-(\d+)(?:\s*\((\d+)\))?\.(jpg|png)$/i);
    if (!match) return null;

    const main = Number(match[1]);
    const suffix = match[2] ? Number(match[2]) : 0;
    return { main, suffix };
  };

  const files = [
    "ezgif-frame-0001 (1) - Copy.png",
    "ezgif-frame-0001 (1).png",
    "ezgif-frame-001.jpg",
    "ezgif-frame-005.jpg",
    "ezgif-frame-009.jpg",
    "ezgif-frame-013.jpg",
    "ezgif-frame-017.jpg",
    "ezgif-frame-021.jpg",
    "ezgif-frame-025.png",
    "ezgif-frame-033.png",
    "ezgif-frame-035.jpg",
    "ezgif-frame-035.png",
    "ezgif-frame-037.png",
    "ezgif-frame-041.jpg",
    "ezgif-frame-043.jpg",
    "ezgif-frame-045.jpg",
    "ezgif-frame-084.jpg",
    "ezgif-frame-086.jpg",
    "ezgif-frame-089.jpg",
    "ezgif-frame-093.jpg",
    "ezgif-frame-097.jpg",
    "ezgif-frame-099.jpg",
    "ezgif-frame-101.jpg",
    "ezgif-frame-103.jpg",
    "ezgif-frame-104.jpg",
    "ezgif-frame-105.jpg",
    "ezgif-frame-106.jpg",
    "ezgif-frame-107.jpg",
    "ezgif-frame-109.jpg",
    "ezgif-frame-110.jpg",
    "ezgif-frame-112.jpg",
    "ezgif-frame-113.jpg",
    "ezgif-frame-115.jpg",
    "ezgif-frame-116.jpg",
    "ezgif-frame-118.jpg",
    "ezgif-frame-119.jpg",
    "ezgif-frame-121.jpg",
    "ezgif-frame-122.jpg",
    "ezgif-frame-124.jpg",
    "ezgif-frame-125.jpg",
    "ezgif-frame-127.jpg",
    "ezgif-frame-128.jpg",
    "ezgif-frame-130.jpg",
    "ezgif-frame-131.jpg",
    "ezgif-frame-183.jpg",
    "ezgif-frame-184.jpg",
    "ezgif-frame-185.jpg",
    "ezgif-frame-186.jpg",
    "ezgif-frame-187.jpg",
    "ezgif-frame-188.jpg",
    "ezgif-frame-189.jpg",
    "ezgif-frame-190.jpg",
    "ezgif-frame-191.jpg",
    "ezgif-frame-192.jpg",
    "ezgif-frame-193.jpg",
    "ezgif-frame-194.jpg",
    "ezgif-frame-195.jpg",
    "ezgif-frame-196.jpg",
    "ezgif-frame-197.jpg",
    "ezgif-frame-198.jpg",
    "ezgif-frame-199.jpg",
    "ezgif-frame-222.jpg",
    "ezgif-frame-223.jpg",
    "ezgif-frame-224.jpg",
    "ezgif-frame-225.jpg",
    "ezgif-frame-226.jpg",
    "ezgif-frame-228.jpg",
    "ezgif-frame-230.jpg",
    "ezgif-frame-232.jpg",
    "ezgif-frame-234.jpg",
    "ezgif-frame-237.jpg",
    "ezgif-frame-240.jpg",
    "ezgif-frame-243.jpg",
    "ezgif-frame-244.jpg",
    "ezgif-frame-246.jpg",
    "ezgif-frame-249.jpg",
    "ezgif-frame-252.jpg",
    "ezgif-frame-255.jpg",
    "ezgif-frame-256.jpg",
    "ezgif-frame-258.jpg",
    "ezgif-frame-259.jpg",
    "ezgif-frame-260.jpg",
    "ezgif-frame-261.jpg",
    "ezgif-frame-262.jpg",
    "ezgif-frame-263.jpg",
    "ezgif-frame-264.jpg",
    "ezgif-frame-265.jpg",
    "ezgif-frame-266.jpg",
    "ezgif-frame-267.jpg",
    "ezgif-frame-300 (1).jpg",
    "ezgif-frame-300 (4).jpg",
    "ezgif-frame-300 (7).jpg",
    "ezgif-frame-300 (10).jpg",
    "ezgif-frame-300 (12).jpg",
    "ezgif-frame-300 (13).jpg",
    "ezgif-frame-300 (15).jpg",
    "ezgif-frame-300 (16).jpg",
    "ezgif-frame-300 (18).jpg",
    "ezgif-frame-300 (19).jpg",
    "ezgif-frame-300 (21).jpg",
    "ezgif-frame-300 (22).jpg",
    "ezgif-frame-300 (24).jpg",
    "ezgif-frame-300 (27).jpg",
    "ezgif-frame-300 (30).jpg",
    "ezgif-frame-300 (31).jpg",
    "ezgif-frame-300 (33).jpg",
    "ezgif-frame-300 (35).jpg",
    "ezgif-frame-300 (39).jpg",
    "ezgif-frame-300 (4).jpg",
    "ezgif-frame-300 (41).jpg",
    "ezgif-frame-300 (45).jpg",
    "ezgif-frame-300 (52).jpg",
    "ezgif-frame-300 (56).jpg",
    "ezgif-frame-300 (57).jpg",
    "ezgif-frame-300 (59).jpg",
    "ezgif-frame-300 (61).jpg",
    "ezgif-frame-300 (64).jpg",
    "ezgif-frame-300 (65).jpg",
    "ezgif-frame-300 (69).jpg",
    "ezgif-frame-300 (73).jpg",
    "ezgif-frame-300 (77).jpg",
    "ezgif-frame-300 (79).jpg",
    "ezgif-frame-300 (83).jpg",
    "ezgif-frame-300 (85).jpg",
    "ezgif-frame-300 (87).jpg",
    "ezgif-frame-300 (91).jpg",
    "ezgif-frame-300 (93).jpg",
    "ezgif-frame-300 (97).jpg",
    "ezgif-frame-300 (101).jpg",
    "ezgif-frame-300 (103).jpg",
    "ezgif-frame-300 (107).jpg",
    "ezgif-frame-300 (111).jpg",
    "ezgif-frame-300 (113).jpg",
    "ezgif-frame-300 (117).jpg",
    "ezgif-frame-300 (121).jpg",
    "ezgif-frame-300 (123).jpg",
    "ezgif-frame-300 (125).jpg",
    "ezgif-frame-300 (129).jpg",
    "ezgif-frame-300 (131).jpg",
    "ezgif-frame-300 (135).jpg",
    "ezgif-frame-300 (137).jpg",
    "ezgif-frame-300 (139).jpg",
    "ezgif-frame-300 (143).jpg",
    "ezgif-frame-300 (145).jpg",
    "ezgif-frame-300 (149).jpg",
    "ezgif-frame-300 (153).jpg",
    "ezgif-frame-300 (165).jpg",
    "ezgif-frame-300 (167).jpg",
    "ezgif-frame-300 (171).jpg",
    "ezgif-frame-300 (175).jpg",
    "ezgif-frame-300 (179).jpg",
    "ezgif-frame-300 (181).jpg",
    "ezgif-frame-300 (188).jpg",
    "ezgif-frame-300 (190).jpg",
    "ezgif-frame-300 (192).jpg",
    "ezgif-frame-300 (194).jpg",
    "ezgif-frame-300 (197).jpg",
    "ezgif-frame-300 (199).jpg",
    "ezgif-frame-300 (201).jpg",
    "ezgif-frame-300 (203).jpg",
    "ezgif-frame-300 (205).jpg",
    "ezgif-frame-300 (207).jpg",
    "ezgif-frame-300 (209).jpg",
    "ezgif-frame-300 (211).jpg",
    "ezgif-frame-300 (213).jpg",
    "ezgif-frame-300 (215).jpg",
    "ezgif-frame-300 (217).jpg",
    "ezgif-frame-300 (219).jpg",
    "ezgif-frame-300 (221).jpg",
    "ezgif-frame-300 (223).jpg",
    "ezgif-frame-300 (225).jpg",
    "ezgif-frame-300 (227).jpg",
    "ezgif-frame-300 (229).jpg",
    "ezgif-frame-300 (230).jpg",
    "ezgif-frame-300 (231).jpg",
    "ezgif-frame-301 (1).png",
    "ezgif-frame-301 (2).png",
    "ezgif-frame-301 (3).png",
    "ezgif-frame-301 (4).png",
    "ezgif-frame-301 (5).png",
    "ezgif-frame-301 (6).png",
    "ezgif-frame-301 (7).png",
    "ezgif-frame-301 (8).png",
    "ezgif-frame-301 (9).png",
    "ezgif-frame-301 (10).png",
    "ezgif-frame-301 (11).png",
    "ezgif-frame-301 (12).png",
    "ezgif-frame-301 (13).png",
    "ezgif-frame-301 (14).png",
    "ezgif-frame-301 (15).png",
    "ezgif-frame-301 (16).png",
    "ezgif-frame-301 (17).png",
    "ezgif-frame-301 (18).png",
    "ezgif-frame-301 (19).png",
    "ezgif-frame-301 (20).png",
    "ezgif-frame-301 (21).png",
    "ezgif-frame-301 (22).png",
    "ezgif-frame-301 (23).png",
    "ezgif-frame-301 (24).png",
    "ezgif-frame-301 (25).png",
    "ezgif-frame-301 (26).png",
    "ezgif-frame-301 (27).png",
    "ezgif-frame-301 (28).png",
    "ezgif-frame-301 (29).png",
    "ezgif-frame-301 (30).png",
    "ezgif-frame-301 (31).png",
    "ezgif-frame-301 (32).png",
    "ezgif-frame-301 (33).png",
    "ezgif-frame-301 (34).png",
    "ezgif-frame-301 (35).png",
    "ezgif-frame-301 (36).png",
    "ezgif-frame-301 (37).png",
    "ezgif-frame-301 (38).png",
    "ezgif-frame-301 (39).png",
    "ezgif-frame-301 (40).png",
    "ezgif-frame-301 (41).png",
  ];

  const deduped = new Map<string, string>();

  for (const file of files) {
    const parsed = matchFrame(file);
    if (!parsed) continue;

    const key = `${parsed.main}-${parsed.suffix || 0}`;
    const candidate = `/frames/${file}`;
    const existing = deduped.get(key);

    if (!existing) {
      deduped.set(key, candidate);
      continue;
    }

    const existingExt = existing.toLowerCase().endsWith(".png") ? "png" : "jpg";
    const candidateExt = candidate.toLowerCase().endsWith(".png") ? "png" : "jpg";
    if (candidateExt === "png" && existingExt !== "png") deduped.set(key, candidate);
  }

  const firstFrame = "/frames/ezgif-frame-0001 (1).png";

  return [...deduped.values()].sort((a, b) => {
    if (a === firstFrame) return -1;
    if (b === firstFrame) return 1;

    const parse = (value: string) => {
      const match = value.match(/ezgif-frame-(\d+)(?:\s*\((\d+)\))?\.(jpg|png)$/i);
      if (!match) return { main: 0, suffix: 0 };
      return { main: Number(match[1]), suffix: match[2] ? Number(match[2]) : 0 };
    };

    const left = parse(a);
    const right = parse(b);

    if (left.main !== right.main) return left.main - right.main;
    return left.suffix - right.suffix;
  });
})();

export function FrameFilm() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const drawFrameRef = useRef<(index: number) => void>(() => {});
  const [loadedCount, setLoadedCount] = useState(0);
  const [sequenceReady, setSequenceReady] = useState(false);
  const filmCompletedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !stage || !context) return;

    let cancelled = false;
    let renderedFrame = 0;
    const frames = new Array<HTMLImageElement | null>(FRAME_SOURCES.length).fill(null);
    imagesRef.current = frames;

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * pixelRatio);
      canvas.height = Math.round(bounds.height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawFrameRef.current(renderedFrame);
    };

    const drawFrame = (index: number) => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const frameIndex = Math.max(0, Math.min(index, frames.length - 1));
      let image = frames[frameIndex];

      if (!image) {
        for (let offset = 1; offset < frames.length && !image; offset += 1) {
          image = frames[frameIndex - offset] ?? frames[frameIndex + offset] ?? null;
        }
      }

      if (!image) return;

      renderedFrame = frameIndex;
      context.clearRect(0, 0, bounds.width, bounds.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      const scale = Math.max(
        bounds.width / image.naturalWidth,
        bounds.height / image.naturalHeight,
      );
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      context.drawImage(
        image,
        (bounds.width - width) / 2,
        (bounds.height - height) / 2,
        width,
        height,
      );
    };

    drawFrameRef.current = drawFrame;
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(stage);

    const loadFrames = async () => {
      let completed = 0;

      await Promise.all(
        FRAME_SOURCES.map(async (source, index) => {
          const image = new window.Image();
          image.decoding = "async";
          image.fetchPriority = index === 0 ? "high" : "auto";
          image.src = source;

          try {
            await image.decode();
            if (cancelled) return;
            frames[index] = image;
            if (index === 0) drawFrame(0);
          } catch {
            // Keep the still-image fallback visible if an individual frame fails.
          } finally {
            completed += 1;
            if (!cancelled) setLoadedCount(completed);
          }
        }),
      );

      if (!cancelled) setSequenceReady(frames.some(Boolean));
    };

    void loadFrames();

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resizeCanvas);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const headerHiddenClass = "frame-film-header-hidden";
    document.body.classList.add(headerHiddenClass);
    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "bottom top"
          : `+=${Math.round(window.innerHeight * 4.75)}`,
      onEnter: () => document.body.classList.add(headerHiddenClass),
      onEnterBack: () => {
        if (filmCompletedRef.current) {
          document.body.classList.remove(headerHiddenClass);
        }
      },
      onUpdate: (self) => {
        if (self.direction > 0) document.body.classList.add(headerHiddenClass);
        if (self.direction < 0 && filmCompletedRef.current) {
          document.body.classList.remove(headerHiddenClass);
        }
      },
      onLeave: () => {
        filmCompletedRef.current = true;
        document.body.classList.remove(headerHiddenClass);
      },
      onLeaveBack: () => {
        if (filmCompletedRef.current) {
          document.body.classList.remove(headerHiddenClass);
        }
      },
    });

    return () => {
      trigger.kill();
      document.body.classList.remove(headerHiddenClass);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const frames = imagesRef.current;
    if (!sequenceReady || !section || !stage) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const playhead = { frame: 0 };

      gsap.to(playhead, {
        frame: frames.length - 1,
        ease: "none",
        snap: { frame: 1 },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 4.75)}`,
          pin: stage,
          pinSpacing: true,
          scrub: 0.4,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: () => {
            drawFrameRef.current(playhead.frame);
          },
        },
      });

      ScrollTrigger.refresh();
    });

    media.add("(prefers-reduced-motion: reduce)", () => {
      drawFrameRef.current(frames.length - 1);
      filmCompletedRef.current = true;
    });

    return () => media.revert();
  }, [sequenceReady]);

  const progress = Math.round((loadedCount / FRAME_SOURCES.length) * 100);

  return (
    <section
      ref={sectionRef}
      className="frame-film"
      aria-label="A diamond's journey from stone to jewellery"
    >
      <div ref={stageRef} className="frame-film__stage">
        <Image
          className="frame-film__fallback"
          src="/frames/ezgif-frame-249.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          priority
          unoptimized
        />
        <canvas
          ref={canvasRef}
          className="frame-film__canvas"
          aria-label="A frame-by-frame film of a diamond becoming a finished ring"
          role="img"
        />

        {!sequenceReady && (
          <div
            className="frame-film__boot-loader"
            role="status"
            aria-live="polite"
          >
            <div className="frame-film__loader-logo" aria-hidden="true">
              <Image
                src={site.logo}
                alt=""
                width={72}
                height={72}
                priority
                unoptimized
              />
            </div>
            <div className="frame-film__loader-copy">
              <span className="frame-film__loader-kicker">AURJA</span>
              <span className="frame-film__loader-text">PREPARING THE FILM</span>
            </div>
            <div className="frame-film__loader-meta" aria-hidden="true">
              <span>{progress}%</span>
              <span className="frame-film__load-track" style={{ "--load-progress": `${progress}%` } as React.CSSProperties} />
            </div>
          </div>
        )}

        {sequenceReady && (
          <p className="frame-film__scroll-cue" aria-hidden="true">
            SCROLL TO EXPLORE <span>↓</span>
          </p>
        )}
      </div>
    </section>
  );
}