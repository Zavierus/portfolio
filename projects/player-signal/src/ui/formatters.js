const integerFormatter = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat("zh-CN", { style: "percent", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
});

export function formatInteger(value) {
  return integerFormatter.format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

export function formatPercent(value) {
  const finite = Number.isFinite(Number(value)) ? Number(value) : 0;
  return percentFormatter.format(Math.max(0, Math.min(1, finite)));
}

export function formatDate(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return "—";
  return dateFormatter.format(new Date(value));
}
