import api from "@/lib/api";

// Talks only to our own backend — never to Cheerio directly. The backend
// keeps the Cheerio API key server-side and returns a clean, mapped payload.
export async function interactWithAiAgent({
  question,
  history = [],
  collectedData = {},
}) {
  const payload = await api.post("/api/ai-agent/interact", {
    question,
    history,
    collectedData,
  });

  return {
    answer: payload?.answer ?? "",
    answers: Array.isArray(payload?.answers) ? payload.answers : [],
    quickReplies: Array.isArray(payload?.quickReplies)
      ? payload.quickReplies
      : [],
    collectedData:
      payload?.collectedData && typeof payload.collectedData === "object"
        ? payload.collectedData
        : {},
    context: payload?.context ?? [],
    products: Array.isArray(payload?.products) ? payload.products : [],
  };
}

export default interactWithAiAgent;
