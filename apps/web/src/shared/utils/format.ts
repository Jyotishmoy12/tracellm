export function formatDateTime(value?: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(new Date(value));
}

export function formatDuration(value?: number | null): string {
  if (value === null || value === undefined) {
    return "running";
  }

  if (value < 1_000) {
    return `${value} ms`;
  }

  return `${(value / 1_000).toFixed(2)} s`;
}

export function formatNumber(value?: number | null): string {
  return value === null || value === undefined ? "0" : new Intl.NumberFormat().format(value);
}
