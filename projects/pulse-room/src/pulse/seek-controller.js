/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/06-lyrics/04-progress-seek.js */
/* Modified for PULSE ROOM on 2026-07-29. */

const RETRY_AFTER_MS = 1_800;
const HARD_TIMEOUT_MS = 5_200;
const SETTLE_EVENTS = ["seeked", "timeupdate", "canplay", "loadeddata"];

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, finite(value)));
}

function eventRatio(event) {
  const node = event?.currentTarget ?? event?.target;
  const minimum = finite(node?.min, 0);
  const maximum = finite(node?.max, 0);
  const value = Number(node?.value);
  if (Number.isFinite(value) && maximum > minimum) {
    return clamp((value - minimum) / (maximum - minimum), 0, 1);
  }

  const rect = node?.getBoundingClientRect?.();
  const clientX = Number(event?.clientX);
  if (rect && Number.isFinite(clientX) && finite(rect.width) > 0) {
    return clamp((clientX - finite(rect.left)) / finite(rect.width), 0, 1);
  }
  return null;
}

export function createSeekController({
  getMedia,
  getSourceSerial,
  renderPreview,
  renderLive,
  onCommit,
  now = () => performance.now(),
} = {}) {
  if (typeof getMedia !== "function") throw new TypeError("getMedia must be a function");
  if (typeof getSourceSerial !== "function") throw new TypeError("getSourceSerial must be a function");
  if (typeof renderPreview !== "function") throw new TypeError("renderPreview must be a function");
  if (typeof renderLive !== "function") throw new TypeError("renderLive must be a function");
  if (typeof onCommit !== "function") throw new TypeError("onCommit must be a function");
  if (typeof now !== "function") throw new TypeError("now must be a function");

  const schedule = typeof now.setTimeout === "function"
    ? now.setTimeout.bind(now)
    : globalThis.setTimeout.bind(globalThis);
  const unschedule = typeof now.clearTimeout === "function"
    ? now.clearTimeout.bind(now)
    : globalThis.clearTimeout.bind(globalThis);

  let serial = 0;
  let drag = null;
  let settlement = null;
  let disposed = false;

  function mediaDuration(media) {
    const duration = finite(media?.duration);
    return duration > 0 ? duration : 0;
  }

  function mediaTime(media) {
    return Math.max(0, finite(media?.currentTime));
  }

  function isCurrent(record) {
    return Boolean(
      record
      && record.serial === serial
      && getMedia() === record.media
      && getSourceSerial() === record.sourceSerial,
    );
  }

  function renderCurrent(media = getMedia()) {
    if (!media) return;
    renderLive(mediaTime(media), mediaDuration(media));
  }

  function removeSettlementListeners(record) {
    if (!record) return;
    for (const eventName of SETTLE_EVENTS) {
      record.media.removeEventListener(eventName, record.onSettleEvent);
    }
    if (record.retryTimer) unschedule(record.retryTimer);
    if (record.hardTimer) unschedule(record.hardTimer);
    record.retryTimer = 0;
    record.hardTimer = 0;
  }

  function abortSettlement({ render = false } = {}) {
    const record = settlement;
    if (!record) return;
    settlement = null;
    removeSettlementListeners(record);
    record.resolve(false);
    if (render && getMedia() === record.media) renderCurrent(record.media);
  }

  function invalidate({ render = false } = {}) {
    serial += 1;
    drag = null;
    abortSettlement({ render });
  }

  function targetFromEvent(event, media, fallback) {
    const duration = mediaDuration(media);
    if (!duration) return null;
    const ratio = eventRatio(event);
    if (ratio == null) return clamp(fallback, 0, duration);
    return ratio * duration;
  }

  function targetReached(record) {
    if (!isCurrent(record)) return false;
    if (record.media.seeking || finite(record.media.readyState) < 2) return false;
    const current = mediaTime(record.media);
    return (
      current >= Math.max(0, record.target - 0.45)
      && current <= record.target + 1.5
    );
  }

  function finishSettlement(record, succeeded) {
    if (settlement !== record) return;
    const current = isCurrent(record);
    settlement = null;
    removeSettlementListeners(record);
    if (!current) {
      record.resolve(false);
      return;
    }
    if (!succeeded) {
      renderCurrent(record.media);
      record.resolve(false);
      return;
    }

    const finishLive = (result) => {
      if (!isCurrent(record)) {
        record.resolve(false);
        return;
      }
      renderCurrent(record.media);
      record.resolve(result);
    };
    if (!record.resumeAfterSeek) {
      finishLive(true);
      return;
    }
    try {
      Promise.resolve(record.media.play()).then(
        () => finishLive(true),
        () => finishLive(false),
      );
    } catch {
      finishLive(false);
    }
  }

  function begin(event) {
    if (disposed) return false;
    const inheritedResume = Boolean(
      drag?.resumeAfterSeek || settlement?.resumeAfterSeek,
    );
    invalidate();
    const media = getMedia();
    const duration = mediaDuration(media);
    if (!media || !duration) {
      renderCurrent(media);
      return false;
    }
    const target = targetFromEvent(event, media, mediaTime(media));
    if (target == null) return false;
    const resumeAfterSeek = inheritedResume || Boolean(!media.paused && !media.ended);
    drag = {
      serial,
      media,
      sourceSerial: getSourceSerial(),
      target,
      duration,
      resumeAfterSeek,
    };
    if (resumeAfterSeek) {
      try {
        media.pause();
      } catch {
        // The seek still remains usable when a custom media element cannot pause.
      }
    }
    renderPreview(target, duration);
    return true;
  }

  function preview(event) {
    if (disposed || !drag || !isCurrent(drag)) return false;
    const target = targetFromEvent(event, drag.media, drag.target);
    if (target == null) return false;
    drag.target = target;
    drag.duration = mediaDuration(drag.media);
    renderPreview(target, drag.duration);
    return true;
  }

  function commit(event) {
    if (disposed || !drag || !isCurrent(drag)) return Promise.resolve(false);
    if (event) preview(event);
    const activeDrag = drag;
    drag = null;
    const record = {
      ...activeDrag,
      target: clamp(activeDrag.target, 0, activeDrag.duration),
      retryCount: 0,
      retryTimer: 0,
      hardTimer: 0,
      onSettleEvent: null,
      resolve: null,
    };
    renderPreview(record.target, record.duration);

    const completion = new Promise((resolve) => {
      record.resolve = resolve;
    });
    settlement = record;
    record.onSettleEvent = () => {
      if (!isCurrent(record)) {
        finishSettlement(record, false);
        return;
      }
      if (targetReached(record)) finishSettlement(record, true);
    };
    for (const eventName of SETTLE_EVENTS) {
      record.media.addEventListener(eventName, record.onSettleEvent);
    }
    record.retryTimer = schedule(() => {
      record.retryTimer = 0;
      if (settlement !== record) return;
      if (!isCurrent(record)) {
        finishSettlement(record, false);
        return;
      }
      if (targetReached(record)) {
        finishSettlement(record, true);
        return;
      }
      if (record.retryCount >= 1) return;
      record.retryCount += 1;
      try {
        record.media.currentTime = record.target;
      } catch {
        finishSettlement(record, false);
      }
    }, RETRY_AFTER_MS);
    record.hardTimer = schedule(() => {
      record.hardTimer = 0;
      if (settlement !== record) return;
      finishSettlement(record, targetReached(record));
    }, HARD_TIMEOUT_MS);
    try {
      record.media.currentTime = record.target;
    } catch {
      finishSettlement(record, false);
      return completion;
    }
    try {
      onCommit(record.target);
    } catch {
      finishSettlement(record, false);
      return completion;
    }
    if (targetReached(record)) finishSettlement(record, true);
    return completion;
  }

  function cancel() {
    if (disposed) return false;
    const record = drag ?? settlement;
    const shouldResume = Boolean(record?.resumeAfterSeek && isCurrent(record));
    invalidate();
    renderCurrent();
    if (shouldResume) {
      try {
        void record.media.play();
      } catch {
        // Restoring the live display is independent from autoplay permission.
      }
    }
    return true;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    invalidate();
  }

  return Object.freeze({ begin, preview, commit, cancel, dispose });
}
