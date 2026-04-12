export type TopSource = {
  name: string;
  mentions: number;
};

export type InfluenceNode = {
  name: string;
  depth: number;
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
  nodesFound: number;
  influence: InfluenceNode[];
};
