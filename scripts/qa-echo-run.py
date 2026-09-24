import json
from io import BytesIO
from pathlib import Path

from playwright.sync_api import sync_playwright
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
URL = "http://127.0.0.1:4173/projects/echo-hall/index.html"


def canvas_pixels(page):
    image = Image.open(BytesIO(page.locator("#filmCanvas").screenshot())).convert("RGB")
    image.thumbnail((64, 64))
    pixels = list(image.get_flattened_data())
    non_black = sum(1 for red, green, blue in pixels if red + green + blue > 24)
    colored = sum(1 for red, green, blue in pixels if max(red, green, blue) - min(red, green, blue) > 18)
    return {"nonBlack": non_black, "colored": colored, "total": len(pixels)}


def run_viewport(browser, name, viewport, exercise=False):
    context = browser.new_context(viewport=viewport, device_scale_factor=1)
    page = context.new_page()
    console_errors = []
    page_errors = []
    failed_requests = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    page.on("requestfailed", lambda request: failed_requests.append(f"{request.url}: {request.failure}"))
    page.goto(URL, wait_until="networkidle")
    page.wait_for_function("document.documentElement.dataset.echoRun === 'ready'", timeout=30000)
    page.wait_for_timeout(700)
    pixels = canvas_pixels(page)
    assert pixels["nonBlack"] > pixels["total"] * 0.16, pixels
    assert pixels["colored"] > 24, pixels
    assert page.locator("#filmLoader").is_hidden()
    assert page.locator("#playButton").get_attribute("aria-label") in {"播放", "暂停"}
    page.screenshot(path=str(ARTIFACTS / f"echo-run-{name}.png"), full_page=True)

    if exercise:
        page.locator("[data-chapter='resonance']").click()
        page.wait_for_timeout(650)
        assert page.locator("#chapterLabel").inner_text().startswith("共振")
        page.locator("#soundButton").click()
        page.wait_for_timeout(500)
        page.screenshot(path=str(ARTIFACTS / "echo-run-resonance-entry.png"))
        page.wait_for_timeout(6200)
        page.screenshot(path=str(ARTIFACTS / "echo-run-resonance-peak.png"))
        page.locator("[data-chapter='sync']").click()
        page.wait_for_timeout(900)
        page.screenshot(path=str(ARTIFACTS / "echo-run-sync.png"))
        page.locator("#playButton").click()
        assert page.locator("#playButton").get_attribute("aria-label") == "播放"
        page.locator("#playButton").click()
    result = {
        "viewport": viewport,
        "pixels": pixels,
        "shot": page.locator("#filmCanvas").get_attribute("data-shot"),
        "consoleErrors": console_errors,
        "pageErrors": page_errors,
        "failedRequests": failed_requests,
    }
    context.close()
    return result


def main():
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        results = [
            run_viewport(browser, "desktop", {"width": 1440, "height": 900}, exercise=True),
            run_viewport(browser, "mobile", {"width": 390, "height": 844}),
        ]
        browser.close()
    for result in results:
        assert not result["consoleErrors"], result["consoleErrors"]
        assert not result["pageErrors"], result["pageErrors"]
        assert not result["failedRequests"], result["failedRequests"]
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
