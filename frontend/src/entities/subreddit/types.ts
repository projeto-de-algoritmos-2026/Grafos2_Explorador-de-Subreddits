export type TopSource = {
  name: string;
  mentions: number;
};

export type InfluenceEdge = {
  source: string;
  target: string;
  depth: number;
  sentiment: "positive" | "negative" | "neutral";
};

export type SubredditAnalysis = {
  subreddit: string;
  totalMentions: number;
  positive: number;
  negative: number;
  positivityRatio: number;
  topSources: TopSource[];
};

export type SubredditInfluence = {
  target: string;
  maxDepth: number;
  edgesFound: number;
  positive: number;
  negative: number;
  negativityRatio: number;
  influence: InfluenceEdge[];
};
