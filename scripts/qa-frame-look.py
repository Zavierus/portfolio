import argparse
import json
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts" / "frame-zero"


def dispatch_mouse(page, movement_x, movement_y):
    page.evaluate(
        """([movementX, movementY]) => {
          const event = new MouseEvent('mousemove', { bubbles: true });
          Object.defineProperty(event, 'movementX', { value: movementX });
          Object.defineProperty(event, 'movementY', { value: movementY });
          window.dispatchEvent(event);
        }""",
        [movement_x, movement_y],
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:4173/projects/frame-zero/")
    args = parser.parse_args()
    ARTIFACTS.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        errors = []
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.add_init_script("window.__FRAME_ZERO_QA__ = {};")
        page.goto(args.url, wait_until="networkidle")
        page.wait_for_function("document.body.dataset.appState === 'ready'")
        page.wait_for_function("typeof window.__FRAME_ZERO_QA__.lookState === 'function'")

        assert page.locator('button[data-look-level="medium"]').get_attribute("aria-pressed") == "true"
        page.locator('button[data-look-level="low"]').click()
        assert page.evaluate("localStorage.getItem('frame-zero.look-level')") == "low"
        page.screenshot(path=str(ARTIFACTS / "look-settings.png"))

        page.locator("#startButton").click()
        page.wait_for_function("document.pointerLockElement?.id === 'gameCanvas'")
        before = page.evaluate("window.__FRAME_ZERO_QA__.lookState()")
        page.evaluate(
            """() => {
              window.__FRAME_ZERO_QA__.rearmLookWarmup();
              const event = new MouseEvent('mousemove', { bubbles: true });
              Object.defineProperty(event, 'movementX', { value: 800 });
              Object.defineProperty(event, 'movementY', { value: -900 });
              window.dispatchEvent(event);
            }"""
        )
        page.wait_for_timeout(80)
        warmup = page.evaluate("window.__FRAME_ZERO_QA__.lookState()")
        assert abs(warmup["pitch"] - before["pitch"]) < 0.000001, {"before": before, "warmup": warmup}

        page.wait_for_timeout(100)
        dispatch_mouse(page, 40, -24)
        page.wait_for_timeout(120)
        moved = page.evaluate("window.__FRAME_ZERO_QA__.lookState()")
        assert moved["pitch"] > warmup["pitch"]
        assert abs(moved["pitch"]) <= 1.08
        assert moved["level"] == "low"
        page.screenshot(path=str(ARTIFACTS / "look-controlled.png"))
        browser.close()

    result = {"errors": errors, "before": before, "warmup": warmup, "moved": moved}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit("console errors detected")


if __name__ == "__main__":
    main()
