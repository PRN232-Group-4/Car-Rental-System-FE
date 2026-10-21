import type { Page } from "@playwright/test";

/** Isolate every provider request, including tiles and telemetry, from billable APIs. */
export async function mockMapbox(page: Page) {
  await page.route("https://api.mapbox.com/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.includes("/search/geocode/")) return route.fulfill({ json: { features: [{ geometry: { type: "Point", coordinates: [106.7009, 10.7769] } }] } });
    if (path.includes("/styles/")) return route.fulfill({ json: { version: 8, sources: {}, layers: [{ id: "background", type: "background", paint: { "background-color": "#f0ece6" } }] } });
    if (path.includes("/directions/")) return route.fulfill({ json: { code: "Ok", routes: [{ distance: 1200, duration: 180, geometry: { type: "LineString", coordinates: [[106.6, 10.7], [106.7009, 10.7769]] } }] } });
    return route.fulfill({ json: {} });
  });
  await page.route("https://events.mapbox.com/**", (route) => route.fulfill({ status: 200, json: {} }));
}
