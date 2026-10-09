// Lowercases and strips accents so "Ingeniería" and "ingenieria" compare as equal.
export const normalizeText = (text) =>
  String(text ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// True when `keyword` matches the start of any word of `text` (single-word keywords)
// or appears anywhere in it (keywords with spaces). Both arguments must be normalized.
export const matchesKeyword = (text, keyword) =>
  keyword.includes(" ") ? text.includes(keyword) : text.split(/[\s,.;:()/-]+/).some((word) => word.startsWith(keyword));
