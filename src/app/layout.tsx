import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono, Outfit } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/features/auth";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { siteConfig } from "@/config/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${outfit.variable} ${beVietnamPro.variable} ${geistMono.variable} h-full scroll-smooth antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col text-ink bg-canvas font-sans">
        {/* On reload, reset to the top instead of letting the browser restore the
            old scroll position (or re-jump to a leftover #anchor). Runs before the
            browser restores scroll, so there is no visible jump. */}
        <Script
          id="scroll-restoration"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if('scrollRestoration' in history)history.scrollRestoration='manual';var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];if(n&&n.type==='reload'){if(location.hash)history.replaceState(null,'',location.pathname+location.search);var h=document.documentElement,p=h.style.scrollBehavior;h.style.scrollBehavior='auto';window.scrollTo(0,0);h.style.scrollBehavior=p;}}catch(e){}})();",
          }}
        />
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
