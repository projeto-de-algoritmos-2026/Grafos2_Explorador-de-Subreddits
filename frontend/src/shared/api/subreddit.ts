import type {
  SubredditAnalysis,
  SubredditInfluence,
} from "@/entities/subreddit/types";

type BackendSubredditAnalysis = {
  subreddit: string;
  total_mentions: number;
  positive: number;
  negative: number;
  positivity_ratio: number;
  top_sources?: [string, number][];
};

type BackendSubredditInfluence = {
  target: string;
  max_depth: number;
  edges_found: number;
  positive: number;
  negative: number;
  negativity_ratio: number;
  edges?: Array<{
    source: string;
    target: string;
    depth: number;
    sentiment: "positive" | "negative" | "neutral";
  }>;
};

type BackendErrorResponse = {
  error: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

function isBackendErrorResponse(
  payload:
    | BackendSubredditAnalysis
    | BackendSubredditInfluence
    | BackendErrorResponse,
): payload is BackendErrorResponse {
  return "error" in payload;
}

async function fetchBackendPayload<
  TPayload extends BackendSubredditAnalysis | BackendSubredditInfluence,
>(path: string): Promise<TPayload> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`);
  } catch {
    throw new Error(
      "Nao foi possivel conectar ao backend em http://127.0.0.1:8000.",
    );
  }

  const rawBody = await response.text();
  let payload: TPayload | BackendErrorResponse | null = null;

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as TPayload | BackendErrorResponse;
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

  return payload;
}

export async function fetchSubredditAnalysis(
  subredditName: string,
): Promise<SubredditAnalysis> {
  const normalizedName = subredditName.trim();

  if (!normalizedName) {
    throw new Error("Informe um subreddit para pesquisar.");
  }

  const payload = await fetchBackendPayload<BackendSubredditAnalysis>(
    `/subreddit/${encodeURIComponent(normalizedName)}`,
  );

  return {
    subreddit: payload.subreddit,
    totalMentions: payload.total_mentions,
    positive: payload.positive,
    negative: payload.negative,
    positivityRatio: payload.positivity_ratio,
    topSources: (Array.isArray(payload.top_sources)
      ? payload.top_sources
      : []
    ).map(([name, mentions]) => ({
      name,
      mentions,
    })),
  };
}

export async function fetchSubredditInfluence(
  subredditName: string,
  depth: number,
): Promise<SubredditInfluence> {
  const normalizedName = subredditName.trim();

  if (!normalizedName) {
    throw new Error("Informe um subreddit para pesquisar.");
  }

  const normalizedDepth = Number.isFinite(depth)
    ? Math.max(1, Math.floor(depth))
    : 1;

  const payload = await fetchBackendPayload<BackendSubredditInfluence>(
    `/influence/${encodeURIComponent(normalizedName)}?depth=${normalizedDepth}`,
  );

  return {
    target: payload.target,
    maxDepth: payload.max_depth,
    edgesFound: payload.edges_found,
    positive: payload.positive,
    negative: payload.negative,
    negativityRatio: payload.negativity_ratio,
    influence: (Array.isArray(payload.edges) ? payload.edges : []).map(
      (edge) => ({
        source: edge.source,
        target: edge.target,
        sentiment: edge.sentiment,
        depth: edge.depth,
      }),
    ),
  };
}
