const REQUIRED_FIELDS = [
  "id", "src", "thumbnail", "title", "year", "category",
  "description", "width", "height", "weight",
];
const STRING_FIELDS = ["id", "src", "thumbnail", "title", "category", "description"];
const PHOTOGRAPHY_ROOT = "./assets/photography/";
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const categories = [
  "\u4eba\u50cf\u4e0e\u73b0\u573a",
  "\u57ce\u5e02\u4e0e\u81ea\u7136",
  "\u8272\u5f69\u4e0e\u89c2\u5bdf",
];

export const photography = Array.from({ length: 24 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `original-${number}`,
    src: `./assets/photography/full/original-${number}.webp`,
    thumbnail: `./assets/photography/thumbs/original-${number}.webp`,
    title: `PHOTO ${number}`,
    year: "2021-2023",
    category: categories[Math.floor(index / 8)],
    description: "\u56fe\u7247\u4e3a\u9884\u89c8\u7248\uff0c\u5e76\u975e\u539f\u56fe\u3002",
    equipment: "Original embedded photograph / complete frame",
    width: 2400,
    height: 1600,
    weight: 24 - index,
  };
});

export const videos = [];

function isLocalPhotographyPath(value, directory) {
  if (typeof value !== "string" || !value.startsWith(`${PHOTOGRAPHY_ROOT}${directory}/`)) return false;
  if (value.includes("\\") || value.includes("?") || value.includes("#")) return false;
  const segments = value.slice(PHOTOGRAPHY_ROOT.length).split("/");
  return segments.length > 1 && segments.every((segment) => segment && segment !== "." && segment !== "..");
}

function makeError(index, item, field, message) {
  return { index, id: typeof item?.id === "string" && item.id.trim() ? item.id : null, field, message };
}

export function validatePhotography(items) {
  if (!Array.isArray(items)) return { valid: false, errors: [makeError(-1, null, "manifest", "Photography manifest must be an array.")], items: [] };
  const errors = [];
  const validItems = [];
  const seenIds = new Set();
  items.forEach((item, index) => {
    const itemErrors = [];
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(makeError(index, item, "item", "Photography item must be an object."));
      return;
    }
    for (const field of REQUIRED_FIELDS) if (!hasOwn(item, field)) itemErrors.push(makeError(index, item, field, `${field} is required.`));
    for (const field of STRING_FIELDS) if (hasOwn(item, field) && (typeof item[field] !== "string" || !item[field].trim())) itemErrors.push(makeError(index, item, field, `${field} must be a non-empty string.`));
    if (typeof item.id === "string" && item.id.trim()) {
      if (seenIds.has(item.id)) itemErrors.push(makeError(index, item, "id", `Duplicate photography ID: ${item.id}.`));
      seenIds.add(item.id);
    }
    if (hasOwn(item, "src") && !isLocalPhotographyPath(item.src, "full")) itemErrors.push(makeError(index, item, "src", "src must stay inside ./assets/photography/full/."));
    if (hasOwn(item, "thumbnail") && !isLocalPhotographyPath(item.thumbnail, "thumbs")) itemErrors.push(makeError(index, item, "thumbnail", "thumbnail must stay inside ./assets/photography/thumbs/."));
    for (const field of ["width", "height"]) if (hasOwn(item, field) && (!Number.isInteger(item[field]) || item[field] <= 0)) itemErrors.push(makeError(index, item, field, `${field} must be a positive integer.`));
    if (hasOwn(item, "weight") && (typeof item.weight !== "number" || !Number.isFinite(item.weight))) itemErrors.push(makeError(index, item, "weight", "weight must be a finite number."));
    errors.push(...itemErrors);
    if (itemErrors.length === 0) validItems.push(item);
  });
  return { valid: errors.length === 0, errors, items: validItems };
}

export function sortPhotography(items) {
  return items.map((item, index) => ({ item, index }))
    .sort((left, right) => right.item.weight - left.item.weight || left.index - right.index)
    .map(({ item }) => item);
}
