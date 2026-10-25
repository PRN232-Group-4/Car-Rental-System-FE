import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const targetDirs = [
  path.resolve(process.cwd(), "..", "GRAPHITE-GLASS-DECK-A1.1-SCREENSHOTS"),
  path.resolve("C:\\Users\\Huy\\.gemini\\antigravity\\brain\\20c95a8f-ab5a-40e4-8ca7-4ef62d971f61\\GRAPHITE-GLASS-DECK-A1.1-SCREENSHOTS"),
  path.resolve(process.cwd(), "GRAPHITE-GLASS-DECK-A1.1-SCREENSHOTS"),
];

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function saveMultiScreenshot(page: any, filename: string, options?: any) {
  const primaryPath = path.join(targetDirs[0], filename);
  await page.screenshot({ path: primaryPath, ...options });
  for (let i = 1; i < targetDirs.length; i++) {
    const dest = path.join(targetDirs[i], filename);
    try {
      fs.copyFileSync(primaryPath, dest);
    } catch (e) {
      // ignore copy error
    }
  }
}

async function copyVideoToTargets(videoPath: string, targetFilename: string) {
  for (const dir of targetDirs) {
    const dest = path.join(dir, targetFilename);
    try {
      fs.copyFileSync(videoPath, dest);
    } catch (e) {
      // ignore
    }
  }
}

const protoDir = path.resolve(process.cwd(), "..", "design-explorations", "phase-3e-graphite-glass-deck");
const a11File = path.join(protoDir, "variant-a1.1-refined-frosted-editorial-deck.html");
const a11Url = "file:///" + a11File.replace(/\\/g, "/");

