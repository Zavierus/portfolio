export const FILM_DURATION = 95;

export const CHAPTERS = Object.freeze([
  Object.freeze({ id: "greeting", label: "问候", start: 0, end: 12 }),
  Object.freeze({ id: "misread-scale", label: "尺度误读", start: 12, end: 28 }),
  Object.freeze({ id: "wake", label: "苏醒", start: 28, end: 46 }),
  Object.freeze({ id: "recognition", label: "辨认", start: 46, end: 63 }),
  Object.freeze({ id: "extinction", label: "灭绝", start: 63, end: 80 }),
  Object.freeze({ id: "reconstruction", label: "重建", start: 80, end: 95 }),
]);

export function chapterAtTime(chapters, time) {
  if (!chapters.length) return null;
  const chapter = chapters.find(({ start, end }) => time >= start && time < end);
  return chapter ?? chapters.at(-1);
}
