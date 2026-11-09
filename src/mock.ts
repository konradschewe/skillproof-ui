import type { SkillproofData, HistoryEntry, SkillEvaluationResult } from "./types";

function mkMetrics(inputTokens: number, outputTokens: number, durationMs: number) {
  return {
    durationMs,
    estimatedCostUsd: (inputTokens * 0.000003 + outputTokens * 0.000015),
    evaluator: { inputTokens: Math.round(inputTokens * 0.7), outputTokens: Math.round(outputTokens * 0.8), cacheReadTokens: Math.round(inputTokens * 0.3) },
    explorer:  { inputTokens: Math.round(inputTokens * 0.3), outputTokens: Math.round(outputTokens * 0.2) },
  };
}

// --- User service: improving 25% → 50% ---
function userServiceResults(sha: string, date: string, statuses: Record<string, string>): HistoryEntry {
  const results: SkillEvaluationResult[] = [
    {
      skillName: "ci-pipeline",
      status: statuses.ci as any,
      reasoning: statuses.ci === "adopted"
        ? "CI workflow runs lint, type-check, and tests on every pull request. Branch protection rules enforce passing checks before merge."
        : "No CI workflow found. The repository has no `.github/workflows/` directory.",
      evidence: statuses.ci === "adopted" ? [".github/workflows/ci.yml:1", ".github/workflows/ci.yml:22"] : [],
      metrics: mkMetrics(1100, 280, 9800),
    },
    {
      skillName: "structured-logging",
      status: statuses.logging as any,
      reasoning: statuses.logging === "partial"
        ? "The structured-logging skill is **partially** adopted:\n\n**What IS present:**\n1. `pino` logger initialized in `src/logger.ts` — JSON output format configured.\n2. Logger passed into request handlers via `app.use()` in `src/server.ts`.\n\n**What is ABSENT:**\n1. No correlation ID attached to log entries — `req.id` is never forwarded to the logger.\n2. No log level set via environment variable — hardcoded to `info` in `src/logger.ts:4`."
        : "No structured logging found. `console.log` used throughout — no log levels, no JSON output, no correlation IDs.",
      evidence: statuses.logging === "partial" ? ["src/logger.ts:1", "src/server.ts:14"] : [],
      metrics: mkMetrics(1300, 320, 11200),
    },
    {
      skillName: "health-endpoint",
      status: statuses.health as any,
      reasoning: statuses.health === "partial"
        ? "A `/health` route exists but only returns `200 OK` with no body. The skill requires a JSON body including `{ status, version, uptime }`.\n\n**Missing fields:**\n- `version` (from `package.json`)\n- `uptime` (from `process.uptime()`)\n- `dependencies` (DB connectivity check)"
        : "No `/health` or `/healthz` endpoint found. The skill requires a liveness probe route reachable without authentication.",
      evidence: statuses.health === "partial" ? ["src/routes/health.ts:1"] : [],
      metrics: mkMetrics(1200, 300, 10500),
    },
    {
      skillName: "env-config",
      status: statuses.envconfig as any,
      reasoning: statuses.envconfig === "adopted"
        ? "All configuration loaded from environment variables via `src/config.ts`. `.env.example` present and kept in sync. No secrets hardcoded."
        : "Database credentials hardcoded in `src/db.ts:12`. No `.env.example` file found.",
      evidence: statuses.envconfig === "adopted" ? ["src/config.ts:1", ".env.example:1"] : [],
      metrics: mkMetrics(900, 220, 8100),
    },
  ];
  return { sha, ref: "refs/heads/main", evaluatedAt: date, results };
}

