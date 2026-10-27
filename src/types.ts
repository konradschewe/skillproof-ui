export type AdoptionStatus = "adopted" | "divergent" | "partial" | "missing" | "not-applicable";

export interface SkillEvaluationResult {
  skillName: string;
  status: AdoptionStatus;
  reasoning: string;
  evidence: string[];
}

export interface EvaluationReport {
  repoPath: string;
  skillsDir: string;
  evaluatedAt: string;
  results: SkillEvaluationResult[];
}

export interface HubResult {
  repo: string;
  repoUrl: string;
  sha: string;
  ref: string;
  pushedAt: string;
  report: EvaluationReport;
}

export type SkillproofData =
  | { mode: "single"; report: EvaluationReport }
  | { mode: "multi"; results: HubResult[] };
