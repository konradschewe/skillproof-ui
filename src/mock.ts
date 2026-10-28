import type { SkillproofData, HistoryEntry } from "./types";

// repo 1: improving over time (0% → 50%)
const HISTORY_AUDIENCE: HistoryEntry[] = [
  { sha: "a0b1c2d", evaluatedAt: "2026-08-01T09:00:00Z", skills: { "sap-agent-bootstrap": "missing",  "sap-agent-guardrails": "missing", "sap-agent-instrumentation": "missing", "sap-agent-spii": "missing"  } },
  { sha: "b1c2d3e", evaluatedAt: "2026-08-15T09:00:00Z", skills: { "sap-agent-bootstrap": "adopted",  "sap-agent-guardrails": "missing", "sap-agent-instrumentation": "missing", "sap-agent-spii": "missing"  } },
  { sha: "c2d3e4f", evaluatedAt: "2026-09-01T09:00:00Z", skills: { "sap-agent-bootstrap": "adopted",  "sap-agent-guardrails": "partial", "sap-agent-instrumentation": "missing", "sap-agent-spii": "adopted"  } },
  { sha: "d3e4f5a", evaluatedAt: "2026-09-15T09:00:00Z", skills: { "sap-agent-bootstrap": "adopted",  "sap-agent-guardrails": "partial", "sap-agent-instrumentation": "missing", "sap-agent-spii": "adopted"  } },
  { sha: "e4f5a6b", evaluatedAt: "2026-10-01T09:00:00Z", skills: { "sap-agent-bootstrap": "adopted",  "sap-agent-guardrails": "partial", "sap-agent-instrumentation": "partial", "sap-agent-spii": "adopted"  } },
  { sha: "f5a6b7c", evaluatedAt: "2026-10-15T09:00:00Z", skills: { "sap-agent-bootstrap": "adopted",  "sap-agent-guardrails": "partial", "sap-agent-instrumentation": "missing", "sap-agent-spii": "adopted"  } },
];

// repo 2: consistently fully adopted (100% throughout)
const HISTORY_CAMPAIGN: HistoryEntry[] = [
  { sha: "a1b2c3d", evaluatedAt: "2026-08-01T09:00:00Z", skills: { "sap-agent-bootstrap": "adopted", "sap-agent-guardrails": "adopted", "sap-agent-instrumentation": "adopted", "sap-agent-spii": "adopted" } },
  { sha: "b2c3d4e", evaluatedAt: "2026-08-15T09:00:00Z", skills: { "sap-agent-bootstrap": "adopted", "sap-agent-guardrails": "adopted", "sap-agent-instrumentation": "adopted", "sap-agent-spii": "adopted" } },
  { sha: "c3d4e5f", evaluatedAt: "2026-09-01T09:00:00Z", skills: { "sap-agent-bootstrap": "adopted", "sap-agent-guardrails": "adopted", "sap-agent-instrumentation": "adopted", "sap-agent-spii": "adopted" } },
  { sha: "d4e5f6a", evaluatedAt: "2026-09-15T09:00:00Z", skills: { "sap-agent-bootstrap": "adopted", "sap-agent-guardrails": "adopted", "sap-agent-instrumentation": "adopted", "sap-agent-spii": "adopted" } },
  { sha: "e5f6a7b", evaluatedAt: "2026-10-01T09:00:00Z", skills: { "sap-agent-bootstrap": "adopted", "sap-agent-guardrails": "adopted", "sap-agent-instrumentation": "adopted", "sap-agent-spii": "adopted" } },
  { sha: "f6a7b8c", evaluatedAt: "2026-10-15T09:00:00Z", skills: { "sap-agent-bootstrap": "adopted", "sap-agent-guardrails": "adopted", "sap-agent-instrumentation": "adopted", "sap-agent-spii": "adopted" } },
];

// repo 3: stagnating at 25%, regression on guardrails mid-way
const HISTORY_ORCHESTRATION: HistoryEntry[] = [
  { sha: "a2b3c4d", evaluatedAt: "2026-08-01T09:00:00Z", skills: { "sap-agent-bootstrap": "divergent", "sap-agent-guardrails": "partial",  "sap-agent-instrumentation": "missing",  "sap-agent-spii": "missing" } },
  { sha: "b3c4d5e", evaluatedAt: "2026-08-15T09:00:00Z", skills: { "sap-agent-bootstrap": "divergent", "sap-agent-guardrails": "partial",  "sap-agent-instrumentation": "partial",  "sap-agent-spii": "missing" } },
  { sha: "c4d5e6f", evaluatedAt: "2026-09-01T09:00:00Z", skills: { "sap-agent-bootstrap": "divergent", "sap-agent-guardrails": "partial",  "sap-agent-instrumentation": "partial",  "sap-agent-spii": "missing" } },
  { sha: "d5e6f7a", evaluatedAt: "2026-09-15T09:00:00Z", skills: { "sap-agent-bootstrap": "divergent", "sap-agent-guardrails": "missing",  "sap-agent-instrumentation": "partial",  "sap-agent-spii": "missing" } },
  { sha: "e6f7a8b", evaluatedAt: "2026-10-01T09:00:00Z", skills: { "sap-agent-bootstrap": "divergent", "sap-agent-guardrails": "missing",  "sap-agent-instrumentation": "partial",  "sap-agent-spii": "missing" } },
  { sha: "f7a8b9c", evaluatedAt: "2026-10-15T09:00:00Z", skills: { "sap-agent-bootstrap": "divergent", "sap-agent-guardrails": "missing",  "sap-agent-instrumentation": "partial",  "sap-agent-spii": "missing" } },
];

