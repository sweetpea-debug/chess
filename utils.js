export const CACHE_KEY = "chess-atlas-cache-v2";
export const CITY_KEY = "chess-atlas-city-v2";
export const DAY_MS = 24 * 60 * 60 * 1000;
export const RADIUS_MILES = 100;

export function prettyDateRange(startDate, endDate) {
  const fmt = { month: "short", day: "numeric", year: "numeric" };
  const start = new Date(startDate).toLocaleDateString(undefined, fmt);
  const end = new Date(endDate).toLocaleDateString(undefined, fmt);
  return startDate === endDate ? start : `${start} → ${end}`;
}

export function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function readJsonStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeJsonStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function sourceBadge(sourceType) {
  const map = {
    national: "National",
    organizer: "Organizer",
    aggregator: "Aggregator",
  };
  return map[sourceType] ?? "Source";
}
