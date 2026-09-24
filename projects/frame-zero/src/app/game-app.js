export function createGameApp({ renderer, audio, input, ui, loader }) {
  let currentState = "idle";
  let bootPromise = null;
  let unsubscribePointerLock = null;

  const setState = (nextState) => {
    currentState = nextState;
    ui.renderState(nextState);
  };

  const app = {
    async boot() {
      if (bootPromise) return bootPromise;
      if (currentState === "disposed") throw new Error("Cannot boot a disposed game app");

      bootPromise = (async () => {
        setState("loading");
        try {
          await renderer.boot?.();
          await audio.boot?.();
          input.attach?.();
          unsubscribePointerLock = input.onPointerLockLost?.(() => app.pause()) ?? null;
          await loader.loadAll((progress) => ui.renderProgress(progress));
          setState("ready");
        } catch (error) {
          unsubscribePointerLock?.();
          unsubscribePointerLock = null;
          input.detach?.();
          renderer.dispose?.();
          audio.dispose?.();
          setState("error");
          ui.renderError(error);
          throw error;
        }
      })();
      return bootPromise;
    },
    async start() {
      if (currentState !== "ready" && currentState !== "paused") return false;
      await audio.resume?.();
      input.enable?.();
      renderer.start?.();
      setState("playing");
      return true;
    },
    pause() {
      if (currentState !== "playing") return false;
      input.disable?.();
      renderer.pause?.();
      setState("paused");
      return true;
    },
    dispose() {
      if (currentState === "disposed") return;
      unsubscribePointerLock?.();
      input.detach?.();
      renderer.dispose?.();
      audio.dispose?.();
      setState("disposed");
    },
    state() {
      return currentState;
    },
  };

  return app;
}
