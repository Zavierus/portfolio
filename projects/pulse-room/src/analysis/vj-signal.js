const SIGNAL_FIELDS = Object.freeze(["energy", "low", "mid", "high", "onset", "spectralCentroid"]);

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.min(1, Math.max(0, finite(value)));
const wrap01 = (value) => ((finite(value) % 1) + 1) % 1;
const lerp = (start, end, amount) => start + (end - start) * amount;

function sampleFrames(frames, time) {
  if (!Array.isArray(frames) || frames.length === 0) return null;
  if (frames.length === 1 || time <= finite(frames[0].time)) return frames[0];
  const last = frames.at(-1);
  if (time >= finite(last.time)) return last;

  let rightIndex = 1;
  while (rightIndex < frames.length && finite(frames[rightIndex].time) < time) rightIndex += 1;
  const left = frames[rightIndex - 1];
  const right = frames[rightIndex];
  const span = Math.max(0.000001, finite(right.time) - finite(left.time));
  const progress = clamp01((time - finite(left.time)) / span);
  return Object.fromEntries(SIGNAL_FIELDS.map((field) => [
    field,
    lerp(clamp01(left[field]), clamp01(right[field]), progress),
  ]));
}

function resolveSection(sections, time) {
  if (!Array.isArray(sections)) return "realtime";
  const section = sections.find(({ start, end }) => time >= finite(start) && time < finite(end));
  return typeof section?.id === "string" && section.id ? section.id : "realtime";
}

function sampleEvent(events, time, typeField) {
  if (!Array.isArray(events) || events.length === 0) return null;
  let selected = null;
  for (const event of events) {
    const eventTime = Math.max(0, finite(event?.time));
    if (eventTime > time) break;
    selected = event;
  }
  if (!selected) return null;
  if (time - Math.max(0, finite(selected.time)) > 0.09) return null;
  const type = typeof selected[typeField] === "string" && selected[typeField]
    ? selected[typeField]
    : "event";
  return Object.freeze({
    time: Math.max(0, finite(selected.time)),
    type,
    intensity: clamp01(selected.intensity),
    sectionId: typeof selected.sectionId === "string" ? selected.sectionId : "",
  });
}

export function createVjSignal({ time = 0, realtime = {}, analysis = null, fallbackBpm = null } = {}) {
  const safeTime = Math.max(0, finite(time));
  const bpm = finite(analysis?.bpm, finite(fallbackBpm));
  const beatOffset = finite(analysis?.beatOffset);
  const beatPosition = bpm > 0 ? Math.max(0, safeTime - beatOffset) * bpm / 60 : 0;
  const frame = sampleFrames(analysis?.frames, safeTime);
  const values = {};
  for (const field of SIGNAL_FIELDS) {
    const liveValue = clamp01(realtime?.[field]);
    const frameValue = frame ? clamp01(frame[field]) : null;
    values[field] = frameValue === null
      ? liveValue
      : realtime?.[field] === undefined
        ? frameValue
        : clamp01(lerp(frameValue, liveValue, field === "onset" ? 0.42 : 0.24));
  }

  return Object.freeze({
    time: safeTime,
    beatPhase: wrap01(beatPosition),
    barPhase: wrap01(beatPosition / 4),
    section: analysis ? resolveSection(analysis.sections, safeTime) : "realtime",
    peak: values.energy,
    cameraEvent: sampleEvent(analysis?.cameraEvents, safeTime, "gesture"),
    particleEvent: sampleEvent(analysis?.particleEvents, safeTime, "type"),
    ...values,
  });
}
