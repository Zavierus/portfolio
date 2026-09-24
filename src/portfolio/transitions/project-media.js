function createChannel(documentRef, image, variant) {
  const channel = documentRef.createElement("span");
  channel.className = `project-media__channel project-media__channel--${variant}`;
  channel.setAttribute("aria-hidden", "true");

  const channelImage = image.cloneNode(false);
  channelImage.alt = "";
  channelImage.removeAttribute("id");
  channelImage.removeAttribute("loading");
  channel.append(channelImage);
  return channel;
}

function addChannels(documentRef, media) {
  const image = media.querySelector("img");
  if (!image) return null;

  const channels = documentRef.createElement("span");
  channels.className = "project-media__channels";
  channels.setAttribute("aria-hidden", "true");
  channels.append(
    createChannel(documentRef, image, "cyan"),
    createChannel(documentRef, image, "signal"),
  );
  media.append(channels);
  media.classList.add("is-motion-ready");
  return channels;
}

export function mountProjectMediaTransitions({
  elements,
  enabled,
  documentRef = document,
  windowRef = window,
} = {}) {
  const mediaElements = [...(elements ?? [])];
  if (!enabled || mediaElements.length === 0 || !("IntersectionObserver" in windowRef)) {
    return { destroy() {} };
  }

  const records = new Map();

  function stop(record) {
    if (!record.complete) {
      record.media.classList.remove("is-media-transitioning");
      record.started = false;
    }
  }

  function start(record) {
    if (record.complete || record.started || !record.visible || documentRef.hidden) return;
    record.started = true;
    record.media.classList.add("is-media-transitioning");
  }

  for (const media of mediaElements) {
    const channels = addChannels(documentRef, media);
    if (!channels) continue;

    const record = { media, channels, visible: false, started: false, complete: false };
    records.set(media, record);

    channels.addEventListener("animationend", (event) => {
      if (event.animationName !== "project-signal-channel") return;
      record.complete = true;
      record.started = false;
      media.classList.remove("is-media-transitioning");
      media.classList.add("is-media-calibrated");
    });
  }

  const observer = new windowRef.IntersectionObserver((entries) => {
    for (const entry of entries) {
      const record = records.get(entry.target);
      if (!record) continue;
      record.visible = entry.isIntersecting && entry.intersectionRatio >= 0.18;
      if (record.visible) start(record);
      else stop(record);
    }
  }, { rootMargin: "4% 0px -8%", threshold: [0, 0.18, 0.5] });

  records.forEach(({ media }) => observer.observe(media));

  function handleVisibilityChange() {
    records.forEach((record) => {
      if (documentRef.hidden) stop(record);
      else start(record);
    });
  }

  documentRef.addEventListener("visibilitychange", handleVisibilityChange);

  return {
    destroy() {
      observer.disconnect();
      documentRef.removeEventListener("visibilitychange", handleVisibilityChange);
      records.forEach(({ media, channels }) => {
        media.classList.remove("is-motion-ready", "is-media-transitioning", "is-media-calibrated");
        channels.remove();
      });
      records.clear();
    },
  };
}
