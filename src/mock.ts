import type { SkillproofData, HistoryEntry, SkillEvaluationResult } from "./types";

function mkMetrics(inputTokens: number, outputTokens: number, durationMs: number) {
  return {
    durationMs,
    estimatedCostUsd: (inputTokens * 0.000003 + outputTokens * 0.000015),
    evaluator: { inputTokens: Math.round(inputTokens * 0.7), outputTokens: Math.round(outputTokens * 0.8), cacheReadTokens: Math.round(inputTokens * 0.3) },
    explorer:  { inputTokens: Math.round(inputTokens * 0.3), outputTokens: Math.round(outputTokens * 0.2) },
  };
}

// --- Audience identification: improving 25% → 50% ---
function audienceResults(sha: string, date: string, statuses: Record<string, string>): HistoryEntry {
  const results: SkillEvaluationResult[] = [
    {
      skillName: "sap-agent-bootstrap",
      status: statuses.bootstrap as any,
      reasoning: statuses.bootstrap === "adopted"
        ? "Entry point registers the agent card, dependencies injected via standard SAP container, health endpoint wired correctly."
        : "Agent started without the standard SAP container; bootstrap pattern not followed.",
      evidence: statuses.bootstrap === "adopted" ? ["src/main.ts:8", "src/agent/agent.module.ts:14"] : [],
      metrics: mkMetrics(1100, 280, 9800),
    },
    {
      skillName: "sap-agent-guardrails",
      status: statuses.guardrails as any,
      reasoning: statuses.guardrails === "partial"
        ? "PII filter middleware handles input guardrails, but output guardrails for hallucination detection are absent."
        : "No guardrail middleware found in the request or response pipeline.",
      evidence: statuses.guardrails === "partial" ? ["src/guardrails/pii.filter.ts:1"] : [],
      metrics: mkMetrics(1300, 320, 11200),
    },
    {
      skillName: "sap-agent-instrumentation",
      status: statuses.instrumentation as any,
      reasoning: statuses.instrumentation === "partial"
        ? "OTel spans are created around LLM calls but token counts are not recorded as span attributes."
        : "No OpenTelemetry instrumentation found. The skill requires tracing of every model invocation with token counts and latency.",
      evidence: statuses.instrumentation === "partial" ? ["src/tracing/trace.ts:22"] : [],
      metrics: mkMetrics(1200, 300, 10500),
    },
    {
      skillName: "sap-agent-spii",
      status: statuses.spii as any,
      reasoning: statuses.spii === "adopted"
        ? "SPII filter intercepts all LLM responses and applies required redaction patterns before returning to caller."
        : "No SPII middleware found in the response pipeline.",
      evidence: statuses.spii === "adopted" ? ["src/spii/spii.filter.ts:1", "src/agent/agent.service.ts:67"] : [],
      metrics: mkMetrics(900, 220, 8100),
    },
  ];
  return { sha, ref: "refs/heads/main", evaluatedAt: date, results };
}

const HISTORY_AUDIENCE: HistoryEntry[] = [
  audienceResults("a0b1c2d", "2026-08-01T09:00:00Z", { bootstrap: "missing",  guardrails: "missing",  instrumentation: "missing", spii: "missing"  }),
  audienceResults("b1c2d3e", "2026-08-15T09:00:00Z", { bootstrap: "adopted",  guardrails: "missing",  instrumentation: "missing", spii: "missing"  }),
  audienceResults("c2d3e4f", "2026-09-01T09:00:00Z", { bootstrap: "adopted",  guardrails: "partial",  instrumentation: "missing", spii: "adopted"  }),
  audienceResults("d3e4f5a", "2026-09-15T09:00:00Z", { bootstrap: "adopted",  guardrails: "partial",  instrumentation: "missing", spii: "adopted"  }),
  audienceResults("e4f5a6b", "2026-10-01T09:00:00Z", { bootstrap: "adopted",  guardrails: "partial",  instrumentation: "partial",  spii: "adopted"  }),
  audienceResults("f5a6b7c", "2026-10-15T09:00:00Z", { bootstrap: "adopted",  guardrails: "partial",  instrumentation: "missing", spii: "adopted"  }),
  audienceResults("a1f6b8d", "2026-10-28T09:33:00Z", { bootstrap: "adopted",  guardrails: "partial",  instrumentation: "missing", spii: "adopted"  }),
];

