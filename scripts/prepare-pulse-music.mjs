import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = process.cwd();
const manifestPath = path.join(repositoryRoot, "projects/pulse-room/assets/music/track-manifest.json");
const nullOutput = process.platform === "win32" ? "NUL" : "/dev/null";

async function findFfmpegExecutable(name, environmentName) {
  const explicit = process.env[environmentName];
  if (explicit) return explicit;
  if (process.platform === "win32") {
    const root = path.join(os.homedir(), "AppData/Local/Programs/FFmpeg");
    try {
      const installs = (await readdir(root)).sort().reverse();
      for (const install of installs) {
        const candidate = path.join(root, install, "bin", `${name}.exe`);
        try {
          await access(candidate);
          return candidate;
        } catch {
          // Continue to the next local FFmpeg installation.
        }
      }
    } catch {
      // Fall through to PATH.
    }
  }
  return name;
}

function run(executable, args) {
  const result = spawnSync(executable, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(`${path.basename(executable)} failed:\n${result.stderr || result.stdout}`);
  }
  return { stdout: result.stdout, stderr: result.stderr };
}

function parseLoudnorm(stderr) {
  const matches = [...stderr.matchAll(/\{\s*"input_i"[\s\S]*?\}/g)];
  if (matches.length === 0) throw new Error("FFmpeg loudnorm analysis returned no JSON summary");
  return JSON.parse(matches.at(-1)[0]);
}

async function sha256(filePath) {
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const ffmpeg = await findFfmpegExecutable("ffmpeg", "FFMPEG_PATH");
const ffprobe = await findFfmpegExecutable("ffprobe", "FFPROBE_PATH");
const targetLufs = manifest.normalization.integratedLufs;
const processingTruePeakDb = manifest.normalization.processingTruePeakDb;

for (const track of manifest.tracks) {
  const input = path.join(repositoryRoot, track.source.localPath);
  const output = path.join(repositoryRoot, track.runtime.path);
  const analysisOutput = path.join(repositoryRoot, track.analysis.path);
  const sourceFile = await stat(input);
  const sourceHash = await sha256(input);
  if (sourceFile.size !== track.source.bytes || sourceHash !== track.source.sha256) {
    throw new Error(`${track.id} source file does not match its frozen hash`);
  }

  await mkdir(path.dirname(output), { recursive: true });
  await mkdir(path.dirname(analysisOutput), { recursive: true });
  const firstPass = parseLoudnorm(run(ffmpeg, [
    "-hide_banner", "-nostats", "-i", input,
    "-af", `loudnorm=I=${targetLufs}:TP=${processingTruePeakDb}:LRA=11:print_format=json`,
    "-f", "null", nullOutput,
  ]).stderr);
  const filter = [
    `loudnorm=I=${targetLufs}:TP=${processingTruePeakDb}:LRA=11`,
    `measured_I=${firstPass.input_i}`,
    `measured_LRA=${firstPass.input_lra}`,
    `measured_TP=${firstPass.input_tp}`,
    `measured_thresh=${firstPass.input_thresh}`,
    `offset=${firstPass.target_offset}`,
    "linear=true",
    "print_format=summary",
  ].join(":");
  run(ffmpeg, [
    "-hide_banner", "-nostats", "-y", "-i", input,
    "-map_metadata", "-1",
    "-metadata", `title=${track.title}`,
    "-metadata", `artist=${track.artist}`,
    "-af", filter,
    "-ar", "48000", "-ac", "2",
    "-c:a", "libmp3lame", "-b:a", "192k",
    output,
  ]);

  const probe = JSON.parse(run(ffprobe, [
    "-v", "error",
    "-show_entries", "format=duration,bit_rate:stream=codec_name,sample_rate,channels",
    "-of", "json",
    output,
  ]).stdout);
  const verification = parseLoudnorm(run(ffmpeg, [
    "-hide_banner", "-nostats", "-i", output,
    "-af", `loudnorm=I=${targetLufs}:TP=${processingTruePeakDb}:LRA=11:print_format=json`,
    "-f", "null", nullOutput,
  ]).stderr);
  const outputFile = await stat(output);
  const stream = probe.streams[0];
  track.duration = Math.round(Number(probe.format.duration) * 1000) / 1000;
  Object.assign(track.runtime, {
    bytes: outputFile.size,
    sha256: await sha256(output),
    sampleRate: Number(stream.sample_rate),
    channels: Number(stream.channels),
    integratedLufs: Number(verification.input_i),
    truePeakDb: Number(verification.input_tp),
  });
  await writeFile(analysisOutput, `${JSON.stringify({
    contractVersion: 1,
    trackId: track.id,
    style: track.style,
    duration: track.duration,
    bpm: track.bpm,
    bpmSource: track.bpmSource,
    sections: [],
  }, null, 2)}\n`, "utf8");
  console.log(`${track.id}: ${track.duration}s, ${track.runtime.integratedLufs} LUFS, ${track.runtime.truePeakDb} dBTP`);
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
