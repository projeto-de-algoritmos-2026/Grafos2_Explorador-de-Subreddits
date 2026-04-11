import type { SubredditAnalysis } from "@/entities/subreddit/types";

type BackendSubredditAnalysis = {
  subreddit: string;
  total_mentions: number;
  positive: number;
  negative: number;
  positivity_ratio: number;
  top_sources: [string, number][];
};

type BackendErrorResponse = {
  error: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

function isBackendErrorResponse(
  payload: BackendSubredditAnalysis | BackendErrorResponse,
): payload is BackendErrorResponse {
  return "error" in payload;
}

export async function fetchSubredditAnalysis(
  subredditName: string,
): Promise<SubredditAnalysis> {
  const normalizedName = subredditName.trim();

  if (!normalizedName) {
    throw new Error("Informe um subreddit para pesquisar.");
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/subreddit/${encodeURIComponent(normalizedName)}`,
    );
  } catch {
    throw new Error(
      "Nao foi possivel conectar ao backend em http://127.0.0.1:8000.",
    );
  }

  const rawBody = await response.text();
  let payload: BackendSubredditAnalysis | BackendErrorResponse | null = null;

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as
        | BackendSubredditAnalysis
        | BackendErrorResponse;
    } catch {
      if (!response.ok) {
        throw new Error("O backend retornou uma resposta invalida.");
      }

      throw new Error("O backend respondeu em formato inesperado.");
    }
  }

  if (!response.ok) {
    throw new Error(
      payload && isBackendErrorResponse(payload)
        ? payload.error
        : "Nao foi possivel consultar o backend.",
    );
  }

  if (!payload) {
    throw new Error("O backend respondeu sem corpo JSON.");
  }

  if (isBackendErrorResponse(payload)) {
    throw new Error(payload.error);
  }

  return {
    subreddit: payload.subreddit,
    totalMentions: payload.total_mentions,
    positive: payload.positive,
    negative: payload.negative,
    positivityRatio: payload.positivity_ratio,
    topSources: payload.top_sources.map(([name, mentions]) => ({
      name,
      mentions,
    })),
  };
}
