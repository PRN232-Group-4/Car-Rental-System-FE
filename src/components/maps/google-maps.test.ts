import { describe, expect, it } from "vitest";
import { buildGoogleMapsDirectionsUrl, buildGoogleMapsEmbedUrl, mapLocationQuery } from "./google-maps";

describe("Google Maps locations", () => {
  it("uses real coordinates including zero, and falls back to a provided address for invalid coordinates", () => {
    expect(mapLocationQuery({ latitude: 0, longitude: 0 })).toBe("0,0");
    expect(mapLocationQuery({ latitude: 91, longitude: 106, address: "Hà Nội" })).toBe("Hà Nội");
    expect(mapLocationQuery({ latitude: NaN, longitude: 106 })).toBeNull();
    expect(mapLocationQuery({ name: "Tên chi nhánh không đủ xác định vị trí" })).toBeNull();
  });

  it("does not create an embedded map without a key or a real location", () => {
    expect(buildGoogleMapsEmbedUrl({ location: "Hà Nội" })).toBeNull();
    expect(buildGoogleMapsEmbedUrl({ apiKey: "public-test-key", location: " " })).toBeNull();
  });

  it("encodes Vietnamese addresses as parameters on Google's fixed embed host", () => {
    const url = new URL(buildGoogleMapsEmbedUrl({ apiKey: "public-test-key", location: "12 Nguyễn Huệ & Quận 1" })!);
    expect(url.origin).toBe("https://www.google.com");
    expect(url.pathname).toBe("/maps/embed/v1/place");
    expect(url.searchParams.get("q")).toBe("12 Nguyễn Huệ & Quận 1");
    expect(url.searchParams.get("language")).toBe("vi");
  });

  it("uses directions only when a valid origin is provided", () => {
    const options = { apiKey: "public-test-key", origin: { latitude: 10.7, longitude: 106.6 }, destination: "Sân bay Tân Sơn Nhất" };
    const url = new URL(buildGoogleMapsEmbedUrl(options)!);
    expect(url.pathname).toBe("/maps/embed/v1/directions");
    expect(url.searchParams.get("origin")).toBe("10.7,106.6");
    expect(url.searchParams.get("destination")).toBe("Sân bay Tân Sơn Nhất");
    expect(new URL(buildGoogleMapsEmbedUrl({ ...options, origin: null })!).pathname).toBe("/maps/embed/v1/place");
  });

  it("keeps external directions available without a key and lets Google choose the user's origin", () => {
    const url = new URL(buildGoogleMapsDirectionsUrl({ location: "123 Lê Lợi, TP.HCM" })!);
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("destination")).toBe("123 Lê Lợi, TP.HCM");
    expect(url.searchParams.has("origin")).toBe(false);
    expect(url.searchParams.has("key")).toBe(false);
    expect(buildGoogleMapsDirectionsUrl({ location: null })).toBeNull();
  });

  it("formats Place IDs according to each Google API's parameter contract", () => {
    const location = { placeId: "ChIJ-test", name: "Chi nhánh A", address: "12 Nguyễn Huệ" };
    expect(new URL(buildGoogleMapsEmbedUrl({ apiKey: "public-test-key", location })!).searchParams.get("q")).toBe("place_id:ChIJ-test");
    const external = new URL(buildGoogleMapsDirectionsUrl({ location })!);
    expect(external.searchParams.get("destination_place_id")).toBe("ChIJ-test");
    expect(external.searchParams.get("destination")).toBe("12 Nguyễn Huệ");
  });
});
