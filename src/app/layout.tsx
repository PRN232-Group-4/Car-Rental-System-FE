import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import GlobalBlueprintBackground from "@/components/layout/GlobalBlueprintBackground";
import "./globals.css";

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
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${beVietnamPro.variable} ${geistMono.variable} h-full scroll-smooth antialiased font-sans`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function c(e){if(!e||!e.removeAttribute)return;if(e.hasAttribute('bis_skin_checked'))e.removeAttribute('bis_skin_checked');if(e.hasAttribute('bis_register'))e.removeAttribute('bis_register');var a=e.attributes;if(a){for(var i=a.length-1;i>=0;i--){var n=a[i].name;if(n==='bis_skin_checked'||n==='bis_register'||n==='fdprocessedid'||n.indexOf('__processed_')===0||n.indexOf('bis_')===0){e.removeAttribute(n);}}}}try{c(document.documentElement);c(document.body);document.querySelectorAll('*').forEach(c);if(window.MutationObserver){var o=new MutationObserver(function(m){for(var i=0;i<m.length;i++){var x=m[i];if(x.type==='attributes'){c(x.target);}else if(x.type==='childList'){for(var j=0;j<x.addedNodes.length;j++){var node=x.addedNodes[j];if(node.nodeType===1){c(node);if(node.querySelectorAll)node.querySelectorAll('*').forEach(c);}}}}});o.observe(document.documentElement,{childList:true,subtree:true,attributes:true});window.addEventListener('DOMContentLoaded',function(){setTimeout(function(){o.disconnect();},4000);});}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col text-ink bg-canvas font-sans relative selection:bg-primary/20 selection:text-warning"
      >
        <GlobalBlueprintBackground />
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
