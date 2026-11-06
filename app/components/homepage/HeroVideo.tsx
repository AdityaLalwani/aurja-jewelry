"use client";

import { useEffect, useState } from "react";

const desktopVideos = ["/AURJA-desktop1.mp4", "/AURJA-desktop2.mp4"];
const mobileVideos = ["/AURJA-mobile1.mp4", "/AURJA-mobile2.mp4"];

export function HeroVideo() {
  const [isMobile, setIsMobile] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const updateDevice = () => setIsMobile(mobileQuery.matches);

    updateDevice();
    mobileQuery.addEventListener("change", updateDevice);

    return () => mobileQuery.removeEventListener("change", updateDevice);
  }, []);

  const videos = isMobile ? mobileVideos : desktopVideos;

  return (
    <video
      key={videos[videoIndex]}
      autoPlay
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      onEnded={() => setVideoIndex((current) => (current + 1) % videos.length)}
      className="absolute inset-0 h-full w-full object-cover"
    >
      <source src={videos[videoIndex]} type="video/mp4" />
    </video>
  );
}
