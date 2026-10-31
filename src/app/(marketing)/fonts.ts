import {
  Space_Grotesk,
  Cormorant_Garamond,
  Archivo,
  JetBrains_Mono,
} from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  variable: "--font-bricolage",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const cormorant = Cormorant_Garamond({
  variable: "--font-editorial",
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  weight: ["600", "700"],
  display: "swap",
});

export const archivo = Archivo({
  variable: "--font-marketing-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600"],
  display: "swap",
});

// Giữ alias tương thích ngược với các import hiện hữu
export const bricolage = spaceGrotesk;
export const manrope = archivo;