const MOCK_SINGLE: SkillproofData = {
  mode: "single",
  report: {
    repoPath: "/home/runner/work/cx-ec-audience-identification-agent",
    skillsDir: ".skills",
    evaluatedAt: new Date().toISOString(),
    results: [
      {
        skillName: "sap-agent-bootstrap",
        status: "adopted",
        reasoning: "The agent follows the bootstrap pattern: entry point registers the agent card, dependencies are injected via the standard SAP agent container, and the health endpoint is correctly wired.",
        evidence: ["src/main.ts:8", "src/agent/agent.module.ts:14", "src/health/health.controller.ts:5"],
      },
      {
        skillName: "sap-agent-guardrails",
        status: "partial",
        reasoning: "Input guardrails are implemented via the PII filter middleware, but output guardrails for hallucination detection are missing. The skill requires both.",
        evidence: ["src/guardrails/pii.filter.ts:1", "src/agent/agent.service.ts:42"],
      },
      {
        skillName: "sap-agent-instrumentation",
        status: "missing",
        reasoning: "No OpenTelemetry spans are created around LLM calls. The skill requires tracing of every model invocation with token counts and latency.",
        evidence: [],
      },
      {
        skillName: "sap-agent-spii",
        status: "adopted",
        reasoning: "SPII filtering is correctly integrated: the middleware intercepts all LLM responses and applies the required redaction patterns before returning to the caller.",
        evidence: ["src/spii/spii.filter.ts:1", "src/agent/agent.service.ts:67"],
      },
      {
        skillName: "sap-agent-evaluation",
        status: "not-applicable",
        reasoning: "This is a production agent deployment, not a harness or test environment. Evaluation tooling is not applicable here.",
        evidence: [],
      },
    ],
  },
};

const MOCK_MULTI: SkillproofData = {
  mode: "multi",
  results: [
    {
      repo: "my-org/cx-ec-audience-identification-agent",
      repoUrl: "https://github.com/my-org/cx-ec-audience-identification-agent",
      sha: "a1b2c3d",
      ref: "refs/heads/main",
      pushedAt: new Date().toISOString(),
      history: HISTORY_AUDIENCE,
      report: {
        repoPath: "/home/runner/work/cx-ec-audience-identification-agent",
        skillsDir: ".skills",
        evaluatedAt: new Date().toISOString(),
        results: [
          { skillName: "sap-agent-bootstrap", status: "adopted", reasoning: "Bootstrap pattern correctly applied.", evidence: [] },
          { skillName: "sap-agent-guardrails", status: "partial", reasoning: "Input guardrails present, output guardrails missing.", evidence: [] },
          { skillName: "sap-agent-instrumentation", status: "missing", reasoning: "No OTel spans around LLM calls.", evidence: [] },
          { skillName: "sap-agent-spii", status: "adopted", reasoning: "SPII filtering correctly integrated.", evidence: [] },
        ],
      },
    },
    {
      repo: "my-org/cx-ec-campaign-activation-agent",
      repoUrl: "https://github.com/my-org/cx-ec-campaign-activation-agent",
      sha: "d4e5f6a",
      ref: "refs/heads/main",
      pushedAt: new Date().toISOString(),
      history: HISTORY_CAMPAIGN,
      report: {
        repoPath: "/home/runner/work/cx-ec-campaign-activation-agent",
        skillsDir: ".skills",
        evaluatedAt: new Date().toISOString(),
        results: [
          { skillName: "sap-agent-bootstrap", status: "adopted", reasoning: "Bootstrap pattern correctly applied.", evidence: [] },
          { skillName: "sap-agent-guardrails", status: "adopted", reasoning: "Both input and output guardrails implemented.", evidence: [] },
          { skillName: "sap-agent-instrumentation", status: "adopted", reasoning: "OTel spans present on all LLM calls with token counts.", evidence: [] },
          { skillName: "sap-agent-spii", status: "adopted", reasoning: "SPII filtering integrated in all response paths.", evidence: [] },
        ],
      },
    },
    {
      repo: "my-org/campaign-orchestration-service",
      repoUrl: "https://github.com/my-org/campaign-orchestration-service",
      sha: "b7c8d9e",
      ref: "refs/heads/main",
      pushedAt: new Date().toISOString(),
      history: HISTORY_ORCHESTRATION,
      report: {
        repoPath: "/home/runner/work/campaign-orchestration-service",
        skillsDir: ".skills",
        evaluatedAt: new Date().toISOString(),
        results: [
          { skillName: "sap-agent-bootstrap", status: "divergent", reasoning: "Uses a custom bootstrapper instead of the standard SAP agent container.", evidence: [] },
          { skillName: "sap-agent-guardrails", status: "missing", reasoning: "No guardrail middleware found.", evidence: [] },
          { skillName: "sap-agent-instrumentation", status: "partial", reasoning: "Spans exist but token counts are not recorded.", evidence: [] },
          { skillName: "sap-agent-spii", status: "missing", reasoning: "No SPII middleware found in the response pipeline.", evidence: [] },
        ],
      },
    },
  ],
};

export function getMockData(): SkillproofData {
  const mode = new URLSearchParams(window.location.search).get("mode");
  return mode === "single" ? MOCK_SINGLE : MOCK_MULTI;
}
