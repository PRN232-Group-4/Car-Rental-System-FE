/** Only real HTTP(S) media and same-origin absolute paths may be rendered. */
export function vehicleImageSource(value?: string | null): string | undefined {
  const source = value?.trim();
  if (!source || /[\u0000-\u001f\u007f]/.test(source)) return undefined;
  if (source.startsWith("/") && !source.startsWith("//") && !source.includes("\\")) return source;
  try {
    const url = new URL(source);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
}
