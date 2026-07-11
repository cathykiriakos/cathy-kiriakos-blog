# Cathy Kiriakos — Blog & Market Intelligence

Personal blog and market-data dashboard covering AI, data, and technology.
The site pairs a React frontend with a Supabase backend and a set of
scheduled data pipelines that pull market data and AI news, classify the
news against three content pillars, and generate daily digests and weekly
summary posts automatically.

## Tech stack

- **Frontend:** Vite 5 + React 18 + TypeScript, Tailwind CSS, shadcn/ui
  (Radix primitives), TipTap rich-text editor, TanStack Query, React Router,
  Recharts
- **Backend:** Supabase — PostgreSQL, Edge Functions (Deno), Storage
- **Automation:** Node 22 scripts under `scripts/`, run by GitHub Actions
- **Hosting:** Lovable (frontend); a `wrangler.toml` is also present for
  serving the `dist/` build via Cloudflare Workers static assets

## Repository layout

```
src/                      React app (components, pages, hooks, Supabase client)
scripts/                  Node scripts run by CI and manually
  lib/signal-taxonomy.js  Shared pillar/institutional taxonomy + classifier
  fetch-market-data.js    Alpha Vantage stock data → Supabase
  fetch-ai-news.js        NewsAPI / NYT / NPR → classified signal + Supabase
  generate-daily-digest.js  Daily digest (markdown + Supabase draft post)
  generate-weekly-post.js Weekly summary post from data/weekly_signal.json
  check-api-health.js     Validates all API keys; exits non-zero on failure
  test-database.js        Supabase connectivity smoke test
  fixtures/               Sample data for running scripts without API keys
content/weekly-summaries/ Generated weekly posts (weekly-summary-YYYY-MM-DD.md)
daily-digests/            Generated daily digest markdown
supabase/                 Migrations, Edge Functions (social-post), config
.github/workflows/        Scheduled automation (see below)
```

## Automated pipelines

| Workflow | Schedule (UTC) | What it does |
|----------|----------------|--------------|
| `dailyMarketUpdate.yml` | Daily 09:00 | Fetches market data + AI news, generates the daily digest, commits results |
| `weeklySummary.yml` | Sundays 13:00 | Refreshes the weekly news signal and generates a weekly summary post |
| `api-health-check.yml` | Mondays 08:00 | Validates all API keys and Supabase connectivity |

Each workflow opens a labeled GitHub issue on failure
(`daily-job-failure`, `weekly-post-failure`, `api-health-failure`) and
skips duplicates while one is already open.

News classification is keyword/taxonomy-based (no LLM calls): articles are
scored against three content pillars — Applied AI, Governance-as-Code, and
Human-Centric Design — plus a UChicago/Booth institutional-signal filter.
The taxonomy lives in `scripts/lib/signal-taxonomy.js` and is shared by the
news fetcher and the digest/weekly generators.

## Local development

Requires Node.js 22+ and npm.

```sh
npm ci            # install dependencies
npm run dev       # dev server on http://localhost:5173
npm run build     # production build (acceptance check)
npm run lint      # ESLint (acceptance check)
npm run preview   # preview the production build
```

There is no test suite; `npm run build` + `npm run lint` are the acceptance
checks before merging.

### Running the data scripts locally

The scripts read credentials from environment variables (in CI these come
from GitHub Secrets):

| Variable | Used by | Source |
|----------|---------|--------|
| `SUPABASE_URL` | all scripts | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_KEY` | all scripts | Supabase Dashboard → Settings → API |
| `ALPHA_VANTAGE_KEY` | fetch-market-data | alphavantage.co |
| `NEWS_API_KEY` | fetch-ai-news | newsapi.org |
| `NYT_API_KEY` | fetch-ai-news | developer.nytimes.com |
| `NPR_API_KEY` | fetch-ai-news (optional) | npr.org developer |

```sh
# health check
SUPABASE_URL=<url> SUPABASE_SERVICE_KEY=<key> node scripts/check-api-health.js

# run the digest against fixture data (no API keys needed)
NEWS_FIXTURES_PATH=scripts/fixtures/ai_news.sample.json \
DIGEST_FIXTURES_PATH=scripts/fixtures/daily_digest.sample.json \
node scripts/generate-daily-digest.js
```

## Editing via Lovable

This project can also be edited through
[Lovable](https://lovable.dev/projects/65c2f9ed-16cc-427a-af29-7a59108fd09a);
changes made there are committed back to this repo, and pushed changes are
reflected in Lovable. Publishing is done from Lovable via Share → Publish.

## Further documentation

- `CLAUDE.md` — maintenance runbooks (CI failures, dependency updates,
  Supabase health) and agent conventions
- `supabase/SETUP_INSTRUCTIONS.md` — backend setup
- `MARKET_DATA_SETUP_GUIDE.md` — market-data pipeline setup
- `CONTENT_MANAGEMENT_GUIDE.md` — managing posts and content
