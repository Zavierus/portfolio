import argparse
import base64
import json
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts" / "listener"


def image_variance(page, locator, path):
    page.evaluate("""() => {
      for (const element of document.body.children) {
        if (element.id === 'filmCanvas' || element.tagName === 'SCRIPT') continue;
        element.dataset.qaVisibility = element.style.visibility;
        element.style.visibility = 'hidden';
      }
    }""")
    image_bytes = locator.screenshot(path=str(path))
    page.evaluate("""() => {
      for (const element of document.body.children) {
        if (!Object.hasOwn(element.dataset, 'qaVisibility')) continue;
        element.style.visibility = element.dataset.qaVisibility;
        delete element.dataset.qaVisibility;
      }
    }""")
    encoded = base64.b64encode(image_bytes).decode("ascii")
    return page.evaluate("""async encodedPng => {
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
      return channels.reduce((total, channel) => {
        const mean = channel.reduce((sum, value) => sum + value, 0) / channel.length;
        return total + channel.reduce((sum, value) => sum + (value - mean) ** 2, 0) / channel.length;
      }, 0) / 3;
    }""", encoded)


def wait_ready(page):
    page.wait_for_function("document.body.dataset.filmPhase === 'ready'", timeout=30000)


def desktop_pass(browser, url):
    context = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    page = context.new_page()
    errors = []
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    page.add_init_script("window.__LISTENER_QA__ = { timeScale: 1 };")
    page.goto(url, wait_until="networkidle")
    wait_ready(page)
    page.screenshot(path=str(ARTIFACTS / "desktop-title.png"))
    assert page.locator("#playButton").is_visible()
    assert page.locator("button[data-chapter]").count() == 0
    assert "ECHO RUN" not in page.content()

    page.locator("#playButton").click()
    page.wait_for_function("document.body.dataset.filmPhase === 'playing'", timeout=15000)
    checkpoints = [6, 20, 36, 54, 72, 88, 94.4]
    variances = {}
    for checkpoint in checkpoints:
        page.evaluate("time => window.__LISTENER_QA__.seek(time)", checkpoint)
        page.wait_for_timeout(180)
        page.screenshot(path=str(ARTIFACTS / f"desktop-{checkpoint:04.1f}.png"))
        if checkpoint in [6, 36, 72, 94.4]:
            variances[str(checkpoint)] = image_variance(
                page,
                page.locator("#filmCanvas"),
                ARTIFACTS / f"desktop-{checkpoint:04.1f}-canvas.png",
            )

    page.evaluate("window.__LISTENER_QA__.seek(94.8)")
    page.wait_for_function("document.body.dataset.filmPhase === 'finished'", timeout=5000)
    page.screenshot(path=str(ARTIFACTS / "desktop-finished.png"))
    assert page.locator("#replayButton").is_visible()
    page.locator("#replayButton").click()
    page.wait_for_function("document.body.dataset.filmPhase === 'playing'")
    assert page.evaluate("window.__LISTENER_QA__.state().time") < 1
    page.mouse.move(720, 450)
    page.wait_for_timeout(100)
    page.locator("#exitButton").click(force=True)
    page.wait_for_function("document.body.dataset.filmPhase === 'ready'")
    context.close()
    return {"errors": errors, "variances": variances}


def mobile_pass(browser, url):
    context = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=1, is_mobile=True)
    page = context.new_page()
    errors = []
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    page.add_init_script("window.__LISTENER_QA__ = { timeScale: 1 };")
    page.goto(url, wait_until="networkidle")
    wait_ready(page)
    page.screenshot(path=str(ARTIFACTS / "mobile-title.png"))
    title_box = page.locator("#filmTitle").bounding_box()
    assert title_box and title_box["x"] >= 0 and title_box["x"] + title_box["width"] <= 390
    assert page.evaluate("document.documentElement.scrollWidth") <= 390
    page.locator("#playButton").click()
    page.wait_for_function("document.body.dataset.filmPhase === 'playing'", timeout=15000)
    page.evaluate("window.__LISTENER_QA__.seek(88)")
    page.wait_for_timeout(220)
    page.screenshot(path=str(ARTIFACTS / "mobile-reconstruction.png"))
    variance = image_variance(page, page.locator("#filmCanvas"), ARTIFACTS / "mobile-reconstruction-canvas.png")
    context.close()
    return {"errors": errors, "variance": variance}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:4173/projects/echo-hall/")
    args = parser.parse_args()
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        desktop_browser = playwright.chromium.launch(headless=True)
        desktop = desktop_pass(desktop_browser, args.url)
        desktop_browser.close()
        mobile_browser = playwright.chromium.launch(headless=True)
        mobile = mobile_pass(mobile_browser, args.url)
        mobile_browser.close()
        results = {"desktop": desktop, "mobile": mobile}
    print(json.dumps(results, ensure_ascii=False, indent=2))
    failures = []
    for name, result in results.items():
        if result["errors"]: failures.append(f"{name}: console errors")
    if min(results["desktop"]["variances"].values()) < 25: failures.append("desktop: blank checkpoint")
    if results["mobile"]["variance"] < 25: failures.append("mobile: blank reconstruction")
    if failures: raise SystemExit("; ".join(failures))


if __name__ == "__main__":
    main()
