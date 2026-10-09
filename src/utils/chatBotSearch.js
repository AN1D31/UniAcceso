import { supabase } from "../createClient";
import { AREAS, NODES } from "./chatBotFlow";
import { normalizeText, matchesKeyword } from "./textSearch";

const MAX_PROGRAMS = 8;
const MAX_SCHOLARSHIPS = 5;
const PAGE_SIZE = 1000; // Supabase returns at most 1000 rows per query

// Matching is done in JavaScript on normalized text instead of with SQL ILIKE: ILIKE ignores case
// but not accents, so "Ingenieria" would never match "Ingeniería".

// Fetches every row of a table, paging through Supabase's 1000-row limit.
async function fetchAllRows(table, columns, orderColumn) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order(orderColumn, { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }
  return rows;
}

// An empty list of areas means "any area".
function buildAreaMatcher(areaIds) {
  if (!areaIds.length) return () => true;

  const targets = areaIds.map((areaId) => ({
    label: normalizeText(AREAS[areaId].label),
    keywords: AREAS[areaId].keywords.map(normalizeText),
  }));
  return (...texts) => {
    const text = normalizeText(texts.filter(Boolean).join(" "));
    return targets.some(
      ({ label, keywords }) => text.includes(label) || keywords.some((keyword) => matchesKeyword(text, keyword))
    );
  };
}

// Program modalities in the database are free text ("Presencial", "A distancia", "Virtual", "hibrido"...).
function matchesModality(programModality, selected) {
  const modality = normalizeText(programModality);
  if (selected === "any" || !modality) return true;
  if (modality.startsWith("hibrid")) return true;
  if (selected === "presencial") return modality === "presencial";
  return modality === "virtual" || modality.includes("distancia");
}

function matchesLevel(programLevel, selected) {
  const level = normalizeText(programLevel);
  if (selected === "any" || !level) return true;
  const isPostgraduate = ["posgrado", "especializ", "maestr", "doctor"].some((prefix) => level.startsWith(prefix));
  return selected === "posgrado" ? isPostgraduate : !isPostgraduate;
}

async function findPrograms({ areas, modality, level }) {
  const matchesArea = buildAreaMatcher(areas);
  const [programs, universities] = await Promise.all([
    fetchAllRows("programs", "id, name, level, modality, duration, knowledge_area, university_id", "id"),
    fetchAllRows("universities", "id, name, ranking", "id"),
  ]);
  const universitiesById = new Map(universities.map((university) => [university.id, university]));

  const matches = programs
    .filter(
      (program) =>
        universitiesById.has(program.university_id) &&
        matchesArea(program.name, program.knowledge_area) &&
        matchesModality(program.modality, modality) &&
        matchesLevel(program.level, level)
    )
    .map((program) => ({
      id: program.id,
      name: program.name,
      level: program.level,
      modality: program.modality,
      duration: program.duration,
      universityId: program.university_id,
      university: universitiesById.get(program.university_id).name,
      ranking: universitiesById.get(program.university_id).ranking,
    }))
    // Best-ranked universities first; programs without ranking go last.
    .sort((a, b) => (a.ranking ?? Infinity) - (b.ranking ?? Infinity) || a.name.localeCompare(b.name));

  return { total: matches.length, items: matches.slice(0, MAX_PROGRAMS) };
}

async function findScholarships({ areas, modality, funding }) {
  const coverage = NODES.funding.options.find((option) => option.id === funding).coverage;
  if (!coverage.length) return [];

  const { data, error } = await supabase
    .from("scholarships")
    .select("id, name, description, requirements, coverage, finish_date, universities(name), programs(modality)")
    .eq("is_active", true)
    .in("coverage", coverage)
    .order("finish_date", { ascending: true, nullsFirst: false })
    .limit(200);
  if (error) throw error;

  const matchesArea = buildAreaMatcher(areas);
  return data
    .filter((row) => matchesArea(row.name, row.description, row.requirements) && matchesModality(row.programs?.modality, modality))
    .slice(0, MAX_SCHOLARSHIPS)
    .map((row) => ({
      id: row.id,
      name: row.name,
      coverage: row.coverage,
      university: row.universities?.name ?? null,
    }));
}

// Runs the final query. `answers` = { areas: string[], modality, level, funding }.
// Always resolves to { programs, totalPrograms, scholarships, hasError }.
export async function searchEducationalOffer(answers) {
  try {
    const [programs, scholarships] = await Promise.all([findPrograms(answers), findScholarships(answers)]);
    return { programs: programs.items, totalPrograms: programs.total, scholarships, hasError: false };
  } catch (error) {
    console.error("Chatbot search failed:", error.message);
    return { programs: [], totalPrograms: 0, scholarships: [], hasError: true };
  }
}
