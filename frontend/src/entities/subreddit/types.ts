export type TopSource = {
  name: string;
  mentions: number;
};

export type SubredditAnalysis = {
  subreddit: string;
  totalMentions: number;
  positive: number;
  negative: number;
  positivityRatio: number;
  topSources: TopSource[];
};
