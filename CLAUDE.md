# cathy-kiriakos-blog — Agent Maintenance Guide

This file is the primary context for the OpenClaw agent maintaining this repo.
Read it before acting. Keep it up to date if you change something structural.

---

## Repo overview

Personal blog and market-data dashboard for Cathy Kiriakos.

- **Stack:** Vite + React + TypeScript, Tailwind CSS, shadcn/ui, TipTap editor
- **Data layer:** Supabase (PostgreSQL + Edge Functions + Storage)
- **Market data:** Alpha Vantage API → `scripts/fetch-market-data.js` → Supabase
- **News:** NewsAPI + NYT API → `scripts/fetch-ai-news.js` → pillar-classified
  signal (`data/weekly_signal.json`) + Supabase
- **Deploy:** Lovable (frontend), Supabase (backend)
- **CI:** GitHub Actions (`.github/workflows/`)

---

## Directory map

```
scripts/                  Node scripts run by CI and manually
  lib/signal-taxonomy.js  Shared pillar/institutional taxonomy, classifier,
                          and sentiment analyzer — single source of truth used
                          by fetch-ai-news.js and generate-daily-digest.js
  check-api-health.js     Validates all API keys; exits non-zero on failure
  fetch-market-data.js    Pulls stock data for tracked tickers → Supabase
  fetch-ai-news.js        Pulls AI news from NewsAPI / NYT / NPR, classifies it
                          against the three content pillars (Applied AI,
                          Governance-as-Code, Human-Centric Design) + a UChicago
                          institutional-signal filter, scores relevance, writes
                          data/weekly_signal.json, and upserts → Supabase
  generate-daily-digest.js Assembles the daily digest (markdown + Supabase
                          draft post); news section is classified through the
                          shared taxonomy — Institutional Signal first, then
                          grouped by pillar, then an "Also on the Radar" list
  generate-weekly-post.js Reads data/weekly_signal.json and generates a weekly
                          summary blog post (markdown + YAML front matter) under
                          content/weekly-summaries/ — Institutional Highlights
                          (UChicago/Booth) on top, then a table grouped by the
                          three pillars; pillar names become front-matter tags
  fixtures/               Sample data for testing scripts without API keys
  test-database.js        Smoke-tests Supabase connectivity

content/
  weekly-summaries/       Generated weekly summary posts
                          (weekly-summary-YYYY-MM-DD.md)

supabase/
  migrations/             SQL migrations (applied via Supabase CLI)
  functions/              Edge Functions (Deno)
    social-post/          Scheduled social posting function

src/
  components/             React components
  pages/                  Route-level pages
  integrations/           Supabase client + generated types
  hooks/                  Custom React hooks

.github/workflows/
  dailyMarketUpdate.yml   Runs daily at 09:00 UTC; fetches data + commits
  api-health-check.yml    Runs every Monday at 08:00 UTC; validates keys
```

---

## Required GitHub Secrets

| Secret | Used by | Where to renew |
|--------|---------|---------------|
| `SUPABASE_URL` | all scripts | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_KEY` | all scripts | Supabase Dashboard → Settings → API |
| `ALPHA_VANTAGE_KEY` | fetch-market-data | alphavantage.co → Account |
| `NEWS_API_KEY` | fetch-ai-news | newsapi.org → Account |
| `NYT_API_KEY` | fetch-ai-news | developer.nytimes.com → Apps |
| `NPR_API_KEY` | fetch-ai-news (optional) | npr.org developer |

---

## Active GitHub issue labels

- `daily-job-failure` — opened automatically by `dailyMarketUpdate.yml` on failure
- `api-health-failure` — opened automatically by `api-health-check.yml` on failure

Both workflows de-duplicate: they skip creating an issue if one is already open
with the relevant label. Close the issue after the fix is verified.

---

## Maintenance runbooks

### 1. CI / workflow failure

**Trigger:** A `daily-job-failure` or `api-health-failure` issue is open, or a
workflow run shows as failed.

**Diagnosis steps:**
1. Fetch the failing run logs from the GitHub Actions API.
2. Check the "Validate secrets" step output — a missing secret is the most
   common root cause.
3. Check `scripts/check-api-health.js` output for which API returned an error.
4. Look for `npm ci` failures that indicate a broken `package-lock.json` or a
   newly incompatible package version.

**Fix patterns:**

| Symptom | Action |
|---------|--------|
| `Missing or empty secrets: ALPHA_VANTAGE_KEY` | Secret expired or was never set. Alert Cathy — agent cannot rotate third-party keys. Leave a comment on the issue with the exact secret name and renewal URL. |
| `npm ci` fails with peer-dep conflict | Run `npm install` locally, commit updated `package-lock.json` to fix. |
| Script exits non-zero, Supabase error | Check `scripts/test-database.js` output; likely RLS policy blocking the service key, or a missing table. See Supabase runbook below. |
| `git push` fails in workflow | Branch protection or token scope issue. Check `permissions:` block in the workflow. |
| Script works but writes 0 rows | External API rate-limit or format change. Read the script's error log carefully; may require updating the response-parsing logic. |

**After fixing:**
- Commit to a branch, push, and open a PR if the fix touches workflow YAML or
  scripts. For `package-lock.json`-only changes, a direct push to `main` is
  acceptable.
- Re-run the failed workflow manually (`workflow_dispatch`) to confirm the fix.
- Close the open failure issue once the run succeeds.

---

### 2. Dependency updates

**Cadence:** Run this check when a `npm audit` finding is flagged or on a
monthly schedule.

**Steps:**
```bash
# 1. Identify outdated packages
npm outdated