// --- Campaign activation: always 100% ---
function campaignResults(sha: string, date: string): HistoryEntry {
  const results: SkillEvaluationResult[] = [
    {
      skillName: "sap-agent-bootstrap",
      status: "adopted",
      reasoning: "Bootstrap pattern correctly applied: standard SAP agent container, agent card registration, dependency injection all in place.",
      evidence: ["src/main.ts:6", "src/app.module.ts:11"],
      metrics: mkMetrics(1050, 260, 9200),
    },
    {
      skillName: "sap-agent-guardrails",
      status: "adopted",
      reasoning: "Both input guardrails (PII filter) and output guardrails (hallucination detector) are implemented and registered in the middleware pipeline.",
      evidence: ["src/guardrails/pii.filter.ts:1", "src/guardrails/hallucination.filter.ts:1", "src/app.module.ts:28"],
      metrics: mkMetrics(1400, 350, 12400),
    },
    {
      skillName: "sap-agent-instrumentation",
      status: "adopted",
      reasoning: "OTel spans are created for every model invocation, including token counts as span attributes and latency measurement.",
      evidence: ["src/tracing/llm.span.ts:1", "src/agent/agent.service.ts:55"],
      metrics: mkMetrics(1250, 310, 11000),
    },
    {
      skillName: "sap-agent-spii",
      status: "adopted",
      reasoning: "SPII filter registered as a global interceptor, applied to all LLM response paths.",
      evidence: ["src/spii/spii.interceptor.ts:1", "src/main.ts:19"],
      metrics: mkMetrics(880, 210, 7800),
    },
  ];
  return { sha, ref: "refs/heads/main", evaluatedAt: date, results };
}

const HISTORY_CAMPAIGN: HistoryEntry[] = [
  campaignResults("a1b2c3d", "2026-08-01T09:00:00Z"),
  campaignResults("b2c3d4e", "2026-08-15T09:00:00Z"),
  campaignResults("c3d4e5f", "2026-09-01T09:00:00Z"),
  campaignResults("d4e5f6a", "2026-09-15T09:00:00Z"),
  campaignResults("e5f6a7b", "2026-10-01T09:00:00Z"),
  campaignResults("f6a7b8c", "2026-10-15T09:00:00Z"),
  campaignResults("g7b9c1e", "2026-10-28T09:33:00Z"),
];

// --- Orchestration service: stagnating ~25%, guardrails regress mid-way ---
function orchResults(sha: string, date: string, statuses: Record<string, string>): HistoryEntry {
  const results: SkillEvaluationResult[] = [
    {
      skillName: "sap-agent-bootstrap",
      status: "divergent",
      reasoning: "Uses a custom bootstrapper (CustomAgentFactory) instead of the standard SAP agent container. All required behaviors are present but via a non-prescribed API.",
      evidence: ["src/bootstrap/custom-factory.ts:1", "src/main.ts:4"],
      metrics: mkMetrics(1150, 290, 10200),
    },
    {
      skillName: "sap-agent-guardrails",
      status: statuses.guardrails as any,
      reasoning: statuses.guardrails === "partial"
        ? "Input-side rate-limiting acts as a partial guardrail, but neither PII filtering nor output guardrails are implemented."
        : "No guardrail middleware found in the request or response pipeline.",
      evidence: statuses.guardrails === "partial" ? ["src/middleware/rate-limit.ts:1"] : [],
      metrics: mkMetrics(1350, 340, 12000),
    },
    {
      skillName: "sap-agent-instrumentation",
      status: statuses.instrumentation as any,
      reasoning: statuses.instrumentation === "partial"
        ? "Spans exist around orchestration steps but LLM calls are not individually traced and token counts are absent."
        : "No OTel instrumentation found.",
      evidence: statuses.instrumentation === "partial" ? ["src/tracing/orchestration.span.ts:1"] : [],
      metrics: mkMetrics(1200, 300, 10600),
    },
    {
      skillName: "sap-agent-spii",
      status: "missing",
      reasoning: "No SPII middleware or interceptor found in the response pipeline. All LLM outputs are returned to callers unfiltered.",
      evidence: [],
      metrics: mkMetrics(950, 240, 8500),
    },
  ];
  return { sha, ref: "refs/heads/main", evaluatedAt: date, results };
}