const HISTORY_USER_SERVICE: HistoryEntry[] = [
  userServiceResults("a0b1c2d", "2026-08-01T09:00:00Z", { ci: "missing",  logging: "missing",  health: "missing", envconfig: "missing"  }),
  userServiceResults("b1c2d3e", "2026-08-15T09:00:00Z", { ci: "adopted",  logging: "missing",  health: "missing", envconfig: "missing"  }),
  userServiceResults("c2d3e4f", "2026-09-01T09:00:00Z", { ci: "adopted",  logging: "partial",  health: "missing", envconfig: "adopted"  }),
  userServiceResults("d3e4f5a", "2026-09-15T09:00:00Z", { ci: "adopted",  logging: "partial",  health: "missing", envconfig: "adopted"  }),
  userServiceResults("e4f5a6b", "2026-10-01T09:00:00Z", { ci: "adopted",  logging: "partial",  health: "partial",  envconfig: "adopted"  }),
  userServiceResults("f5a6b7c", "2026-10-15T09:00:00Z", { ci: "adopted",  logging: "partial",  health: "missing", envconfig: "adopted"  }),
  userServiceResults("a1f6b8d", "2026-10-28T09:33:00Z", { ci: "adopted",  logging: "partial",  health: "missing", envconfig: "adopted"  }),
];

// --- Billing service: always 100% ---
function billingResults(sha: string, date: string): HistoryEntry {
  const results: SkillEvaluationResult[] = [
    {
      skillName: "ci-pipeline",
      status: "adopted",
      reasoning: "CI workflow covers lint, type-check, unit tests, and integration tests. Branch protection enforces all checks.",
      evidence: [".github/workflows/ci.yml:1", ".github/workflows/ci.yml:31"],
      metrics: mkMetrics(1050, 260, 9200),
    },
    {
      skillName: "structured-logging",
      status: "adopted",
      reasoning: "All log output uses `pino` with JSON format. Correlation IDs attached via `pino-http` middleware. Log level configurable via `LOG_LEVEL` environment variable.",
      evidence: ["src/logger.ts:1", "src/middleware/request-logger.ts:1"],
      metrics: mkMetrics(1400, 350, 12400),
    },
    {
      skillName: "health-endpoint",
      status: "adopted",
      reasoning: "`/health` returns `{ status, version, uptime, dependencies }` including a live database connectivity check.",
      evidence: ["src/routes/health.ts:1", "src/routes/health.ts:18"],
      metrics: mkMetrics(1250, 310, 11000),
    },
    {
      skillName: "env-config",
      status: "adopted",
      reasoning: "All config loaded from environment variables. `.env.example` maintained. `src/config.ts` validates required vars on startup and exits early with a clear error if any are missing.",
      evidence: ["src/config.ts:1", ".env.example:1"],
      metrics: mkMetrics(880, 210, 7800),
    },
  ];
  return { sha, ref: "refs/heads/main", evaluatedAt: date, results };
}

const HISTORY_BILLING: HistoryEntry[] = [
  billingResults("a1b2c3d", "2026-08-01T09:00:00Z"),
  billingResults("b2c3d4e", "2026-08-15T09:00:00Z"),
  billingResults("c3d4e5f", "2026-09-01T09:00:00Z"),
  billingResults("d4e5f6a", "2026-09-15T09:00:00Z"),
  billingResults("e5f6a7b", "2026-10-01T09:00:00Z"),
  billingResults("f6a7b8c", "2026-10-15T09:00:00Z"),
  billingResults("g7b9c1e", "2026-10-28T09:33:00Z"),
];

