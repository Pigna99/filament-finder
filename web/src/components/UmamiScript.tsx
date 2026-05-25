"use client";

import Script from "next/script";

const UMAMI_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const UMAMI_SRC =
  process.env.NEXT_PUBLIC_UMAMI_SRC ||
  "https://analytics.offerteai.it/script.js";

export default function UmamiScript() {
  if (!UMAMI_ID) return null;

  return (
    <Script
      src={UMAMI_SRC}
      data-website-id={UMAMI_ID}
      strategy="afterInteractive"
    />
  );
}
