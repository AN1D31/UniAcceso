import { supabase } from "../createClient";
import { FLOW_STEPS } from "./chatBotFlow";

const MAX_RESULTS = 5;

function findOption(stepId, optionId) {
  return FLOW_STEPS.find((step) => step.id === stepId).options.find((option) => option.id === optionId);
}

// Keywords are static constants from chatBotFlow, so they are safe to embed in filters.
function buildIlikeFilter(columns, keywords) {
  return keywords.flatMap((keyword) => columns.map((column) => `${column}.ilike.%${keyword}%`)).join(",");
}

// A program matches the chosen modality when it is that modality or hybrid.
function matchesModality(modality, selected) {
  return !modality || modality === "hibrido" || modality === selected;
}

async function findUniversities({ keywords, modality }) {
  let universityIds = null;

  if (keywords.length) {
    const [programs, careers] = await Promise.all([
      supabase
        .from("programs")
        .select("university_id, modality")
        .or(buildIlikeFilter(["name", "knowledge_area"], keywords))
        .limit(300),
      supabase
        .from("university_careers")
        .select("university_id")
        .or(buildIlikeFilter(["career"], keywords))
        .limit(300),
    ]);
    if (programs.error) throw programs.error;
    if (careers.error) throw careers.error;

    // Careers carry no modality information, so only programs are filtered by it.
    const ids = [
      ...programs.data.filter((row) => matchesModality(row.modality, modality)).map((row) => row.university_id),
      ...careers.data.map((row) => row.university_id),
    ].filter(Boolean);
    universityIds = [...new Set(ids)];
    if (!universityIds.length) return [];
  } else {
    const { data, error } = await supabase
      .from("programs")
      .select("university_id, modality")
      .limit(300);
    if (error) throw error;
    universityIds = [
      ...new Set(data.filter((row) => matchesModality(row.modality, modality)).map((row) => row.university_id).filter(Boolean)),
    ];
    if (!universityIds.length) return [];
  }

  const { data, error } = await supabase
    .from("universities")
    .select("id, name, ranking, countries(name), cities(name)")
    .in("id", universityIds)
    .order("ranking", { ascending: true, nullsFirst: false })
    .limit(MAX_RESULTS);
  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    location: [row.cities?.name, row.countries?.name].filter(Boolean).join(", "),
  }));
}

async function findScholarships({ keywords, modality, coverage }) {
  if (!coverage.length) return [];

  let query = supabase
    .from("scholarships")
    .select("id, name, coverage, amount, currency, finish_date, universities(name), programs(modality)")
    .eq("is_active", true)
    .in("coverage", coverage)
    .order("finish_date", { ascending: true, nullsFirst: false })
    .limit(50);

  if (keywords.length) {
    query = query.or(buildIlikeFilter(["name", "description", "requirements"], keywords));
  }

  const { data, error } = await query;
  if (error) throw error;

  return data
    .filter((row) => matchesModality(row.programs?.modality, modality))
    .slice(0, MAX_RESULTS)
    .map((row) => ({
      id: row.id,
      name: row.name,
      coverage: row.coverage,
      university: row.universities?.name ?? null,
      deadline: row.finish_date,
    }));
}

// Runs the final query of the test. `selections` holds one option id per step.
// Always resolves to { universities, scholarships, hasError }.
export async function searchEducationalOffer(selections) {
  const criteria = {
    keywords: findOption("area", selections.area).keywords,
    modality: selections.modality,
    coverage: findOption("funding", selections.funding).coverage,
  };

  try {
    const [universities, scholarships] = await Promise.all([
      findUniversities(criteria),
      findScholarships(criteria),
    ]);
    return { universities, scholarships, hasError: false };
  } catch (error) {
    console.error("Chatbot search failed:", error.message);
    return { universities: [], scholarships: [], hasError: true };
  }
}
