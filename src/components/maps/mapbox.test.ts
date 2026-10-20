import { afterEach, describe, expect, it, vi } from "vitest";
import { getMapboxRoute, hasMapTarget, isMapboxToken, mapCoordinates, resolveMapTarget } from "./mapbox";

afterEach(() => vi.unstubAllGlobals());
const signal = () => new AbortController().signal;

describe("Mapbox locations and navigation", () => {
  it("uses valid real coordinates in longitude/latitude order, including zero", async () => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    expect(mapCoordinates({ latitude: 0, longitude: 0 })).toEqual([0, 0]);
    expect(mapCoordinates({ latitude: NaN, longitude: 106 })).toBeNull();
    expect(mapCoordinates({ latitude: 91, longitude: 106 })).toBeNull();
    expect(hasMapTarget({ name: "Tên không phải địa chỉ", placeId: "ChIJ-google" })).toBe(false);
    expect(await resolveMapTarget({ latitude: 10.77, longitude: 106.7, placeId: "ChIJ-google" }, "pk.test", signal())).toEqual([106.7, 10.77]);
    expect(fetch).not.toHaveBeenCalled();
    expect(isMapboxToken("sk.secret")).toBe(false);
    expect(isMapboxToken("pk.public")).toBe(true);
  });

  it("encodes Vietnamese addresses safely and passes cancellation to v6 geocoding", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ features: [{ geometry: { coordinates: [106.7, 10.77] } }] }) });
    vi.stubGlobal("fetch", fetch);
    const cancellation = signal();
    expect(await resolveMapTarget("12 Nguyễn Huệ & Lê Lợi", "pk.test", cancellation)).toEqual([106.7, 10.77]);
    const url = fetch.mock.calls[0][0] as URL;
    expect(url.origin).toBe("https://api.mapbox.com");
    expect(url.pathname).toBe("/search/geocode/v6/forward");
    expect(url.searchParams.get("q")).toBe("12 Nguyễn Huệ & Lê Lợi");
    expect(url.searchParams.get("language")).toBe("vi");
    expect(fetch.mock.calls[0][1]).toEqual({ signal: cancellation, cache: "no-store" });
  });

  it("handles no matches, bad points and rejected upstream requests without made-up coordinates", async () => {
    const fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ features: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [{ geometry: { coordinates: [106, 91] } }] }) })
      .mockResolvedValueOnce({ ok: false });
    vi.stubGlobal("fetch", fetch);
    await expect(resolveMapTarget("unknown", "pk.test", signal())).rejects.toThrow("Không tìm thấy vị trí");
    await expect(resolveMapTarget("unknown", "pk.test", signal())).rejects.toThrow("Không tìm thấy vị trí");
    await expect(resolveMapTarget("unknown", "pk.test", signal())).rejects.toThrow("Không tải được dữ liệu Mapbox");
  });

  it("maps real driving geometry, distance and ETA with no traffic promise", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: "Ok", routes: [{ distance: 1250, duration: 240, geometry: { coordinates: [[106.7, 10.77], [106.8, 10.8]] } }] }) });
    vi.stubGlobal("fetch", fetch);
    const route = await getMapboxRoute([106.7, 10.77], [106.8, 10.8], "pk.test", signal());
    expect(route.distanceMeters).toBe(1250); expect(route.durationSeconds).toBe(240);
    expect((fetch.mock.calls[0][0] as URL).pathname).toBe("/directions/v5/mapbox/driving/106.7,10.77;106.8,10.8");
  });

  it("does not invent a straight line or ETA for unroutable points", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: "NoRoute", routes: [] }) }));
    await expect(getMapboxRoute([0, 0], [1, 1], "pk.test", signal())).rejects.toThrow("Không tìm thấy tuyến đường");
  });
});
