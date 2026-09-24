import { readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import essentiaPackage from "essentia.js";

import { analyzeAudioPcm } from "../projects/pulse-room/src/analysis/offline-analysis.js";

const repositoryRoot = process.cwd();
const manifestPath = path.join(repositoryRoot, "projects/pulse-room/assets/music/track-manifest.json");

async function findFfmpeg() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  if (process.platform === "win32") {
    const root = path.join(os.homedir(), "AppData/Local/Programs/FFmpeg");
    const { readdir, access } = await import("node:fs/promises");
    try {
      for (const install of (await readdir(root)).sort().reverse()) {
        const candidate = path.join(root, install, "bin/ffmpeg.exe");
        try {
          await access(candidate);
          return candidate;
        } catch {
          // Continue searching local installs.
        }
      }
    } catch {
      // Fall through to PATH.
    }
  }
  return "ffmpeg";
}

function decodeMono(ffmpeg, input) {
  const result = spawnSync(ffmpeg, [
    "-v", "error", "-i", input,
    "-f", "f32le", "-ac", "1", "-ar", "44100", "pipe:1",
  ], { maxBuffer: 128 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`FFmpeg decode failed: ${result.stderr?.toString()}`);
  const bytes = result.stdout;
  return new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const ffmpeg = await findFfmpeg();
const essentia = new essentiaPackage.Essentia(essentiaPackage.EssentiaWASM);

for (const track of manifest.tracks) {
  const input = path.join(repositoryRoot, track.runtime.path);
  const pcm = decodeMono(ffmpeg, input);
  console.log(`${track.id}: analyzing ${Math.round(pcm.length / 44100)} seconds`);
  const analysis = analyzeAudioPcm({
    essentia,
    pcm,
    sampleRate: 44100,
    style: track.style,
    onProgress(progress) {
      if (progress === 1) console.log(`${track.id}: analysis complete`);
    },
  });
  const output = path.join(repositoryRoot, track.analysis.path);
  await writeFile(output, `${JSON.stringify({ trackId: track.id, style: track.style, ...analysis }, null, 2)}\n`, "utf8");
}
