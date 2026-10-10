import type { User } from "./user";

export interface MatchTopic {
  id: string;
  code: string;
  name: string;
  level: number;
}

export interface MatchResult {
  user: User;
  matchedTopics: MatchTopic[];
  matchPercentage: number;
}