// --- Analytics service: stagnating ~25%, logging regresses mid-way ---
function analyticsResults(sha: string, date: string, statuses: Record<string, string>): HistoryEntry {
  const results: SkillEvaluationResult[] = [
    {
      skillName: "ci-pipeline",
      status: "divergent",
      reasoning: "Uses a custom `Makefile`-based CI runner instead of the standard GitHub Actions workflow. All required checks run but via a non-prescribed mechanism.\n\n**What IS present (via custom path):**\n- `make lint`, `make test`, `make typecheck` run in CI via a shell script\n- Results uploaded as build artifacts\n- PRs blocked on failure via a required status check\n\n**Why it's divergent, not adopted:**\nThe skill prescribes a `.github/workflows/ci.yml` using the standard reusable workflow. The custom Makefile runner produces equivalent output but diverges from the shared workflow that downstream tooling (e.g. `dependency-updates`) hooks into.",
      evidence: ["Makefile:1", "scripts/run-ci.sh:1"],
      metrics: mkMetrics(1150, 290, 10200),
    },
    {
      skillName: "structured-logging",
      status: statuses.logging as any,
      reasoning: statuses.logging === "partial"
        ? "Log output uses `winston` but without JSON format or correlation IDs.\n\n**Missing:**\n- `format: winston.format.json()` not set — output is human-readable only\n- No correlation ID middleware (`express-request-id` or equivalent) wired up"
        : "No structured logging found. Raw `console.log` and `console.error` calls throughout — no log levels, no JSON output.",
      evidence: statuses.logging === "partial" ? ["src/logger.ts:1"] : [],
      metrics: mkMetrics(1350, 340, 12000),
    },
    {
      skillName: "health-endpoint",
      status: statuses.health as any,
      reasoning: statuses.health === "partial"
        ? "A `/ping` endpoint exists but is not the prescribed `/health` path and returns plain text `pong` instead of a JSON body."
        : "No health or liveness endpoint found.",
      evidence: statuses.health === "partial" ? ["src/routes/ping.ts:1"] : [],
      metrics: mkMetrics(1200, 300, 10600),
    },
    {
      skillName: "env-config",
      status: "missing",
      reasoning: "Database connection string hardcoded in `src/db/connection.ts:8`. API keys embedded in `src/integrations/stripe.ts:3` and `src/integrations/sendgrid.ts:5`. No `.env.example` file.",
      evidence: [],
      metrics: mkMetrics(950, 240, 8500),
    },
  ];
  return { sha, ref: "refs/heads/main", evaluatedAt: date, results };
}

const HISTORY_ANALYTICS: HistoryEntry[] = [
  analyticsResults("a2b3c4d", "2026-08-01T09:00:00Z", { logging: "partial",  health: "missing" }),
  analyticsResults("b3c4d5e", "2026-08-15T09:00:00Z", { logging: "partial",  health: "partial"  }),
  analyticsResults("c4d5e6f", "2026-09-01T09:00:00Z", { logging: "partial",  health: "partial"  }),
  analyticsResults("d5e6f7a", "2026-09-15T09:00:00Z", { logging: "missing",  health: "partial"  }),
  analyticsResults("e6f7a8b", "2026-10-01T09:00:00Z", { logging: "missing",  health: "partial"  }),
  analyticsResults("f7a8b9c", "2026-10-15T09:00:00Z", { logging: "missing",  health: "partial"  }),
  analyticsResults("g8b0c2e", "2026-10-28T09:33:00Z", { logging: "missing",  health: "partial"  }),
];