# 2. Check for security vulnerabilities
npm audit

# 3. Update non-breaking (patch/minor)
npm update

# 4. For major-version updates, update one at a time
npm install <package>@latest

# 5. Verify the build still works
npm run build
npm run lint
```

**Safe-to-auto-update (low risk):** `date-fns`, `clsx`, `tailwind-merge`,
`lucide-react`, `axios`, `zod`, `recharts`.

**Update with care (may have breaking changes):**
- `@supabase/supabase-js` — check the Supabase JS changelog; column helpers
  and filter API change between major versions.
- `@tiptap/*` — editor extensions are versioned together; update all `@tiptap/`
  packages in a single `npm install` call.
- `@tanstack/react-query` — v4→v5 had a large API surface change.
- `vite` / `@vitejs/plugin-react-swc` — update together; check `vite.config.ts`
  for deprecated options after upgrading.
- `tailwindcss` — v3→v4 has breaking config format changes; do NOT auto-update.

**After updating:**
- Run `npm run build` — a clean TypeScript build is the acceptance bar.
- Commit `package.json` and `package-lock.json` together.
- PR title: `chore: update npm dependencies YYYY-MM-DD`

---

### 3. Supabase health

**Key tables** (used by the daily jobs):

| Table | Purpose |
|-------|---------|
| `market_data` | Stock price snapshots per ticker per day |
| `ai_news` | Fetched news articles |
| `daily_digests` | Assembled daily summary rows |
| `reflections` | Blog reflection posts |
| `categories` | Post categories |

**Health check script:** `scripts/check-api-health.js`
- Runs a `SELECT id LIMIT 1` against `market_data` using the service key.
- Exits non-zero if the query fails.

**Common Supabase failure modes:**

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `JWTExpired` | Service key was regenerated in Supabase dashboard but `SUPABASE_SERVICE_KEY` secret was not updated in GitHub | Update the secret |
| `permission denied for table market_data` | RLS policy is blocking even the service key | Check the migration files under `supabase/migrations/`; look for `disable_rls_public_tables.sql` — the service key bypasses RLS by default, so this usually means the table was recreated without the bypass. Run `ALTER TABLE market_data DISABLE ROW LEVEL SECURITY;` or ensure the service-role key is being used (not the anon key). |
| `relation "market_data" does not exist` | Migration was not applied | Run `supabase db push` from the project root or apply the migration SQL manually via the Supabase Dashboard SQL editor. |
| Edge function `social-post` timing out | Deno cold-start or downstream API slow | Check `supabase/functions/social-post/` — look for hardcoded timeouts. |
| `generate-daily-digest.js` writes 0 rows | `market_data` or `ai_news` table empty for that date | Check whether the fetch steps ran successfully in the same workflow run. |

**To run a manual health check locally:**
```bash
SUPABASE_URL=<url> SUPABASE_SERVICE_KEY=<key> node scripts/check-api-health.js
```

**To run a full database smoke-test:**
```bash
SUPABASE_URL=<url> SUPABASE_SERVICE_KEY=<key> node scripts/test-database.js
```

---

## Development commands

```bash
npm run dev       # local dev server (port 5173)
npm run build     # production build (TypeScript compile + Vite bundle)
npm run lint      # ESLint
```

No test suite currently exists. `npm run build` + `npm run lint` are the
acceptance checks before merging.

---

## Branch and commit conventions

- Feature / fix branches: `claude/<short-description>-<id>`
- Commit prefix: `fix:`, `feat:`, `chore:`, `ci:`
- Bot commits from the daily job use the prefix `🤖 Daily market & news update`
- After any commit touching `.github/workflows/`, verify the YAML is valid
  before pushing (CI will reject invalid YAML immediately).

---

## Things the agent should NOT do autonomously

- Rotate or create third-party API keys (Alpha Vantage, NYT, NewsAPI)
- Modify Supabase RLS policies without human review
- Delete migration files
- Force-push to `main`
- Merge PRs — open them and leave them for Cathy to review
