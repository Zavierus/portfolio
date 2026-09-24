import json
import math
import time
from io import BytesIO

from PIL import Image
from playwright.sync_api import sync_playwright


URL = "http://127.0.0.1:4173/projects/echo-hall/index.html"


def canvas_pixels(page):
    image = Image.open(BytesIO(page.locator("#filmCanvas").screenshot())).convert("RGB")
    image.thumbnail((64, 64))
    pixels = list(image.get_flattened_data())
    return {
        "nonBlack": sum(1 for red, green, blue in pixels if red + green + blue > 24),
        "colored": sum(
            1 for red, green, blue in pixels
            if max(red, green, blue) - min(red, green, blue) > 18
        ),
        "total": len(pixels),
    }


def open_ready(page):
    page.goto(URL, wait_until="networkidle")
    page.wait_for_function("document.documentElement.dataset.echoRun === 'ready'", timeout=30000)


def assert_clean(errors):
    assert not errors["console"], errors["console"]
    assert not errors["page"], errors["page"]
    assert not errors["requests"], errors["requests"]


def collect_errors(page):
    errors = {"console": [], "page": [], "requests": []}
    page.on(
        "console",
        lambda message: errors["console"].append(message.text)
        if message.type == "error" else None,
    )
    page.on("pageerror", lambda error: errors["page"].append(str(error)))
    page.on(
        "requestfailed",
        lambda request: errors["requests"].append(f"{request.url}: {request.failure}"),
    )
    return errors


def percentile(values, fraction):
    if not values:
        return 0
    ordered = sorted(values)
    return ordered[min(len(ordered) - 1, math.ceil(len(ordered) * fraction) - 1)]


def verify_loop(browser):
    context = browser.new_context(viewport={"width": 1280, "height": 720})
    page = context.new_page()
    page.add_init_script("window.__ECHO_RUN_QA__ = { timeScale: 20 };")
    errors = collect_errors(page)
    open_ready(page)
    page.evaluate(
        """
        window.__echoQaFrameDeltas = [];
        let prior = performance.now();
        function collectFrame(now) {
          const delta = now - prior;
          prior = now;
          if (delta > 0) window.__echoQaFrameDeltas.push(delta);
          requestAnimationFrame(collectFrame);
        }
        requestAnimationFrame(collectFrame);
        """
    )

    transitions = []
    last_chapter = None
    loop_pixels = {}
    started = time.monotonic()
    while time.monotonic() - started < 60.0:
        elapsed = time.monotonic() - started
        chapter = page.locator("#chapterLabel").inner_text()
        if chapter != last_chapter:
            transitions.append({"elapsed": round(elapsed, 2), "chapter": chapter})
            last_chapter = chapter
        film_time = int(page.locator("#filmTime").inner_text().split(":")[-1])
        if "before" not in loop_pixels and chapter.startswith("同步") and film_time >= 57:
            loop_pixels["before"] = canvas_pixels(page)
        if "after" not in loop_pixels and len(transitions) >= 5 and chapter.startswith("启动"):
            loop_pixels["after"] = canvas_pixels(page)
            break
        page.wait_for_timeout(80)

    frame_deltas = page.evaluate("window.__echoQaFrameDeltas")
    chapters = [item["chapter"].split(" /")[0] for item in transitions]
    assert chapters[:4] == ["启动", "加速", "共振", "同步"], transitions
    sync_index = chapters.index("同步")
    assert "启动" in chapters[sync_index + 1:], transitions
    assert loop_pixels["before"]["nonBlack"] > loop_pixels["before"]["total"] * 0.16
    assert loop_pixels["after"]["nonBlack"] > loop_pixels["after"]["total"] * 0.16
    assert_clean(errors)
    result = {
        "transitions": transitions,
        "loopPixels": loop_pixels,
        "frameSamples": len(frame_deltas),
        "frameMsAverage": round(sum(frame_deltas) / len(frame_deltas), 2),
        "frameMsP95": round(percentile(frame_deltas, 0.95), 2),
        "frameMsMax": round(max(frame_deltas), 2),
        "filmTimeScale": 20,
    }
    context.close()
    return result


