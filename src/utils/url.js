// Makes sure a stored website address is an absolute URL, so it never resolves as a relative link.
// Returns null when there is no address.
export function ensureHttpUrl(url) {
  const trimmed = String(url ?? "").trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
