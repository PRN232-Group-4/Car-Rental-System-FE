import { describe, expect, it } from "vitest";
import { vehicleImageSource } from "./vehicle-image-source";

describe("vehicle image source", () => {
  it("preserves real media and same-origin paths", () => {
    expect(vehicleImageSource(" https://media.example.test/car.jpg ")).toBe("https://media.example.test/car.jpg");
    expect(vehicleImageSource("/uploads/car.jpg")).toBe("/uploads/car.jpg");
  });

  it("rejects missing values, executable content and ambiguous URLs", () => {
    for (const value of [null, undefined, "", "  ", "javascript:alert(1)", "data:image/svg+xml,test", "//media.example.test/car.jpg", "/\\media.example.test/car.jpg", "/\n/media.example.test/car.jpg", "file:///car.jpg", "https://user:pass@media.example.test/car.jpg", "broken path"]) {
      expect(vehicleImageSource(value)).toBeUndefined();
    }
  });
});
