import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";

import { sampleListenerState } from "../src/listener/listener-state.js";
import { CAMERA_PROGRAM, CameraProgram, sampleCameraProgram } from "../src/render/camera-program.js";

const EXPANDED_LISTENER_RADIUS = 2.55;
const MOBILE_FRAME_RADIUS = 1.9;

test("camera program covers all six chapters without gaps", () => {
  assert.equal(CAMERA_PROGRAM[0].start, 0);
  assert.equal(CAMERA_PROGRAM.at(-1).end, 95);
  assert.deepEqual(new Set(CAMERA_PROGRAM.map(({ chapterId }) => chapterId)), new Set([
    "greeting", "misread-scale", "wake", "recognition", "extinction", "reconstruction",
  ]));
  CAMERA_PROGRAM.forEach((entry, index) => {
    assert.ok(entry.start < entry.end);
    if (index > 0) assert.equal(entry.start, CAMERA_PROGRAM[index - 1].end);
  });
});

test("story revelations receive explicit camera subjects", () => {
  assert.equal(sampleCameraProgram(6).subject, "archive-signal");
  assert.equal(sampleCameraProgram(24).subject, "megastructure-scale");
  assert.equal(sampleCameraProgram(69).subject, "dead-earth");
  assert.equal(sampleCameraProgram(92).subject, "archive-and-body");
});

test("camera positions and focal lengths remain finite", () => {
  for (let time = 0; time <= 95; time += 0.5) {
    const frame = sampleCameraProgram(time);
    const listener = sampleListenerState(time);
    const distance = new THREE.Vector3(...frame.position).distanceTo(new THREE.Vector3(...listener.position));
    assert.ok(frame.position.every(Number.isFinite));
    assert.ok(frame.target.every(Number.isFinite));
    assert.ok(frame.focalLength >= 28 && frame.focalLength <= 100);
    assert.ok(distance > EXPANDED_LISTENER_RADIUS + 0.5, `${frame.id} enters the Listener bounding sphere at ${time}s`);
  }
});

test("key Listener shots remain inside the mobile safe frame", () => {
  const cameraProgram = new CameraProgram({ aspect: 390 / 844 });
  const samples = [10, 18, 42, 52, 77, 85, 92];

  for (const time of samples) {
    const frame = cameraProgram.apply(time);
    const center = new THREE.Vector3(...sampleListenerState(time).position);
    const camera = cameraProgram.camera;
    camera.updateMatrixWorld(true);
    const cardinalPoints = [
      center.clone().add(new THREE.Vector3(MOBILE_FRAME_RADIUS, 0, 0)),
      center.clone().add(new THREE.Vector3(-MOBILE_FRAME_RADIUS, 0, 0)),
      center.clone().add(new THREE.Vector3(0, MOBILE_FRAME_RADIUS, 0)),
      center.clone().add(new THREE.Vector3(0, -MOBILE_FRAME_RADIUS, 0)),
      center.clone().add(new THREE.Vector3(0, 0, MOBILE_FRAME_RADIUS)),
      center.clone().add(new THREE.Vector3(0, 0, -MOBILE_FRAME_RADIUS)),
    ].map((point) => point.project(camera));
    const maxX = Math.max(...cardinalPoints.map(({ x }) => Math.abs(x)));
    const maxY = Math.max(...cardinalPoints.map(({ y }) => Math.abs(y)));

    assert.ok(maxX <= 0.92, `${frame.id} exceeds mobile horizontal safe frame: ${maxX}`);
    assert.ok(maxY <= 0.92, `${frame.id} exceeds mobile vertical safe frame: ${maxY}`);
  }
});
