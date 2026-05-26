import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Photos",
  description: "Fotos da festa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&family=Instrument+Serif:ital@0;1&family=Caveat:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="paper-grain" aria-hidden="true" />
        <div className="vignette" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
