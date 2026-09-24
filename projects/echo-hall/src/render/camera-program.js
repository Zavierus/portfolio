import * as THREE from "three";

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, Number(value) || 0));
const smoothstep = (value) => value * value * (3 - 2 * value);
const lerp = (start, end, amount) => start + (end - start) * amount;
const lerpVector = (start, end, amount) => start.map((value, index) => lerp(value, end[index], amount));
const shot = (value) => Object.freeze({ ...value, position: Object.freeze(value.position), target: Object.freeze(value.target) });

export const CAMERA_PROGRAM = Object.freeze([
  shot({ id: "signal-black", chapterId: "greeting", subject: "archive-signal", start: 0, end: 8, position: [0.4, 0.2, 10.5], target: [-0.9, 0.25, -0.3], focalLength: 78, transition: 0 }),
  shot({ id: "reliquary-silhouette", chapterId: "greeting", subject: "listener", start: 8, end: 12, position: [-5.6, 1.4, 8.8], target: [-0.8, 0.35, -0.2], focalLength: 56, transition: 0.9 }),
  shot({ id: "surface-macro", chapterId: "misread-scale", subject: "listener-shell-spine", start: 12, end: 20, position: [4.5, 1, 9.5], target: [-0.8, 0.3, -0.2], focalLength: 60, transition: 0 }),
  shot({ id: "scale-drop", chapterId: "misread-scale", subject: "megastructure-scale", start: 20, end: 28, position: [-13, -3.8, 23], target: [-0.5, 0, -7.5], focalLength: 34, transition: 1.35 }),
  shot({ id: "fold-event", chapterId: "wake", subject: "living-structure", start: 28, end: 38, position: [7.8, 2, 12.5], target: [-0.5, 0.2, -5.5], focalLength: 44, transition: 0 }),
  shot({ id: "listening-field", chapterId: "wake", subject: "listener-and-structure", start: 38, end: 46, position: [-7.4, 2.6, 11.8], target: [-0.7, 0.5, -2.2], focalLength: 50, transition: 1.2 }),
  shot({ id: "memory-material", chapterId: "recognition", subject: "memory-fragments", start: 46, end: 55, position: [2.4, 0.8, 8.4], target: [-2.2, 0.4, -1.5], focalLength: 56, transition: 0 }),
  shot({ id: "human-traces", chapterId: "recognition", subject: "memory-fragments", start: 55, end: 63, position: [-3.4, 1.8, 8.6], target: [-1.5, 0.45, -3.4], focalLength: 48, transition: 1 }),
  shot({ id: "dead-earth", chapterId: "extinction", subject: "dead-earth", start: 63, end: 73, position: [0.6, 0.7, 10], target: [0.4, -0.05, -4.4], focalLength: 60, transition: 0 }),
  shot({ id: "archive-date", chapterId: "extinction", subject: "listener-core", start: 73, end: 80, position: [-7, 0.8, 10.5], target: [-3.8, 0.3, -0.2], focalLength: 60, transition: 0.9 }),
  shot({ id: "core-open", chapterId: "reconstruction", subject: "open-archive", start: 80, end: 88, position: [-7, 1.1, 9.8], target: [-1.3, 0.3, -0.5], focalLength: 52, transition: 0 }),
  shot({ id: "first-body", chapterId: "reconstruction", subject: "archive-and-body", start: 88, end: 95, position: [5.2, 1.5, 10.8], target: [-0.6, 0.45, -1.8], focalLength: 48, transition: 1.1 }),
]);

const PORTRAIT_FULL_FIGURE_SHOTS = new Set([
  "reliquary-silhouette",
  "surface-macro",
  "listening-field",
  "memory-material",
  "archive-date",
  "core-open",
  "first-body",
]);

export function shotAtTime(time, program = CAMERA_PROGRAM) {
  const filmTime = clamp(time, program[0].start, program.at(-1).end);
  return program.find((entry) => filmTime >= entry.start && filmTime < entry.end) ?? program.at(-1);
}

export function sampleCameraProgram(time, program = CAMERA_PROGRAM) {
  const filmTime = clamp(time, program[0].start, program.at(-1).end);
  const current = shotAtTime(filmTime, program);
  const index = program.indexOf(current);
  const transitionEnd = current.start + current.transition;
  if (index === 0 || current.transition <= 0 || filmTime >= transitionEnd) {
    return { ...current, transitionProgress: 1 };
  }
  const previous = program[index - 1];
  const progress = smoothstep(clamp((filmTime - current.start) / current.transition, 0, 1));
  return {
    ...current,
    position: lerpVector(previous.position, current.position, progress),
    target: lerpVector(previous.target, current.target, progress),
    focalLength: lerp(previous.focalLength, current.focalLength, progress),
    transitionProgress: progress,
  };
}

export function focalLengthToFov(focalLength, sensorHeight = 24) {
  return THREE.MathUtils.radToDeg(2 * Math.atan(sensorHeight / (2 * focalLength)));
}

export class CameraProgram {
  constructor({ aspect = 1, camera, program = CAMERA_PROGRAM } = {}) {
    this.camera = camera ?? new THREE.PerspectiveCamera(46, aspect, 0.1, 180);
    this.program = program;
    this.target = new THREE.Vector3();
    this.apply(0);
  }

  sample(time) { return sampleCameraProgram(time, this.program); }

  apply(time) {
    const frame = this.sample(time);
    const portrait = clamp((0.88 - this.camera.aspect) / 0.45, 0, 1);
    const target = new THREE.Vector3().fromArray(frame.target);
    const position = new THREE.Vector3().fromArray(frame.position);
    if (portrait > 0) {
      if (frame.id === "first-body") {
        target.x = -0.6;
      } else if (frame.id === "core-open") {
        target.x = -1.3;
      } else if (frame.id === "memory-material") {
        target.x = -1.6;
      }
      const fullFigure = PORTRAIT_FULL_FIGURE_SHOTS.has(frame.id);
      const portraitDistanceScale = frame.id === "memory-material" ? 2.2 : fullFigure ? 1.8 : 1.38;
      position.sub(target).multiplyScalar(lerp(1, portraitDistanceScale, portrait)).add(target);
      target.y += portrait * 0.32;
    }
    const portraitFocalScale = frame.id === "memory-material"
      ? 0.55
      : PORTRAIT_FULL_FIGURE_SHOTS.has(frame.id) ? 0.6 : 0.72;
    const composedFocalLength = frame.focalLength * lerp(1, portraitFocalScale, portrait);
    this.camera.position.copy(position);
    this.camera.fov = focalLengthToFov(composedFocalLength);
    this.camera.updateProjectionMatrix();
    this.target.copy(target);
    this.camera.lookAt(this.target);
    this.camera.userData.shotId = frame.id;
    return { ...frame, shotId: frame.id, composedFocalLength, portraitProgress: portrait };
  }

  resize(aspect) {
    if (!Number.isFinite(aspect) || aspect <= 0) return false;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    return true;
  }
}
