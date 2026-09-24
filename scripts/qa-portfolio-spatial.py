import argparse
import base64
import json
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts" / "portfolio-spatial"


def inspect_page(browser, url, name, viewport, capture_poster=False):
    context = browser.new_context(
        viewport=viewport,
        reduced_motion="reduce" if name == "mobile" else "no-preference",
        device_scale_factor=1,
    )
    page = context.new_page()
    console_errors = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.goto(url, wait_until="networkidle")
    page.wait_for_timeout(1200)

    screenshot_path = ARTIFACTS / f"{name}.png"
    page.screenshot(path=str(screenshot_path), full_page=True)
    hero = page.locator("#identity")
    work = page.locator("#work")
    canvas = page.locator("[data-hero-canvas]")
    poster = page.locator("[data-hero-poster]")
    hero_box = hero.bounding_box()
    work_box = work.bounding_box()
    mode = hero.get_attribute("data-hero-mode")
    canvas_variance = None

    if mode == "realtime" and canvas.is_visible():
      canvas_path = ARTIFACTS / f"{name}-canvas.png"
      page.add_style_tag(content="""
        .site-header, .identity-copy, .identity-project, .identity-cue, .identity-scrim {
          visibility: hidden !important;
        }
      """)
      canvas_bytes = canvas.screenshot(path=str(canvas_path))
      encoded = base64.b64encode(canvas_bytes).decode("ascii")
      image_result = page.evaluate("""async encodedPng => {
        const image = new Image();
        image.src = `data:image/png;base64,${encodedPng}`;
        await image.decode();
        const surface = document.createElement('canvas');
        surface.width = image.naturalWidth;
        surface.height = image.naturalHeight;
        const context = surface.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, surface.width, surface.height).data;
        const channels = [[], [], []];
        for (let index = 0; index < pixels.length; index += 388) {
          channels[0].push(pixels[index]);
          channels[1].push(pixels[index + 1]);
          channels[2].push(pixels[index + 2]);
        }
        const variance = channels.reduce((total, channel) => {
          const mean = channel.reduce((sum, value) => sum + value, 0) / channel.length;
          return total + channel.reduce((sum, value) => sum + (value - mean) ** 2, 0) / channel.length;
        }, 0) / 3;
        return { variance, webp: surface.toDataURL('image/webp', 0.86).split(',')[1] };
      }""", encoded)
      canvas_variance = image_result["variance"]
      if capture_poster:
          poster_path = ROOT / "assets" / "hero" / "monumental-fracture-poster.webp"
          poster_path.parent.mkdir(parents=True, exist_ok=True)
          poster_path.write_bytes(base64.b64decode(image_result["webp"]))
          print(f"Poster captured at {poster_path}")
    result = {
        "name": name,
        "viewport": viewport,
        "mode": mode,
        "canvasVisible": canvas.is_visible(),
        "posterVisible": poster.is_visible(),
        "heroBox": hero_box,
        "workTop": work_box["y"] if work_box else None,
        "nextSectionVisible": bool(work_box and work_box["y"] < viewport["height"]),
        "canvasVariance": canvas_variance,
        "consoleErrors": console_errors,
    }
    context.close()
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:4173/")
    parser.add_argument("--capture-poster", action="store_true")
    parser.add_argument("--desktop-only", action="store_true")
    args = parser.parse_args()
    ARTIFACTS.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        results = [inspect_page(
            browser,
            args.url,
            "desktop",
            {"width": 1440, "height": 900},
            capture_poster=args.capture_poster,
        )]
        if not args.desktop_only:
            results.append(inspect_page(
                browser,
                args.url,
                "compact-desktop",
                {"width": 1280, "height": 720},
            ))
            results.append(inspect_page(
                browser,
                args.url,
                "mobile",
                {"width": 390, "height": 844},
            ))
        browser.close()

    print(json.dumps(results, ensure_ascii=False, indent=2))
    failures = []
    for result in results:
        if result["consoleErrors"]:
            failures.append(f'{result["name"]}: console errors')
        if result["name"] != "mobile":
            if result["mode"] != "realtime": failures.append("desktop: realtime mode not active")
            if not result["canvasVariance"] or result["canvasVariance"] < 35:
                failures.append("desktop: canvas is blank or lacks visual range")
        if not result["nextSectionVisible"]:
            failures.append(f'{result["name"]}: next section is not visible')
    if failures:
        raise SystemExit("; ".join(failures))


if __name__ == "__main__":
    main()
