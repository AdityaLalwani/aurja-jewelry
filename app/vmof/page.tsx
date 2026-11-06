"use client";

import { useEffect } from "react";

export default function VMOFPage() {
  useEffect(() => {
    const scriptId = "fillout-zite-script";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://server.fillout.com/embed/v2-zite/";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}>
      <div
        data-zite-id="n8pcefh4h2"
        data-zite-embed-type="fullscreen"
        style={{ width: "100%", height: "100%" }}
        data-zite-inherit-parameters
      />
    </div>
  );
}
