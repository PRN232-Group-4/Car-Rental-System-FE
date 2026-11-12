import { Archivo } from "next/font/google";

export const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "vietnamese"],
  axes: ["wdth"],
  display: "swap",
});

// Giữ alias tương thích ngược với các import hiện hữu nếu còn
export const spaceGrotesk = { variable: "" };
export const jetbrainsMono = { variable: "" };
export const cormorant = { variable: "" };
export const bricolage = spaceGrotesk;
export const manrope = archivo;
export const beVietnamPro = { variable: "" };
