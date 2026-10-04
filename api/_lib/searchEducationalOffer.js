import { createClient } from "@supabase/supabase-js";

const MAX_RESULTS_PER_TABLE = 10;
const MAX_AREAS = 5;

// Server-side client. The anon key is enough because the tables have public
// SELECT policies; never expose a service-role key through this tool.
let supabaseClient;
function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL / SUPABASE_ANON_KEY environment variables");
    }
    supabaseClient = createClient(url, key, { auth: { persistSession: false } });
  }
  return supabaseClient;
}

// Model-provided text ends up inside PostgREST filter strings, so strip the
// characters that carry meaning there (separators, wildcards, grouping, escapes).
function sanitizeTerm(value) {
  return String(value ?? "")
    .replace(/[,()*%\\:."'`]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

function buildIlikeFilter(columns, terms) {
  return terms.flatMap((term) => columns.map((column) => `${column}.ilike.%${term}%`)).join(",");
}

// Resolves a free-text location (e.g. "Bogotá" or "Colombia") to country and city ids.
async function resolveLocation(supabase, location) {
  if (!location) return null;

  const [countries, cities] = await Promise.all([
    supabase.from("countries").select("id").ilike("name", `%${location}%`).limit(20),
    supabase.from("cities").select("id").ilike("name", `%${location}%`).limit(50),
  ]);
  if (countries.error) throw countries.error;
  if (cities.error) throw cities.error;

  return {
    countryIds: countries.data.map((row) => row.id),
    cityIds: cities.data.map((row) => row.id),
  };
}

function buildLocationFilter(location, resolved, textColumns) {
  const clauses = textColumns.map((column) => `${column}.ilike.%${location}%`);
  if (resolved.countryIds.length) clauses.push(`country_id.in.(${resolved.countryIds.join(",")})`);
  if (resolved.cityIds.length) clauses.push(`city_id.in.(${resolved.cityIds.join(",")})`);
  return clauses.join(",");
}

async function searchScholarships(supabase, { areas, maxBudget, location, resolvedLocation }) {
  let query = supabase
    .from("scholarships")
    .select(
      "id, name, description, requirements, amount, currency, coverage, finish_date, url, location, " +
        "universities(name), countries(name), cities(name), categories(name)"
    )
    .eq("is_active", true)
    .order("finish_date", { ascending: true, nullsFirst: false })
    .limit(MAX_RESULTS_PER_TABLE);

  if (areas.length) {
    query = query.or(buildIlikeFilter(["name", "description", "requirements"], areas));
  }
  // A missing or zero amount means the scholarship is free for the student.
  if (maxBudget !== null) {
    query = query.or(`amount.is.null,amount.lte.${maxBudget}`);
  }
  if (location) {
    query = query.or(buildLocationFilter(location, resolvedLocation, ["location"]));
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    requirements: row.requirements,
    amount: row.amount,
    currency: row.currency,
    coverage: row.coverage,
    deadline: row.finish_date,
    url: row.url,
    university: row.universities?.name ?? null,
    category: row.categories?.name ?? null,
    location:
      row.location ||
      [row.cities?.name, row.countries?.name].filter(Boolean).join(", ") ||
      null,
  }));
}

async function searchPrograms(supabase, { areas, location, resolvedLocation }) {
  // Programs have no location of their own; filter through their university.
  let universityIds = null;
  if (location) {
    const { data, error } = await supabase
      .from("universities")
      .select("id")
      .or(buildLocationFilter(location, resolvedLocation, ["department"]))
      .limit(200);
    if (error) throw error;
    universityIds = data.map((row) => row.id);
    if (!universityIds.length) return [];
  }

  let query = supabase
    .from("programs")
    .select("id, name, level, modality, knowledge_area, duration_months, url, universities(name)")
    .limit(MAX_RESULTS_PER_TABLE);

  if (areas.length) query = query.or(buildIlikeFilter(["name", "knowledge_area"], areas));
  if (universityIds) query = query.in("university_id", universityIds);

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    level: row.level,
    modality: row.modality,
    knowledge_area: row.knowledge_area,
    duration_months: row.duration_months,
    url: row.url,
    university: row.universities?.name ?? null,
  }));
}

