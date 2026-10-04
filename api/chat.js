import Anthropic from "@anthropic-ai/sdk";
import { searchEducationalOffer, searchEducationalOfferTool } from "./_lib/searchEducationalOffer.js";

const MODEL = "claude-sonnet-5-5";
const MAX_TOKENS = 16000;
const MAX_TOOL_ROUNDS = 5;
const MAX_HISTORY_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 4000;

const SYSTEM_PROMPT = `You are unIA, the vocational and educational advisor of UniAcceso, a platform that helps students find universities, academic programs and scholarships.

- Reply in the same language the user writes in (usually Spanish).
- Ask a short clarifying question when you need the student's interests, budget or preferred location, but do not interrogate: search as soon as you have anything useful.
- Use the search_educational_offer tool for any question about universities, programs, scholarships or costs. Base your answer only on the tool results; never invent institutions, scholarships or amounts.
- If the search returns nothing, say so and suggest broadening the criteria.
- Keep answers concise and friendly, and include official links when the results provide them.`;

// The SDK reads ANTHROPIC_API_KEY from the server environment; the key is never sent to the browser.
let anthropicClient;
function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable");
  }
  anthropicClient ??= new Anthropic();
  return anthropicClient;
}

// Accepts only plain-text user/assistant turns from the client and enforces size limits.
function parseMessages(body) {
  const raw = body?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const messages = raw
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: message?.role === "assistant" ? "assistant" : message?.role === "user" ? "user" : null,
      content: typeof message?.content === "string" ? message.content.trim().slice(0, MAX_MESSAGE_LENGTH) : "",
    }))
    .filter((message) => message.role && message.content);

  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return null;
  return messages;
}

function extractText(content) {
  return content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

async function runConversation(messages) {
  const client = getAnthropic();
  const conversation = [...messages];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools: [searchEducationalOfferTool],
      messages: conversation,
      // Server-side refusal fallback (opt-in). Requires the Claude API.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });

    if (response.stop_reason === "refusal") {
      return "Lo siento, no puedo ayudarte con esa solicitud.";
    }
    if (response.stop_reason === "max_tokens") {
      return extractText(response.content) || "La respuesta fue demasiado larga. ¿Puedes reformular tu pregunta?";
    }
    if (response.stop_reason !== "tool_use") {
      return extractText(response.content);
    }

    // Echo the full assistant content back (thinking blocks must be preserved),
    // then answer every tool_use block in a single user message.
    conversation.push({ role: "assistant", content: response.content });

    const toolResults = await Promise.all(
      response.content
        .filter((block) => block.type === "tool_use")
        .map(async (block) => {
          if (block.name !== searchEducationalOfferTool.name) {
            return {
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify({ error: `Unknown tool: ${block.name}` }),
              is_error: true,
            };
          }
          const result = await searchEducationalOffer(block.input);
          return {
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(result),
            is_error: Boolean(result.error),
          };
        })
    );
    conversation.push({ role: "user", content: toolResults });
  }

  return "No pude completar la búsqueda en este momento. Intenta de nuevo con una consulta más específica.";
}

// POST /api/chat  { messages: [{ role: "user" | "assistant", content: string }, ...] }
// -> { reply: string }
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const messages = parseMessages(req.body);
  if (!messages) {
    return res.status(400).json({ error: "Body must include a non-empty `messages` array ending with a user message" });
  }

  try {
    const reply = await runConversation(messages);
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat request failed:", error);
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "The assistant is busy, please try again shortly." });
    }
    return res.status(500).json({ error: "The assistant is unavailable right now." });
  }
}