test.describe("A1.1 Organic Liquid Motion Corrective Verification Suite", () => {
  // Test 1: Record full video Dark -> Light (1920x1080 60fps) and collect live performance telemetry
  test("1. Record Liquid Flood Video & Measure Live Performance - Dark to Light", async ({ browser }) => {
    const videoDir = path.join(process.cwd(), "temp-videos-d2l");
    if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

    const context = await browser.newContext({
      recordVideo: { dir: videoDir, size: { width: 1920, height: 1080 } },
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(400);

    // Trigger organic liquid flood toggle
    await page.click("#themeBtn");
    // Wait for the full 1050ms animation plus settle buffer
    await page.waitForTimeout(1400);

    // Read real telemetry
    const telemetry = await page.evaluate(() => (window as any).__liquidPerformanceReport);

    await page.close();
    await context.close();

    const videoFiles = fs.readdirSync(videoDir);
    if (videoFiles.length > 0) {
      const srcVideo = path.join(videoDir, videoFiles[0]);
      await copyVideoToTargets(srcVideo, "a1-1-liquid-flood-dark-to-light.webm");
    }

    // Save telemetry to file for documentation
    const telePath = path.resolve(process.cwd(), "..", "GRAPHITE-GLASS-DECK-A1.1-SCREENSHOTS", "liquid-telemetry-d2l.json");
    fs.writeFileSync(telePath, JSON.stringify(telemetry, null, 2));

    expect(telemetry.avgJsWorkMs).toBeLessThan(5.0); // JS calculation must remain well within frame budget
  });

  // Test 2: Record full video Light -> Dark (1920x1080 60fps)
  test("2. Record Liquid Flood Video - Light to Dark", async ({ browser }) => {
    const videoDir = path.join(process.cwd(), "temp-videos-l2d");
    if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

    const context = await browser.newContext({
      recordVideo: { dir: videoDir, size: { width: 1920, height: 1080 } },
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");

    // Put into light mode first without animation
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
      document.getElementById("themeLabel")!.innerText = "Chuyển sang Giao diện Tối";
    });
    await page.waitForTimeout(400);

    // Trigger organic liquid flood toggle to dark
    await page.click("#themeBtn");
    await page.waitForTimeout(1400);

    const telemetry = await page.evaluate(() => (window as any).__liquidPerformanceReport);

    await page.close();
    await context.close();

    const videoFiles = fs.readdirSync(videoDir);
    if (videoFiles.length > 0) {
      const srcVideo = path.join(videoDir, videoFiles[0]);
      await copyVideoToTargets(srcVideo, "a1-1-liquid-flood-light-to-dark.webm");
    }

    const telePath = path.resolve(process.cwd(), "..", "GRAPHITE-GLASS-DECK-A1.1-SCREENSHOTS", "liquid-telemetry-l2d.json");
    fs.writeFileSync(telePath, JSON.stringify(telemetry, null, 2));
  });

  // Test 3: Comprehensive progressive checkpoints & merge frames - Dark to Light
  test("3. Capture Forensic Motion Stages & Merging Checkpoints - Dark to Light", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");

    const steps = [
      { progress: 0.00, name: "a1-1-liquid-flood-dark-to-light-000.png" },
      { progress: 0.15, name: "a1-1-liquid-flood-dark-to-light-015.png" },
      { progress: 0.25, name: "a1-1-liquid-flood-dark-to-light-025.png" },
      { progress: 0.35, name: "a1-1-liquid-flood-dark-to-light-035.png" },
      { progress: 0.38, name: "a1-1-liquid-flood-dark-to-light-038-drop1-bridge.png" },
      { progress: 0.42, name: "a1-1-liquid-flood-dark-to-light-042-smootherstep.png" },
      { progress: 0.46, name: "a1-1-liquid-flood-dark-to-light-046-drop1-coalesce.png" },
      { progress: 0.50, name: "a1-1-liquid-flood-dark-to-light-050.png" },
      { progress: 0.58, name: "a1-1-liquid-flood-dark-to-light-058-drop2-coalesce.png" },
      { progress: 0.60, name: "a1-1-liquid-flood-dark-to-light-060.png" },
      { progress: 0.66, name: "a1-1-liquid-flood-dark-to-light-066-drop3-coalesce.png" },
      { progress: 0.75, name: "a1-1-liquid-flood-dark-to-light-075.png" },
      { progress: 0.90, name: "a1-1-liquid-flood-dark-to-light-090.png" },
      { progress: 1.00, name: "a1-1-liquid-flood-dark-to-light-100.png" },
    ];

    for (const step of steps) {
      await page.evaluate(({ prog }) => {
        (window as any).__setLiquidProgress(prog, "light");
      }, { prog: step.progress });
      await page.waitForTimeout(100);
      await saveMultiScreenshot(page, step.name, { fullPage: false });
    }
  });

  // Test 4: Comprehensive progressive checkpoints & merge frames - Light to Dark
  test("4. Capture Forensic Motion Stages & Merging Checkpoints - Light to Dark", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");

    const steps = [
      { progress: 0.00, name: "a1-1-liquid-flood-light-to-dark-000.png" },
      { progress: 0.15, name: "a1-1-liquid-flood-light-to-dark-015.png" },
      { progress: 0.25, name: "a1-1-liquid-flood-light-to-dark-025.png" },
      { progress: 0.35, name: "a1-1-liquid-flood-light-to-dark-035.png" },
      { progress: 0.38, name: "a1-1-liquid-flood-light-to-dark-038-drop1-bridge.png" },
      { progress: 0.42, name: "a1-1-liquid-flood-light-to-dark-042-smootherstep.png" },
      { progress: 0.46, name: "a1-1-liquid-flood-light-to-dark-046-drop1-coalesce.png" },
      { progress: 0.50, name: "a1-1-liquid-flood-light-to-dark-050.png" },
      { progress: 0.58, name: "a1-1-liquid-flood-light-to-dark-058-drop2-coalesce.png" },
      { progress: 0.60, name: "a1-1-liquid-flood-light-to-dark-060.png" },
      { progress: 0.66, name: "a1-1-liquid-flood-light-to-dark-066-drop3-coalesce.png" },
      { progress: 0.75, name: "a1-1-liquid-flood-light-to-dark-075.png" },
      { progress: 0.90, name: "a1-1-liquid-flood-light-to-dark-090.png" },
      { progress: 1.00, name: "a1-1-liquid-flood-light-to-dark-100.png" },
    ];

    for (const step of steps) {
      // Ensure base document is light
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "light");
        const themeLabel = document.getElementById("themeLabel");
        if (themeLabel) themeLabel.innerText = "Chuyển sang Giao diện Tối";
      });
      await page.waitForTimeout(50);
      await page.evaluate(({ prog }) => {
        (window as any).__setLiquidProgress(prog, "dark");
      }, { prog: step.progress });
      await page.waitForTimeout(100);
      await saveMultiScreenshot(page, step.name, { fullPage: false });
    }
  });

  // Test 5: Multi-viewport responsiveness & reflow
  test("5. Multi-viewport Responsiveness & Reflow (1366x768 & 960x540)", async ({ page }) => {
    // Laptop 1366x768 at 50% flood Dark
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => (window as any).__setLiquidProgress(0.5, "light"));
    await page.waitForTimeout(100);
    await saveMultiScreenshot(page, "a1-1-liquid-flood-1366x768-d2l-050.png");

    // Laptop 1366x768 at 50% flood Light
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
      (window as any).__setLiquidProgress(0.5, "dark");
    });
    await page.waitForTimeout(100);
    await saveMultiScreenshot(page, "a1-1-liquid-flood-1366x768-l2d-050.png");

    // Reflow 960x540 at 50% flood Dark
    await page.setViewportSize({ width: 960, height: 540 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => (window as any).__setLiquidProgress(0.5, "light"));
    await page.waitForTimeout(100);
    await saveMultiScreenshot(page, "a1-1-liquid-flood-960x540-reflow-050.png");
  });

  // Test 6: Verify Safe DOM Duplication (ZERO duplicate IDs, inert overlay, no focus traps)
  test("6. Verify Safe DOM Duplication Safeguards (No duplicate IDs, inert overlay)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");

    // Check baseline count of IDs
    const baseIdCount = await page.evaluate(() => document.querySelectorAll("[id]").length);

    // Activate transition overlay at 50%
    await page.evaluate(() => (window as any).__setLiquidProgress(0.5, "light"));
    await page.waitForTimeout(100);

    // Verify all IDs in document remain 100% strictly unique
    const duplicateIds = await page.evaluate(() => {
      const allIds = Array.from(document.querySelectorAll("[id]")).map(el => el.id);
      const seen = new Set();
      const duplicates: string[] = [];
      for (const id of allIds) {
        if (seen.has(id)) duplicates.push(id);
        seen.add(id);
      }
      return duplicates;
    });

    expect(duplicateIds).toEqual([]); // MUST BE ZERO DUPLICATES!

    // Verify inert and aria-hidden on flood layer
    const floodLayerAttrs = await page.evaluate(() => {
      const layer = document.getElementById("liquidFloodLayer");
      return {
        hasInert: layer?.hasAttribute("inert"),
        ariaHidden: layer?.getAttribute("aria-hidden"),
        display: layer ? window.getComputedStyle(layer).display : null,
        focusableInside: layer?.querySelectorAll("button:not([disabled]):not([tabindex='-1'])").length
      };
    });

    expect(floodLayerAttrs.hasInert).toBe(true);
    expect(floodLayerAttrs.ariaHidden).toBe("true");
    expect(floodLayerAttrs.focusableInside).toBe(0);

    // Cleanup and verify DOM restored
    await page.evaluate(() => (window as any).__setLiquidProgress(1.0, "light"));
    await page.waitForTimeout(100);

    const postCleanup = await page.evaluate(() => {
      const layer = document.getElementById("liquidFloodLayer");
      return {
        childrenCount: layer?.children.length,
        display: layer ? window.getComputedStyle(layer).display : null
      };
    });

    expect(postCleanup.childrenCount).toBe(0);
    expect(postCleanup.display).toBe("none");
  });

  // Test 7: Verify Accessibility: prefers-reduced-motion bypass & Keyboard activation
  test("7. Verify A11y prefers-reduced-motion instant switch & Keyboard trigger", async ({ page }) => {
    // 1. Emulate prefers-reduced-motion: reduce
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");

    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(initialTheme).toBe("dark");

    // Click theme toggle - should be instantaneous (0ms)
    await page.click("#themeBtn");
    await page.waitForTimeout(50); // tiny tick

    const nextTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(nextTheme).toBe("light");

    // Verify meniscus SVG is NOT displayed
    const meniscusDisplay = await page.evaluate(() => {
      const svg = document.getElementById("liquidMeniscusSvg");
      return svg ? window.getComputedStyle(svg).display : null;
    });
    expect(meniscusDisplay).toBe("none");

    // 2. Keyboard trigger: Focus and press Enter
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.focus("#themeBtn");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1400);

    const revertedTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(revertedTheme).toBe("dark");
  });

  // Test 8: Verify Rapid Clicking & Race Condition Shield
  test("8. Verify Rapid Repeated Clicks Race Condition Shield", async ({ page }) => {
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");

    // Rapidly click 6 times in 150ms
    for (let i = 0; i < 6; i++) {
      await page.click("#themeBtn", { delay: 20 });
    }

    // Wait for the single animation to complete cleanly
    await page.waitForFunction(() => {
      const floodLayer = document.getElementById("liquidFloodLayer");
      return (
        document.documentElement.getAttribute("data-theme") === "light" &&
        (!floodLayer || floodLayer.style.display === "none")
      );
    }, { timeout: 5000 });

    const themeAfter = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(themeAfter).toBe("light"); // cleanly toggled exactly once without crash or stuck overlay

    const overlayClean = await page.evaluate(() => {
      const layer = document.getElementById("liquidFloodLayer");
      return !layer || layer.children.length === 0;
    });
    expect(overlayClean).toBe(true);
  });

  // Test 9: Measure native unthrottled browser rendering performance (No video recording overhead)
  test("9. Measure Native Browser Rendering Telemetry (Unthrottled rAF)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(400);

    // Trigger organic liquid flood toggle
    await page.click("#themeBtn");

    // Wait for transition to complete deterministically
    await page.waitForFunction(() => {
      const floodLayer = document.getElementById("liquidFloodLayer");
      return (
        document.documentElement.getAttribute("data-theme") === "light" &&
        (!floodLayer || floodLayer.style.display === "none")
      );
    }, { timeout: 5000 });

    const telemetry = await page.evaluate(() => (window as any).__liquidPerformanceReport);

    const telePath = path.resolve(process.cwd(), "..", "GRAPHITE-GLASS-DECK-A1.1-SCREENSHOTS", "liquid-telemetry-unthrottled.json");
    fs.writeFileSync(telePath, JSON.stringify(telemetry, null, 2));

    expect(telemetry.avgJsWorkMs).toBeLessThan(3.0);
  });
});
