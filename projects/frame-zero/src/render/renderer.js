export function createRendererBridge({ canvas, windowRef }) {
  return {
    async boot() {
      if (!canvas) throw new Error("找不到游戏画布");
      if (!windowRef.WebGL2RenderingContext) throw new Error("当前浏览器不支持 WebGL 2");
    },
    start() {},
    pause() {},
    dispose() {},
  };
}

