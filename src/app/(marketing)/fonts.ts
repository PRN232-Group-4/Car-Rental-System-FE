import { Cormorant_Garamond, Archivo } from "next/font/google";

export const cormorant = Cormorant_Garamond({
  variable: "--font-editorial",
  subsets: ["latin", "vietnamese"],
  style: ["italic"],
  weight: ["600", "700"],
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
