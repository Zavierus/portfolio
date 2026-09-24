const clamp01 = (value) => Math.min(1, Math.max(0, value));

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, "0")}`;
}

export function createFrequencyBands(frequencyData, bandCount = 48) {
  if (!Number.isInteger(bandCount) || bandCount <= 0) throw new RangeError("bandCount must be positive");
  if (!frequencyData?.length) return Array.from({ length: bandCount }, () => 0);
  const bands = [];
  const length = frequencyData.length;
  for (let band = 0; band < bandCount; band += 1) {
    const start = Math.floor(Math.pow(band / bandCount, 1.72) * length);
    const end = Math.max(start + 1, Math.floor(Math.pow((band + 1) / bandCount, 1.72) * length));
    let total = 0;
    let peak = 0;
    let samples = 0;
    for (let index = start; index < Math.min(end, length); index += 1) {
      total += frequencyData[index];
      peak = Math.max(peak, frequencyData[index]);
      samples += 1;
    }
    const average = samples ? total / samples / 255 : 0;
    const normalizedPeak = peak / 255;
    bands.push(clamp01(Math.pow(average * 0.72 + normalizedPeak * 0.28, 0.78)));
  }
  return bands;
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function summarizeBands(bands) {
  if (!bands?.length) return { low: 0, mid: 0, high: 0, peak: 0, energy: 0 };
  const lowEnd = Math.max(1, Math.floor(bands.length * 0.2));
  const midEnd = Math.max(lowEnd + 1, Math.floor(bands.length * 0.58));
  return {
    low: clamp01(average(bands.slice(0, lowEnd))),
    mid: clamp01(average(bands.slice(lowEnd, midEnd))),
    high: clamp01(average(bands.slice(midEnd))),
    peak: clamp01(Math.max(...bands)),
    energy: clamp01(average(bands)),
  };
}

export function waveformLevel(timeData) {
  if (!timeData?.length) return 0;
  let sum = 0;
  for (const sample of timeData) {
    const centered = (sample - 128) / 128;
    sum += centered * centered;
  }
  return clamp01(Math.sqrt(sum / timeData.length) * 2.4);
}
