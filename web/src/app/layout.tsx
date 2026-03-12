import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import ConfróntoBar from "@/components/ConfróntoBar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Filament Finder — Confronto prezzi filamenti 3D",
    template: "%s | Filament Finder",
  },
  description:
    "Trova il miglior prezzo per i filamenti da stampa 3D. Confronta PLA, PETG, TPU e molti altri tra i principali shop online.",
  metadataBase: new URL(process.env.SITE_URL ?? "https://filamenti.offerteai.it"),
  openGraph: {
    siteName: "Filament Finder",
    locale: "it_IT",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={inter.variable}>
      <body>
        {children}
        <ConfróntoBar />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-DJ0QM4716H" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-DJ0QM4716H');
        `}</Script>
      </body>
    </html>
  );
}
