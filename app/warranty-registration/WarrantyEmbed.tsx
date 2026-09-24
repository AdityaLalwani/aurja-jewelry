"use client";

import { useEffect } from "react";

const FILLout_SCRIPT_ID = "fillout-zite-script";

export function WarrantyEmbed() {
  useEffect(() => {
    if (document.getElementById(FILLout_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = FILLout_SCRIPT_ID;
    script.src = "https://server.fillout.com/embed/v2-zite/";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div
      className="warranty-embed mt-8 min-h-11"
      data-zite-id="hm5yuhjmte"
      data-zite-embed-type="popup"
      data-zite-button-text="Activate Warranty"
      data-zite-button-size="medium"
      data-zite-inherit-parameters
      data-zite-popup-size="small"
    />
  );
}
