import { createStaticMediaLoader } from "./static-media-loader.js";

export function createAudioBlobCache(options) {
  return createStaticMediaLoader(options);
}
