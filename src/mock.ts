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
        ? "The guardrails skill is **partially** adopted:\n\n**What IS present:**\n1. `PiiFilterMiddleware` registered in `AppModule` — covers input-side PII redaction.\n2. Filter applies to all routes via `app.use()` in `main.ts`.\n\n**What is ABSENT:**\n1. No output guardrail for hallucination detection — `HallucinationFilter` is missing entirely.\n2. No `content-policy` check on LLM responses before they reach the caller."
        : "No guardrail middleware found in the request or response pipeline.\n\nThe skill requires:\n- An input-side filter (e.g. `PiiFilterMiddleware`) registered in `AppModule`\n- An output-side interceptor checking LLM responses for policy violations",
      evidence: statuses.guardrails === "partial" ? ["src/guardrails/pii.filter.ts:1", "src/app.module.ts:22"] : [],
      metrics: mkMetrics(1300, 320, 11200),
    },
    {
      skillName: "sap-agent-instrumentation",
      status: statuses.instrumentation as any,
      reasoning: statuses.instrumentation === "partial"
        ? "OTel spans are created around LLM calls but token counts are not recorded as span attributes.\n\n**Missing span attributes:**\n- `llm.usage.prompt_tokens`\n- `llm.usage.completion_tokens`\n- `llm.response.model`"
        : "No OpenTelemetry instrumentation found.\n\nThe skill requires tracing of every model invocation with:\n1. A span wrapping the `complete()` call\n2. `llm.usage.prompt_tokens` and `llm.usage.completion_tokens` as span attributes\n3. Latency recorded via `span.end()` after the response",
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
      reasoning: "Uses `CustomAgentFactory` instead of the standard SAP agent container. All required behaviors are present but via a non-prescribed API.\n\n**What IS present (via custom path):**\n- Agent card registration in `src/bootstrap/custom-factory.ts`\n- Dependency injection wired correctly\n- Health endpoint at `/health`\n\n**Why it's divergent, not adopted:**\nThe skill prescribes `SapAgentContainer.bootstrap()` from `@sap/agent-core`. The custom factory reimplements the same contract but diverges from the standard wiring pattern that downstream tooling (e.g. `sap-agent-test-remote`) expects.",
      evidence: ["src/bootstrap/custom-factory.ts:1", "src/main.ts:4"],
      metrics: mkMetrics(1150, 290, 10200),
    },
    {
      skillName: "sap-agent-guardrails",
      status: statuses.guardrails as any,
      reasoning: statuses.guardrails === "partial"
        ? "Input-side rate-limiting acts as a partial guardrail, but neither PII filtering nor output guardrails are implemented.\n\n**Missing:**\n- `PiiFilterMiddleware` on incoming requests\n- Output-side interceptor for hallucination / content-policy checks"
        : "No guardrail middleware found in the request or response pipeline.\n\nThe skill requires:\n- An input-side filter (e.g. `PiiFilterMiddleware`) registered in `AppModule`\n- An output-side interceptor checking LLM responses for policy violations",
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

// Real data from cx-ec-campaign-activation-agent — used to test markdown rendering (?mode=single)
const MOCK_SINGLE: SkillproofData = {
  mode: "single",
  report: {
    repoPath: "cx-ec-campaign-activation-agent/cx-ec-campaign-activation-agent",
    skillsDir: ".claude/plugins/agpm-managed/sap-application-foundation-agent-skills/skills",
    evaluatedAt: "2026-11-05T15:10:03.278Z",
    results: [
      {
        skillName: "sap-cloud-sdk-python",
        status: "partial",
        reasoning: "The repository shows partial adoption of the sap-cloud-sdk-python skill:\n\n**What IS present:**\n1. `spec.hanaAgentMemoryEnabled: true` in `app.yaml` — correct App Foundation wiring pattern for Agent Memory as prescribed by the skill.\n2. `sap-cloud-sdk~=0.55` in `mocks/specialist-mcp/requirements.txt` — the package is declared.\n3. `from sap_cloud_sdk.aicore import completion, disable_filtering, set_aicore_config` in `mocks/specialist-mcp/llm.py` — SDK usage for AI Core.\n\n**What is ABSENT or incomplete:**\n1. The `app.yaml` has no `requires` section at all — no BTP service bindings are declared via the standard wiring pattern (e.g., no `aicore`, `destination`, or other services declared). The skill requires services to be declared in `requires` with `name`, `service`, and `plan` fields.\n2. The SDK usage is confined entirely to the `mocks/` directory (a local development mock), not in the main agent code. The main agent code delegates to the `pydantic-harness` base image.\n3. No `CLOUD_SDK_CFG_*` environment variables are present, and no `create_client(instance=\"...\")` pattern is used.\n4. The `aicore` SDK usage in the mock does not follow the prescribed `create_client(instance=...)` pattern — it uses `set_aicore_config()` instead.\n\nThe skill's core wiring pattern (requires in app.yaml + create_client in code) is only partially implemented: `hanaAgentMemoryEnabled: true` is correct for agent_memory, but the aicore service has no `requires` entry and the code-side usage is in mocks only. Key required behaviors are genuinely absent from the main agent code.",
        evidence: [
          "app.yaml: spec.hanaAgentMemoryEnabled: true (correct agent_memory wiring)",
          "app.yaml: NO requires section — no service bindings declared",
          "mocks/specialist-mcp/requirements.txt: sap-cloud-sdk~=0.55",
          "mocks/specialist-mcp/llm.py line 10: from sap_cloud_sdk.aicore import completion, disable_filtering, set_aicore_config",
          "mocks/specialist-mcp/llm.py line 54-55: set_aicore_config() and disable_filtering() — not the create_client(instance=...) pattern",
          "No CLOUD_SDK_CFG_* environment variables anywhere in the repository",
          "docs/design/adr/technical-readiness-extensibility.md: sap_cloud_sdk.extensibility is used in the upstream pydantic-harness base image, not in this repo",
        ],
        metrics: mkMetrics(167240, 5953, 76651),
      },
      {
        skillName: "sap-agent-test-remote",
        status: "partial",
        reasoning: "The skill `sap-agent-test-remote` requires several concrete artifacts to be adopted:\n\n1. **`app/.env.deploy` gitignored**: The `.gitignore` has a generic `.env.*` wildcard that would catch `app/.env.deploy`, but there is no explicit `app/.env.deploy` entry as the skill prescribes.\n\n2. **`app/.env.deploy` file (credentials configured)**: No `app/.env.deploy` file exists in the repository. There's also no template file (`templates/.env.deploy`) present in the repo itself, meaning the skill setup hasn't been completed.\n\n3. **`test-agent.sh` / skill script available**: The script appears in `.claude/plugins/agpm-managed/.../scripts/test-agent.sh` — but this is in the AGPM-managed plugin directory, not committed/adopted as a configured skill.\n\n4. **`.agpm.yaml` skill registration**: The `.agpm.yaml` does NOT list `sap-agent-test-remote` as an installed skill. It only lists the parent plugin `sap-application-foundation-agent-skills`, which *contains* the skill, but the skill itself is not explicitly adopted.\n\n5. **Missing runtime deployment prerequisites**: There is no evidence that Level-0 setup has been completed (GitHub Actions `register-level-0.yaml` workflow run, dummy IAS application, etc.).",
        evidence: [
          ".agpm.yaml: lists `sap-application-foundation-agent-skills` plugin but does NOT explicitly list `sap-agent-test-remote` as an installed skill",
          ".claude/plugins/agpm-managed/sap-application-foundation-agent-skills/skills/sap-agent-test-remote/scripts/test-agent.sh: script exists only in the AGPM-managed plugin directory",
          "app.yaml: agent named `campaign-activation-agent` exists (required prerequisite)",
          ".gitignore: has `.env.*` wildcard pattern but no explicit `app/.env.deploy` entry as prescribed by the skill",
          "No `app/.env.deploy` file or `templates/.env.deploy` template found in the repository — credential setup not completed",
        ],
        metrics: mkMetrics(152620, 4511, 66741),
      },
      {
        skillName: "sap-agent-prompt-optimizer",
        status: "adopted",
        reasoning: "The sap-agent-prompt-optimizer skill is fully present in the repository, installed as a managed plugin under `.claude/plugins/agpm-managed/sap-application-foundation-agent-skills/skills/sap-agent-prompt-optimizer/`. All required skill artifacts are present:\n\n- `scripts/optimize.py` — the main automation script\n- `templates/optimize.config.example.yaml` — the config template\n- `templates/env.local.example` — credentials template\n- `evals/evals.json` — evaluation definitions\n- `evals/fixtures/smoke_test.py` — smoke tests\n- All supporting scripts (`_config.py`, `_dataset.py`, `_execution.py`, `_metric.py`, `_prereqs.py`, `_results.py`, `_state.py`, `_template.py`) and reference docs are present within the skill directory\n\nThe absence of a project-root-level `optimize.config.yaml` or `.env.local` is expected and correct — the SKILL.md instructs developers to copy the templates and fill them in when they want to run an optimization. These are runtime artifacts, not skill installation artifacts.",
        evidence: [
          ".claude/plugins/agpm-managed/sap-application-foundation-agent-skills/skills/sap-agent-prompt-optimizer/scripts/optimize.py",
          ".claude/plugins/agpm-managed/sap-application-foundation-agent-skills/skills/sap-agent-prompt-optimizer/templates/optimize.config.example.yaml",
          ".claude/plugins/agpm-managed/sap-application-foundation-agent-skills/skills/sap-agent-prompt-optimizer/templates/env.local.example",
          ".claude/plugins/agpm-managed/sap-application-foundation-agent-skills/skills/sap-agent-prompt-optimizer/evals/evals.json",
        ],
        metrics: mkMetrics(194788, 3605, 53942),
      },
      {
        skillName: "sap-internal-sdk-python",
        status: "not-applicable",
        reasoning: "This repository is a consuming agent built on the AAFS Pydantic Harness. According to the additional context, it does NOT contain any runtime Python code of its own — all Python infrastructure (including metering and SPII) lives in the harness base image, which is pulled via `FROM pydantic-harness:...` in the Dockerfile. The `sap-internal-sdk-python` skill requires adding the `sap-internal-sdk` package as a Python dependency and wiring the `metering` or `spii` modules in Python code. Since this repository delegates all such implementation to the harness image (confirmed by `docs/design/adr/technical-readiness-metering.md` and `docs/design/adr/technical-readiness-spii.md` documenting those as harness-level implementations), there is nothing to adopt in this repo. The Dockerfile is a single-stage build with no `sap-internal-sdk` dependency, which is correct and expected — the SDK is consumed inside the harness, not here.",
        evidence: [
          "Dockerfile line 1: `FROM cx-ec-aafs-harness.common.repositories.cloud.sap/pydantic-harness:v1.20.9@sha256:...` — single-stage, no Python code or pip installs",
          "No `sap-internal-sdk` in any requirements.txt or pyproject.toml (aeval/requirements.txt, mocks/specialist-mcp/requirements.txt, mocks/user-context-mcp/requirements.txt, tests/requirements.txt)",
          "docs/design/adr/technical-readiness-metering.md: metering is implemented in the pydantic-harness base image via harness/metering.py",
          "docs/design/adr/technical-readiness-spii.md: SPII is implemented in the harness base image (api/spii.py, models/spii.py, services/spii_*.py)",
          "aeval/docker-compose.ci.yml line 98: comment states 'Required by sap_internal_sdk metering (since aafs-pydantic-harness#77)' — confirming the SDK is a harness concern, not this repo's",
        ],
        metrics: mkMetrics(129598, 6083, 78752),
      },
      {
        skillName: "sap-agent-spii",
        status: "not-applicable",
        reasoning: "This repository is a consuming agent built on the AAFS Pydantic Harness. According to the ADR documented in `docs/design/adr/technical-readiness-spii.md`, SPII endpoint handling is intentionally delegated entirely to the pydantic-harness base image.\n\nThe skill requires:\n- `app/api/spii.py` with `create_client` from `sap-internal-sdk` → not present (handled by harness)\n- `sap-internal-sdk` in requirements.txt/pyproject.toml → not present\n- `tests/test_spii_setup.py` → not present\n- `main.py` importing `create_spii_routes` → not present\n\nNone of these are present because the harness base image owns all SPII infrastructure. This is consistent with the additional context that this repository does not contain any runtime Python code of its own.",
        evidence: [
          "docs/design/adr/technical-readiness-spii.md — documents the architectural decision to delegate SPII entirely to the pydantic-harness base image (v1.20.9)",
          "No app/api/spii.py file exists in the repository",
          "No sap-internal-sdk dependency in any requirements.txt or pyproject.toml",
          "No tests/test_spii_setup.py file exists",
          "No hand-rolled SPII files (spii_base.py, spii_service.py, spii_agw.py, etc.) present",
        ],
        metrics: mkMetrics(313509, 6394, 123496),
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
