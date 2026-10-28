export type AdoptionStatus = "adopted" | "divergent" | "partial" | "missing" | "not-applicable";

export interface AgentMetrics {
  llmCalls?: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
}

export interface EvaluationMetrics {
  durationMs: number;
  estimatedCostUsd: number;
  evaluator: AgentMetrics;
  explorer: AgentMetrics;
}

export interface SkillEvaluationResult {
  skillName: string;
  status: AdoptionStatus;
  reasoning: string;
  evidence: string[];
  metrics?: EvaluationMetrics;
}

export interface EvaluationReport {
  repoPath: string;
  skillsDir: string;
  evaluatedAt: string;
  results: SkillEvaluationResult[];
}

export interface HistoryEntry {
  sha: string;
  ref?: string;
  evaluatedAt: string;
  pushedAt?: string;
  results: SkillEvaluationResult[];
}

export interface HubResult {
  repo: string;
  repoUrl: string;
  repoPath: string;
  history: HistoryEntry[]; // sorted oldest → newest; latest = history[history.length - 1]
}

export type SkillproofData =
  | { mode: "single"; report: EvaluationReport }
  | { mode: "multi"; results: HubResult[] };
