import { Bricolage_Grotesque, Manrope, JetBrains_Mono } from "next/font/google";

export const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const manrope = Manrope({
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