const HISTORY_ORCHESTRATION: HistoryEntry[] = [
  orchResults("a2b3c4d", "2026-08-01T09:00:00Z", { guardrails: "partial",  instrumentation: "missing" }),
  orchResults("b3c4d5e", "2026-08-15T09:00:00Z", { guardrails: "partial",  instrumentation: "partial"  }),
  orchResults("c4d5e6f", "2026-09-01T09:00:00Z", { guardrails: "partial",  instrumentation: "partial"  }),
  orchResults("d5e6f7a", "2026-09-15T09:00:00Z", { guardrails: "missing",  instrumentation: "partial"  }),
  orchResults("e6f7a8b", "2026-10-01T09:00:00Z", { guardrails: "missing",  instrumentation: "partial"  }),
  orchResults("f7a8b9c", "2026-10-15T09:00:00Z", { guardrails: "missing",  instrumentation: "partial"  }),
  orchResults("g8b0c2e", "2026-10-28T09:33:00Z", { guardrails: "missing",  instrumentation: "partial"  }),
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
        reasoning: "Entry point registers the agent card, dependencies injected via standard SAP container, health endpoint wired correctly.",
        evidence: ["src/main.ts:8", "src/agent/agent.module.ts:14", "src/health/health.controller.ts:5"],
        metrics: mkMetrics(1100, 280, 9800),
      },
      {
        skillName: "sap-agent-guardrails",
        status: "partial",
        reasoning: "Input guardrails are implemented via the PII filter middleware, but output guardrails for hallucination detection are missing.",
        evidence: ["src/guardrails/pii.filter.ts:1", "src/agent/agent.service.ts:42"],
        metrics: mkMetrics(1300, 320, 11200),
      },
      {
        skillName: "sap-agent-instrumentation",
        status: "missing",
        reasoning: "No OpenTelemetry spans are created around LLM calls. The skill requires tracing of every model invocation with token counts and latency.",
        evidence: [],
        metrics: mkMetrics(1200, 300, 10500),
      },
      {
        skillName: "sap-agent-spii",
        status: "adopted",
        reasoning: "SPII filtering is correctly integrated: the middleware intercepts all LLM responses and applies required redaction patterns before returning to the caller.",
        evidence: ["src/spii/spii.filter.ts:1", "src/agent/agent.service.ts:67"],
        metrics: mkMetrics(900, 220, 8100),
      },
      {
        skillName: "sap-agent-evaluation",
        status: "not-applicable",
        reasoning: "This is a production agent deployment, not a harness or test environment. Evaluation tooling is not applicable here.",
        evidence: [],
        metrics: mkMetrics(800, 180, 6900),
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
      repoPath: "/home/runner/work/cx-ec-audience-identification-agent",
      history: HISTORY_AUDIENCE,
    },
    {
      repo: "my-org/cx-ec-campaign-activation-agent",
      repoUrl: "https://github.com/my-org/cx-ec-campaign-activation-agent",
      repoPath: "/home/runner/work/cx-ec-campaign-activation-agent",
      history: HISTORY_CAMPAIGN,
    },
    {
      repo: "my-org/campaign-orchestration-service",
      repoUrl: "https://github.com/my-org/campaign-orchestration-service",
      repoPath: "/home/runner/work/campaign-orchestration-service",
      history: HISTORY_ORCHESTRATION,
    },
  ],
};

export function getMockData(): SkillproofData {
  const mode = new URLSearchParams(window.location.search).get("mode");
  return mode === "single" ? MOCK_SINGLE : MOCK_MULTI;
}
