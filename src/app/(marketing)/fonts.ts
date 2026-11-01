import localFont from "next/font/local";
import { Archivo } from "next/font/google";

export const cormorant = localFont({
  src: [
    {
      path: "../../../public/fonts/cormorant-garamond-italic-vietnamese.woff2",
      style: "italic",
      weight: "400 700",
    },
    {
      path: "../../../public/fonts/cormorant-garamond-italic-latin.woff2",
      style: "italic",
      weight: "400 700",
    },
  ],
  variable: "--font-editorial",
  display: "swap",
});

export const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "vietnamese"],
  axes: ["wdth"],
  display: "swap",
});

// Giữ alias tương thích ngược với các import hiện hữu nếu còn
export const spaceGrotesk = { variable: "" };
export const jetbrainsMono = { variable: "" };
export const bricolage = spaceGrotesk;
export const manrope = archivo;
