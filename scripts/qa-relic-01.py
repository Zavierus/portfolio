from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from playwright.sync_api import sync_playwright


VIEWPORTS = (
    ("desktop-1440", 1440, 900, "high"),
    ("desktop-1280", 1280, 720, "high"),
    ("mobile-390", 390, 844, "low"),
)


READBACK_SCRIPT = """
time => {
  window.__RELIC_01_QA__.seek(time);
  const canvas = document.querySelector('#exhibitionCanvas');
  const gl = canvas.getContext('webgl2');
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  const stride = Math.max(1, Math.floor((width * height) / 8192));
  let count = 0;
  let nonblack = 0;
  let sum = 0;
  let sumSquared = 0;
  for (let pixel = 0; pixel < width * height; pixel += stride) {
    const offset = pixel * 4;
    const luminance = (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 3;
    count += 1;
    sum += luminance;
    sumSquared += luminance * luminance;
    if (luminance > 8) nonblack += 1;
  }
  const mean = sum / count;
  return {
    width,
    height,
    mean: Math.round(mean * 1000) / 1000,
    stddev: Math.round(Math.sqrt(Math.max(0, sumSquared / count - mean * mean)) * 1000) / 1000,
    nonblackRatio: Math.round(nonblack / count * 10000) / 10000,
    glError: gl.getError(),
  };
}
"""


def main() -> None:
    parser = argparse.ArgumentParser(description="Visual and runtime QA for RELIC//01")
    parser.add_argument("--url", default="http://127.0.0.1:4173/projects/relic-01/")
    parser.add_argument("--output", default="artifacts/relic-01/playwright-qa")
    args = parser.parse_args()

    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    report: dict[str, object] = {"url": args.url, "viewports": [], "failures": []}

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for name, width, height, expected_lod in VIEWPORTS:
            page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
            console_errors: list[str] = []
            page_errors: list[str] = []
            failed_responses: list[dict[str, object]] = []
            responses: list[str] = []
            page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
            page.on("pageerror", lambda error: page_errors.append(str(error)))
            page.on("response", lambda response: responses.append(response.url))
            page.on(
                "response",
                lambda response: failed_responses.append({"url": response.url, "status": response.status})
                if response.status >= 400
                else None,
            )

            page.goto(args.url, wait_until="domcontentloaded")
            page.wait_for_function("document.body.dataset.assetState === 'ready'", timeout=60_000)
            page.evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
            runtime_asset = page.evaluate("window.__RELIC_01_QA__.asset()")
            page.screenshot(path=output / f"{name}-intro.png")

            play_button = page.get_by_role("button", name=re.compile("BEGIN STUDY"))
            play_button.click(no_wait_after=True)
            page.wait_for_function("window.__RELIC_01_QA__.state().playing === true")
            page.wait_for_timeout(240)
            playing_state = page.evaluate("window.__RELIC_01_QA__.state()")

            sample_times = (8, 21, 32, 41, 45) if name == "desktop-1440" else (32, 45)
            samples = []
            for time_value in sample_times:
                state = page.evaluate("time => window.__RELIC_01_QA__.seek(time)", time_value)
                page.evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
                screenshot_path = output / f"{name}-{time_value:02d}s.png"
                page.screenshot(path=screenshot_path)
                pixels = page.evaluate(READBACK_SCRIPT, time_value)
                if pixels["glError"] != 0 or pixels["stddev"] < 2 or pixels["nonblackRatio"] < 0.03:
                    report["failures"].append(f"{name}@{time_value}s canvas is blank or near-uniform: {pixels}")
                samples.append({"time": time_value, "state": state, "canvas": pixels})

            if page.evaluate("window.__RELIC_01_QA__.state().completed"):
                page.get_by_role("button", name=re.compile("REPLAY")).click(no_wait_after=True)
                page.wait_for_function("window.__RELIC_01_QA__.state().playing === true")
            replay_state = page.evaluate("window.__RELIC_01_QA__.state()")

            model_fragment = f"relic-01-{expected_lod}.glb"
            model_loaded = any(model_fragment in url for url in responses)
            basis_loaded = any("basis_transcoder.wasm" in url for url in responses)
            if runtime_asset["lod"] != expected_lod:
                report["failures"].append(f"{name} selected {runtime_asset['lod']} instead of {expected_lod}")
            if not model_loaded:
                report["failures"].append(f"{name} did not request {model_fragment}")
            if not basis_loaded:
                report["failures"].append(f"{name} did not request basis_transcoder.wasm")
            if console_errors or page_errors or failed_responses:
                report["failures"].append(f"{name} emitted browser errors")

            report["viewports"].append(
                {
                    "name": name,
                    "size": [width, height],
                    "runtimeAsset": runtime_asset,
                    "playingState": playing_state,
                    "replayState": replay_state,
                    "modelLoaded": model_loaded,
                    "basisLoaded": basis_loaded,
                    "consoleErrors": console_errors,
                    "pageErrors": page_errors,
                    "failedResponses": failed_responses,
                    "samples": samples,
                }
            )
            page.close()
        browser.close()

    result_path = output / "report.json"
    result_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    if report["failures"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
