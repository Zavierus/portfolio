import { createReviewRecord } from "../domain/schemas.js";
import { assertNoIdentityFields } from "./privacy.js";

function parseRows(csv) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && csv[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  row.push(field);
  if (row.some((value) => value.length > 0)) rows.push(row);
  if (quoted) throw new TypeError("CSV contains an unterminated quoted field");
  return rows;
}

function issue(path, message) {
  return Object.freeze({ path, message });
}

export function parseReviewCsv(csv, source) {
  if (typeof csv !== "string" || !csv.trim()) throw new TypeError("CSV input is required");
  const rows = parseRows(csv);
  const headers = rows.shift()?.map((header) => header.trim()) ?? [];
  assertNoIdentityFields(Object.fromEntries(headers.map((header) => [header, true])));
  const required = ["reviewIdHash", "text", "createdAt", "recommended", "playtimeMinutes", "helpfulVotes", "language"];
  for (const header of required) if (!headers.includes(header)) throw new TypeError(`CSV is missing ${header}`);

  const records = [];
  const errors = [];
  rows.forEach((values, rowIndex) => {
    const rowNumber = rowIndex + 2;
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    const recommended = row.recommended === "true" ? true : row.recommended === "false" ? false : null;
    const playtimeMinutes = Number(row.playtimeMinutes);
    const helpfulVotes = Number(row.helpfulVotes);
    if (!Number.isFinite(Date.parse(row.createdAt))) errors.push(issue(`rows[${rowNumber}].createdAt`, "must be an ISO date"));
    if (!Number.isFinite(playtimeMinutes) || playtimeMinutes < 0) errors.push(issue(`rows[${rowNumber}].playtimeMinutes`, "must be non-negative"));
    if (!Number.isInteger(helpfulVotes) || helpfulVotes < 0) errors.push(issue(`rows[${rowNumber}].helpfulVotes`, "must be a non-negative integer"));
    if (recommended === null) errors.push(issue(`rows[${rowNumber}].recommended`, "must be true or false"));
    if (errors.some((error) => error.path.startsWith(`rows[${rowNumber}]`))) return;
    try {
      records.push(createReviewRecord({ ...row, recommended, playtimeMinutes, helpfulVotes, source }));
    } catch (error) {
      errors.push(issue(`rows[${rowNumber}]`, error instanceof Error ? error.message : String(error)));
    }
  });
  return Object.freeze({ records: Object.freeze(records), errors: Object.freeze(errors) });
}
