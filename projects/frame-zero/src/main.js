import { createGameApp } from "./app/game-app.js";
import { createAssetLoader } from "./app/asset-loader.js";
import { createAudioBridge } from "./audio/audio-engine.js";
import { createInputController } from "./input/input-controller.js";
import { createRendererBridge } from "./render/renderer.js";
import { createUiController } from "./ui/ui-controller.js";

const canvas = document.getElementById("gameCanvas");
const ui = createUiController(document);
const input = createInputController({ documentRef: document, canvas });
const renderer = createRendererBridge({ canvas, windowRef: window });
const audio = createAudioBridge();
const loader = createAssetLoader([
  { id: "runtime", load: async () => Promise.resolve() },
  { id: "blacksite", load: async () => import("./game.js") },
]);

const app = createGameApp({ renderer, audio, input, ui, loader });
window.frameZeroApp = app;
ui.renderPowerGrid(["external-link"]);

ui.bindRetry(() => window.location.reload());
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === canvas) app.start();
});
window.addEventListener("beforeunload", () => app.dispose(), { once: true });

app.boot().catch((error) => {
  console.error("FRAME//ZERO failed to boot", error);
});
