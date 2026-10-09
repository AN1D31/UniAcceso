// Lowercases and strips accents so "Ingeniería" and "ingenieria" compare as equal.
export const normalizeText = (text) =>
  String(text ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// True when `keyword` matches the start of any word of `text` (single-word keywords)
// or appears anywhere in it (keywords with spaces). Both arguments must be normalized.
export const matchesKeyword = (text, keyword) =>
  keyword.includes(" ") ? text.includes(keyword) : text.split(/[\s,.;:()/-]+/).some((word) => word.startsWith(keyword));

// Edit distance between two short strings (used for typo tolerance).
function editDistance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let previousDiagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previousDiagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      previousDiagonal = temp;
    }
  }
  return row[b.length];
}

const MIN_LENGTH_FOR_TYPO_TOLERANCE = 5;

// Fuzzy "does `text` contain what the user typed": ignores case and accents, and every word of
// `term` must match the start of some word of `text`, tolerating one typo in words of 5+ letters.
// Example: "ingenieria sistemas" and "ingenieri sistmas" both match "Ingeniería de Sistemas".
export function fuzzyMatches(text, term) {
  const words = normalizeText(text).split(/[\s,.;:()/-]+/).filter(Boolean);
  const tokens = normalizeText(term).split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;

  return tokens.every((token) =>
    words.some(
      (word) =>
        word.startsWith(token) ||
        (token.length >= MIN_LENGTH_FOR_TYPO_TOLERANCE &&
          [-1, 0, 1].some((delta) => editDistance(token, word.slice(0, token.length + delta)) <= 1))
    )
  );
}