// Single-report mock — tests markdown rendering (?mode=single)
// Covers bold+code patterns (**`file.ts`** and **`f1` (or `f2`)**) and
// numbered lists separated by blank lines.
const MOCK_SINGLE: SkillproofData = {
  mode: "single",
  report: {
    repoPath: "my-org/notification-service",
    skillsDir: ".claude/skills",
    evaluatedAt: "2026-11-05T15:10:03.278Z",
    results: [
      {
        skillName: "openapi-spec",
        status: "partial",
        reasoning: "The repository shows partial adoption of the openapi-spec skill:\n\n**What IS present:**\n1. `openapi: '3.1.0'` declaration in `docs/openapi.yaml` — format is correct.\n2. All `/notifications` routes documented with request/response schemas.\n3. `@hey-api/openapi-ts` in `package.json` — client generation tooling is present.\n\n**What is ABSENT or incomplete:**\n1. The `docs/openapi.yaml` has no `components/securitySchemes` section — authentication requirements are undocumented.\n2. Error response schemas (`4xx`, `5xx`) are missing on 6 out of 9 endpoints.\n3. No CI step validates the spec against the running service — the spec can drift silently.\n4. The `generate:client` npm script is present but not wired into the CI pipeline.\n\nThe spec exists and covers the happy path, but security documentation and error contracts are absent.",
        evidence: [
          "docs/openapi.yaml: openapi 3.1.0 declaration present",
          "docs/openapi.yaml: no securitySchemes section",
          "docs/openapi.yaml: missing 4xx/5xx response schemas on POST /notifications, PATCH /notifications/{id}, DELETE /notifications/{id}",
          "package.json: @hey-api/openapi-ts present but generate:client not in CI",
          "No spec-validation step in .github/workflows/ci.yml",
        ],
        metrics: mkMetrics(167240, 5953, 76651),
      },
      {
        skillName: "local-dev-setup",
        status: "partial",
        reasoning: "The skill `local-dev-setup` requires several concrete artifacts:\n\n1. **`scripts/setup.sh` (or `scripts/bootstrap.sh`)**: Absent. There is no automated setup script — the README instructs developers to run 8 manual steps.\n\n2. **`docker-compose.yml` (or `compose.yaml`) for local dependencies**: Present — spins up Postgres and Redis for local development.\n\n3. **`.env.example` kept in sync with `.env`**: The `.env.example` is missing `REDIS_TLS_CERT` and `SMTP_FROM_ADDRESS` that are referenced in `src/config.ts:31` and `src/mailer.ts:7`.\n\n4. **`README.md` local dev section**: The README has a \"Getting started\" section but it references `npm run dev` without documenting the required environment variables or the database migration step.\n\n5. **Database migration on first run**: `npm run dev` starts the server but does not run `npm run db:migrate` first — new contributors hit a crash on first run.",
        evidence: [
          "docker-compose.yml: present with postgres and redis services",
          ".env.example: missing REDIS_TLS_CERT and SMTP_FROM_ADDRESS",
          "README.md: Getting started section present but incomplete",
          "No scripts/setup.sh or scripts/bootstrap.sh found",
          "package.json: dev script does not include db:migrate",
        ],
        metrics: mkMetrics(152620, 4511, 66741),
      },
      {
        skillName: "dependency-updates",
        status: "adopted",
        reasoning: "Dependabot is configured and active. All required artifacts are present:\n\n- `.github/dependabot.yml` — weekly update schedule for npm and GitHub Actions\n- Auto-merge enabled for patch updates via `.github/workflows/dependabot-auto-merge.yml`\n- PR title prefix `chore(deps):` matches the merge commit convention\n- Security advisories trigger immediate PRs (not batched with weekly schedule)\n\nThe absence of a `.nvmrc` pinning Node version is expected — the CI matrix covers multiple Node versions by design.",
        evidence: [
          ".github/dependabot.yml",
          ".github/workflows/dependabot-auto-merge.yml",
        ],
        metrics: mkMetrics(194788, 3605, 53942),
      },
      {
        skillName: "test-coverage",
        status: "not-applicable",
        reasoning: "The `notification-service` is a thin HTTP wrapper around an external email provider (Mailgun). Its logic is:\n1. Validate the incoming request schema\n2. Forward the payload to the Mailgun API\n3. Persist the delivery receipt\n\nUnit-testing steps 1–3 in isolation would require mocking Mailgun entirely, which would test the mock rather than the service. The team has instead invested in contract tests (`tests/contract/`) that run against a Mailgun sandbox environment in CI. The `test-coverage` skill is designed for services with non-trivial business logic and explicitly excludes thin adapters in its SKILL.md scope section.",
        evidence: [
          "tests/contract/: contract test suite against Mailgun sandbox",
          "SKILL.md scope section: 'not applicable to thin HTTP adapters or pure-passthrough services'",
          "src/: 4 source files, all mapping directly to external API calls",
        ],
        metrics: mkMetrics(129598, 6083, 78752),
      },
      {
        skillName: "local-dev-setup",
        status: "partial",
        reasoning: "The `local-dev-setup` skill prescribes specific deliverables for running the service locally:\n\n1. **`templates/.env.local` (or `config/.env.local`)**: The repo uses `.env.example` (not `config/.env.local`) as the environment template. It contains the `MAILGUN_API_KEY` and `DATABASE_URL` variables but lacks `DEV_SENDER_DOMAIN` and `LOG_LEVEL` — variables required for local testing against the Mailgun sandbox.\n\n2. **`scripts/setup.sh`**: Absent. The repo has no automated setup script — contributors follow a 6-step manual process documented in the README.\n\n3. **`docker-compose.yml` for local dependencies**: Present and functional — spins up Postgres and Redis with `docker compose up -d`.\n\n4. **Health check in `docker-compose.yml`**: The `postgres` service has no `healthcheck` defined — `npm run dev` can race and crash before Postgres is ready.\n\n5. **`.env.local` approach vs `.env` approach**: The repo uses a root-level `.env` (loaded via `dotenv`) rather than `config/.env.local`. This is a different pattern from what the skill prescribes.\n\nKey missing behaviors:\n- No `scripts/setup.sh` for one-command local setup\n- No `config/.env.local` template with `DEV_SENDER_DOMAIN` for sandbox testing\n- No `LOG_LEVEL` default in any local config (useful for quieter local output)\n\nWhat IS present: `docker-compose.yml` for local dependencies, `MAILGUN_API_KEY` and `DATABASE_URL` in `.env.example`, README with manual setup steps.",
        evidence: [
          "docker-compose.yml: present with postgres and redis, no healthcheck on postgres",
          ".env.example: contains MAILGUN_API_KEY, DATABASE_URL but missing DEV_SENDER_DOMAIN, LOG_LEVEL",
          "No scripts/setup.sh found",
          "No config/.env.local or templates/.env.local found",
        ],
        metrics: mkMetrics(98000, 3200, 44000),
      },
      {
        skillName: "structured-logging",
        status: "not-applicable",
        reasoning: "This repository is a serverless function deployed as an AWS Lambda. Structured logging via a persistent logger instance (e.g. `pino`, `winston`) does not apply because:\n\n- Lambda execution environments are ephemeral — there is no long-lived process to initialise a logger\n- CloudWatch Logs automatically captures all stdout/stderr output and provides structured querying via Logs Insights\n- The team has adopted the `aws-lambda-powertools` library which handles structured logging, tracing, and metrics natively for Lambda\n\nThe `structured-logging` skill explicitly excludes serverless functions in its SKILL.md scope section and points to the `lambda-observability` skill instead.",
        evidence: [
          "package.json: @aws-lambda-powertools/logger present",
          "src/handler.ts: logger from @aws-lambda-powertools/logger used throughout",
          "SKILL.md scope section: 'not applicable to AWS Lambda — use lambda-observability instead'",
          "serverless.yml: service deployed as Lambda functions",
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
      repo: "my-org/user-service",
      repoUrl: "https://github.com/my-org/user-service",
      repoPath: "/home/runner/work/user-service",
      history: HISTORY_USER_SERVICE,
    },
    {
      repo: "my-org/billing-service",
      repoUrl: "https://github.com/my-org/billing-service",
      repoPath: "/home/runner/work/billing-service",
      history: HISTORY_BILLING,
    },
    {
      repo: "my-org/analytics-service",
      repoUrl: "https://github.com/my-org/analytics-service",
      repoPath: "/home/runner/work/analytics-service",
      history: HISTORY_ANALYTICS,
    },
  ],
};

export function getMockData(): SkillproofData {
  const mode = new URLSearchParams(window.location.search).get("mode");
  return mode === "single" ? MOCK_SINGLE : MOCK_MULTI;
}
