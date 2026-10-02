import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { siteConfig } from "@/config/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col text-neutral-800">
        {/* On reload, reset to the top instead of letting the browser restore the
            old scroll position (or re-jump to a leftover #anchor). Runs before the
            browser restores scroll, so there is no visible jump. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if('scrollRestoration' in history)history.scrollRestoration='manual';var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];if(n&&n.type==='reload'){if(location.hash)history.replaceState(null,'',location.pathname+location.search);var h=document.documentElement,p=h.style.scrollBehavior;h.style.scrollBehavior='auto';window.scrollTo(0,0);h.style.scrollBehavior=p;}}catch(e){}})();",
          }}
        />
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
