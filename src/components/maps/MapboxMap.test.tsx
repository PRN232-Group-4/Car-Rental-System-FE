import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MapboxMap from "./MapboxMap";

const sdk = vi.hoisted(() => ({ removed: vi.fn(), addSource: vi.fn(), addLayer: vi.fn(), fitBounds: vi.fn(), resize: vi.fn(), supported: vi.fn(() => true), centers: [] as unknown[], loads: [] as (() => void)[] }));
vi.mock("mapbox-gl", () => ({ default: {
  supported: sdk.supported,
  Map: class {
    constructor(options: { center: unknown }) { sdk.centers.push(options.center); }
    addControl() {} on(event: string, fn: () => void) { if (event === "load") sdk.loads.push(fn); }
    addSource = sdk.addSource; addLayer = sdk.addLayer; fitBounds = sdk.fitBounds; resize = sdk.resize; remove = sdk.removed;
  },
  Marker: class { setLngLat() { return this; } addTo() { return this; } remove() {} },
  NavigationControl: class {},
  LngLatBounds: class { extend() { return this; } },
} }));

afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.clearAllMocks(); sdk.centers.length = 0; sdk.loads.length = 0; });

describe("Mapbox map states", () => {
  it("does not request provider data without a token or real location", () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN", "");
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    const view = render(<MapboxMap title="Chi nhánh" location="Hà Nội" />);
    expect(screen.getByRole("status")).toHaveTextContent("Bản đồ hiện chưa khả dụng");
    view.rerender(<MapboxMap title="Chi nhánh" location={null} />);
    expect(screen.getByRole("status")).toHaveTextContent("Chưa có địa chỉ hoặc tọa độ");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("loads actual GPS without geocoding, keeps SDK attribution and disposes the map", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN", "pk.test");
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    const view = render(<MapboxMap title="Vị trí xe" location={{ latitude: 0, longitude: 0 }} />);
    await waitFor(() => expect(sdk.loads).toHaveLength(1));
    expect(sdk.centers).toEqual([[0, 0]]);
    act(() => sdk.loads[0]());
    expect(screen.getByRole("region", { name: "Bản đồ Mapbox: Vị trí xe" })).toHaveAttribute("aria-busy", "false");
    expect(fetch).not.toHaveBeenCalled();
    view.unmount(); expect(sdk.removed).toHaveBeenCalled();
  });

  it("offers retry after geocoding fails and redraws with the resolved position", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN", "pk.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: true, json: async () => ({ features: [{ geometry: { coordinates: [106.7, 10.77] } }] }) }));
    render(<MapboxMap title="Chi nhánh" location="12 Nguyễn Huệ" />);
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Thử lại bản đồ" }));
    await waitFor(() => expect(sdk.centers).toEqual([[106.7, 10.77]]));
  });

  it("requests geolocation only on click and draws real Mapbox route geometry", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN", "pk.test");
    const locate = vi.fn((success) => success({ coords: { longitude: 106.6, latitude: 10.7 } }));
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: locate } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: "Ok", routes: [{ distance: 1200, duration: 180, geometry: { coordinates: [[106.6, 10.7], [106.7, 10.77]] } }] }) }));
    render(<MapboxMap title="Chi nhánh" location={{ latitude: 10.77, longitude: 106.7 }} />);
    await waitFor(() => expect(sdk.loads).toHaveLength(1)); act(() => sdk.loads[0]());
    expect(locate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Chỉ đường từ vị trí hiện tại" }));
    await waitFor(() => expect(sdk.loads).toHaveLength(2)); act(() => sdk.loads[1]());
    expect(locate).toHaveBeenCalledTimes(1); expect(sdk.addSource).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("1,2 km · Thời gian dự kiến: 3 phút");
  });

  it("aborts pending address lookup when a different branch is selected", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN", "pk.test");
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal("fetch", vi.fn((_url, options) => { requestSignal = options.signal; return new Promise(() => {}); }));
    const view = render(<MapboxMap title="Chi nhánh" location="Địa chỉ cũ" />);
    await waitFor(() => expect(requestSignal).toBeDefined());
    view.rerender(<MapboxMap title="Chi nhánh" location={{ latitude: 10.77, longitude: 106.7 }} />);
    expect(requestSignal!.aborted).toBe(true);
  });
});