def verify_reduced_motion(browser):
    context = browser.new_context(
        viewport={"width": 390, "height": 844},
        reduced_motion="reduce",
    )
    page = context.new_page()
    errors = collect_errors(page)
    open_ready(page)
    page.locator("[data-chapter='resonance']").click()
    page.wait_for_timeout(900)
    assert page.locator(".scan-field").evaluate("node => getComputedStyle(node).display") == "none"
    pixels = canvas_pixels(page)
    assert pixels["nonBlack"] > pixels["total"] * 0.16
    assert_clean(errors)
    context.close()
    return {"canvas": pixels, "scanField": "none", "storyChapter": "resonance"}


def verify_webgl_failure(browser):
    context = browser.new_context(viewport={"width": 1280, "height": 720})
    page = context.new_page()
    page.add_init_script(
        """
        const nativeGetContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) {
          if (["webgl", "webgl2", "experimental-webgl"].includes(type)) return null;
          return nativeGetContext.call(this, type, ...args);
        };
        """
    )
    page.goto(URL, wait_until="networkidle")
    page.wait_for_function("document.documentElement.dataset.echoRun === 'error'", timeout=30000)
    assert page.locator("#filmError").is_visible()
    assert page.locator("#retryButton").is_hidden()
    assert page.locator("#filmError a").is_visible()
    result = {"error": page.locator("#filmErrorMessage").inner_text(), "retry": False, "back": True}
    context.close()
    return result


def verify_model_failure(browser):
    context = browser.new_context(viewport={"width": 1280, "height": 720})
    page = context.new_page()
    page.route("**/models/echo-runner.glb", lambda route: route.abort())
    page.goto(URL, wait_until="networkidle")
    page.wait_for_function("document.documentElement.dataset.echoRun === 'error'", timeout=30000)
    assert page.locator("#filmError").is_visible()
    assert page.locator("#retryButton").is_visible()
    assert page.locator("#filmError a").is_visible()
    result = {"error": page.locator("#filmErrorMessage").inner_text(), "retry": True, "back": True}
    context.close()
    return result


def verify_silent_fallback(browser):
    context = browser.new_context(viewport={"width": 1280, "height": 720})
    page = context.new_page()
    expected_failures = []
    page.on("requestfailed", lambda request: expected_failures.append(request.url))
    page.route("**/audio/*.wav", lambda route: route.abort())
    open_ready(page)
    page.wait_for_timeout(600)
    assert page.locator("#filmStatus").inner_text() == "声场测试进行中"
    assert page.locator("#soundButton").get_attribute("aria-label") == "开启声音"
    pixels = canvas_pixels(page)
    assert pixels["nonBlack"] > pixels["total"] * 0.16
    page.evaluate(
        """
        window.__echoQaHidden = true;
        Object.defineProperty(document, "hidden", {
          configurable: true,
          get: () => window.__echoQaHidden,
        });
        document.dispatchEvent(new Event("visibilitychange"));
        """
    )
    assert page.locator("#playButton").get_attribute("aria-label") == "播放"
    page.evaluate(
        """
        window.__echoQaHidden = false;
        document.dispatchEvent(new Event("visibilitychange"));
        """
    )
    assert page.locator("#playButton").get_attribute("aria-label") == "暂停"
    result = {
        "blockedAudioRequests": len(expected_failures),
        "visualPlayback": "ready",
        "visibilityPauseResume": True,
        "canvas": pixels,
    }
    context.close()
    return result


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        result = {
            "loop": verify_loop(browser),
            "reducedMotion": verify_reduced_motion(browser),
            "webglFailure": verify_webgl_failure(browser),
            "modelFailure": verify_model_failure(browser),
            "silentFallback": verify_silent_fallback(browser),
        }
        browser.close()
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
