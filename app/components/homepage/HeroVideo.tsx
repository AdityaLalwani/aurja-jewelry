"use client";

import { useEffect, useState } from "react";

const desktopVideos = ["/AURJA-desktop1.mp4", "/AURJA-desktop2.mp4"];
const mobileVideos = ["/AURJA-mobile1.mp4", "/AURJA-mobile2.mp4"];

export function HeroVideo() {
  const [videos, setVideos] = useState<string[] | null>(null);
  const [videoIndex, setVideoIndex] = useState(0);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const connection = (
      navigator as Navigator & {
        connection?: EventTarget & { downlink?: number; saveData?: boolean };
      }
    ).connection;
    let loadTimer: number | undefined;
    const scheduleVideo = () => {
      if (loadTimer !== undefined) window.clearTimeout(loadTimer);
      loadTimer = window.setTimeout(() => {
        if (
          reducedMotionQuery.matches ||
          connection?.saveData ||
          (connection?.downlink !== undefined && connection.downlink < 3)
        ) {
          setVideos(null);
          return;
        }
        setVideoIndex(0);
        setVideos(mobileQuery.matches ? mobileVideos : desktopVideos);
      }, 1200);
    };

    if (document.readyState === "complete") {
      scheduleVideo();
    } else {
      window.addEventListener("load", scheduleVideo, { once: true });
    }
    mobileQuery.addEventListener("change", scheduleVideo);
    reducedMotionQuery.addEventListener("change", scheduleVideo);
    connection?.addEventListener("change", scheduleVideo);

    return () => {
      if (loadTimer !== undefined) window.clearTimeout(loadTimer);
      window.removeEventListener("load", scheduleVideo);
      mobileQuery.removeEventListener("change", scheduleVideo);
      reducedMotionQuery.removeEventListener("change", scheduleVideo);
      connection?.removeEventListener("change", scheduleVideo);
    };
  }, []);

  if (!videos) return null;

  return (
    <video
      key={videos[videoIndex]}
      autoPlay
      muted
      playsInline
      preload="none"
      aria-hidden="true"
      onEnded={() => setVideoIndex((current) => (current + 1) % videos.length)}
      className="absolute inset-0 h-full w-full object-cover"
    >
      <source src={videos[videoIndex]} type="video/mp4" />
    </video>
  );
}
