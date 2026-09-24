function requireText(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${label} is required`);
  }
  return value;
}

export function adaptCatalogTrack(track) {
  if (!track || typeof track !== "object") throw new TypeError("Catalog track is required");

  const id = requireText(track.id, "Track id");
  const title = requireText(track.title, `${id} title`);
  const artist = requireText(track.artist, `${id} artist`);
  const composer = requireText(track.composer, `${id} composer`);
  const license = Object.freeze({
    id: requireText(track.license?.id, `${id} license id`),
    url: requireText(track.license?.url, `${id} license URL`),
  });

  return Object.freeze({
    id,
    title,
    name: title,
    artist,
    composer,
    album: track.album ?? "PULSE ROOM / LOCAL ARCHIVE",
    duration: track.duration,
    bpm: track.bpm,
    url: requireText(track.runtime?.url, `${id} runtime URL`),
    cover: requireText(track.cover?.url, `${id} cover URL`),
    analysisUrl: requireText(track.analysis?.url, `${id} analysis URL`),
    source: "local",
    local: false,
    license,
    attribution: requireText(track.attribution, `${id} attribution`),
    sourcePage: requireText(track.source?.page, `${id} source page`),
    revoke: false,
  });
}

export function createCatalogAdapter({ tracks = [] } = {}) {
  if (!Array.isArray(tracks)) throw new TypeError("Catalog tracks must be an array");
  const all = Object.freeze([...tracks]);
  const records = new Map();
  for (const track of all) {
    if (!track || typeof track.id !== "string" || !track.id || records.has(track.id)) {
      throw new TypeError("Catalog tracks require unique IDs");
    }
    records.set(track.id, track);
  }

  // Retain Array identity until the original shelf modules move to catalog.all.
  const adapter = [...all];
  Object.defineProperties(adapter, {
    all: { value: all, enumerable: false },
    byId: {
      value(id) {
        return records.get(String(id ?? "")) ?? null;
      },
      enumerable: false,
    },
    adapt: { value: adaptCatalogTrack, enumerable: false },
  });
  return Object.freeze(adapter);
}