async function searchUniversities(supabase, { areas, location, resolvedLocation }) {
  // A university matches an area through its careers or through its programs.
  let areaUniversityIds = null;
  if (areas.length) {
    const [careers, programs] = await Promise.all([
      supabase
        .from("university_careers")
        .select("university_id")
        .or(buildIlikeFilter(["career"], areas))
        .limit(200),
      supabase
        .from("programs")
        .select("university_id")
        .or(buildIlikeFilter(["name", "knowledge_area"], areas))
        .limit(200),
    ]);
    if (careers.error) throw careers.error;
    if (programs.error) throw programs.error;

    areaUniversityIds = [
      ...new Set([...careers.data, ...programs.data].map((row) => row.university_id).filter(Boolean)),
    ];
    if (!areaUniversityIds.length) return [];
  }

  let query = supabase
    .from("universities")
    .select("id, name, description, website_url, ranking, countries(name), cities(name), university_careers(career)")
    .order("ranking", { ascending: true, nullsFirst: false })
    .limit(MAX_RESULTS_PER_TABLE);

  if (areaUniversityIds) query = query.in("id", areaUniversityIds);
  if (location) {
    query = query.or(buildLocationFilter(location, resolvedLocation, ["department"]));
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    website_url: row.website_url,
    ranking: row.ranking,
    location: [row.cities?.name, row.countries?.name].filter(Boolean).join(", ") || null,
    careers: (row.university_careers ?? []).map((item) => item.career).slice(0, 10),
  }));
}

// Tool implementation. Always resolves to a JSON-serializable object; failures are
// reported inside the result so the model can explain them instead of crashing the chat.
export async function searchEducationalOffer(input) {
  const areas = (Array.isArray(input?.areas_of_interest) ? input.areas_of_interest : [])
    .map(sanitizeTerm)
    .filter(Boolean)
    .slice(0, MAX_AREAS);
  const location = sanitizeTerm(input?.preferred_location);
  const maxBudget =
    typeof input?.max_budget === "number" && Number.isFinite(input.max_budget) && input.max_budget >= 0
      ? input.max_budget
      : null;

  try {
    const supabase = getSupabase();
    const resolvedLocation = await resolveLocation(supabase, location);
    const criteria = { areas, maxBudget, location, resolvedLocation };

    const [scholarships, programs, universities] = await Promise.all([
      searchScholarships(supabase, criteria),
      searchPrograms(supabase, criteria),
      searchUniversities(supabase, criteria),
    ]);

    return {
      filters: {
        areas_of_interest: areas,
        max_budget: maxBudget,
        preferred_location: location || null,
      },
      universities,
      programs,
      scholarships,
    };
  } catch (error) {
    console.error("search_educational_offer failed:", error);
    return { error: "The educational offer database is temporarily unavailable." };
  }
}

export const searchEducationalOfferTool = {
  name: "search_educational_offer",
  description:
    "Search the UniAcceso database for universities, academic programs and scholarships. " +
    "Use it whenever the user asks about study options, careers, scholarships or costs. " +
    "All parameters are optional filters; omit any the user has not mentioned. " +
    "Returns JSON with `universities`, `programs` and `scholarships` arrays (at most 10 each). " +
    "Budget only applies to scholarships (amount the student pays; null or 0 means free).",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      areas_of_interest: {
        type: "array",
        items: { type: "string" },
        description: "Fields of study or interests, e.g. ['technology', 'health'].",
      },
      max_budget: {
        type: "number",
        description: "Maximum budget in USD the user can afford.",
      },
      preferred_location: {
        type: "string",
        description: "Preferred country or city, e.g. 'Colombia' or 'Bogotá'.",
      },
    },
    required: [],
    additionalProperties: false,
  },
};
