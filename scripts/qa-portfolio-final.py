import json
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
URL = "http://127.0.0.1:4173/index.html"


def run_viewport(browser, name, viewport):
    context = browser.new_context(viewport=viewport, device_scale_factor=1)
    page = context.new_page()
    console_errors = []
    page_errors = []
    failed_requests = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    page.on("requestfailed", lambda request: failed_requests.append(f"{request.url}: {request.failure}"))
    page.goto(URL, wait_until="networkidle")
    echo = page.locator(".project-band--echo")
    echo.scroll_into_view_if_needed()
    page.wait_for_timeout(350)
    assert echo.get_by_text("REAL-TIME FILM / WATCH NOW").is_visible()
    assert echo.get_by_text("已发布", exact=True).is_visible()
    assert echo.get_by_text("WATCH THE FILM").is_visible()
    image = echo.locator('img:not([alt=""])')
    assert image.evaluate("node => node.complete && node.naturalWidth > 0")
    page.screenshot(path=str(ARTIFACTS / f"portfolio-final-{name}.png"), full_page=True)
    echo.screenshot(path=str(ARTIFACTS / f"portfolio-echo-{name}.png"))
    assert not console_errors, console_errors
    assert not page_errors, page_errors
    assert not failed_requests, failed_requests
    result = {
        "viewport": viewport,
        "echoImage": image.evaluate("node => ({ width: node.naturalWidth, height: node.naturalHeight })"),
        "echoBand": echo.bounding_box(),
    }
    context.close()
    return result


def main():
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        results = [
            run_viewport(browser, "desktop", {"width": 1440, "height": 900}),
            run_viewport(browser, "mobile", {"width": 390, "height": 844}),
        ]
        browser.close()
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
