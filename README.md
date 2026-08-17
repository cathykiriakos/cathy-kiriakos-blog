# cathy-kiriakos-blog

Personal blog and market-data dashboard for Cathy Kiriakos, live at
**https://blog.kiriakosai.com**.

## Tech stack

- **Vite** + **React** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **TipTap** rich-text editor
- **Supabase** (PostgreSQL + Edge Functions + Storage) for the data layer
- **Cloudflare Workers** for hosting and edge Open Graph previews
- **GitHub Actions** for the daily/weekly data pipelines

## Local development

Requires Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd cathy-kiriakos-blog

# 2. Install dependencies
npm i

# 3. Start the dev server (http://localhost:8080)
npm run dev
```

Other commands:

```sh
npm run build   # production build (TypeScript compile + Vite bundle → ./dist)
npm run lint    # ESLint
npm run preview # preview the production build locally
```

## Hosting & deployment

The site is hosted entirely on **Cloudflare Workers** and served from the custom
domain `blog.kiriakosai.com`. A single Worker (`cloudflare-worker.js`) both:

1. serves the static SPA build in `./dist` via the Workers static-assets binding
   (configured in `wrangler.toml`), and
2. intercepts social-crawler requests (Facebook, LinkedIn, Threads, Slack,
   Discord, …) to return per-article Open Graph tags for rich link previews.

To deploy:

```sh
npm run build       # produces ./dist
npx wrangler deploy # uploads the Worker + static assets to Cloudflare
```

See the header comment in `cloudflare-worker.js` and `DEPLOYMENT_GUIDE.md` for
the full setup, including the Worker environment variables and custom-domain
binding.

## Backend & data pipelines

- **Supabase** holds posts, market data, and news. See `MARKET_DATA_SETUP_GUIDE.md`
  and `CLAUDE.md` for schema and runbooks.
- **GitHub Actions** (`.github/workflows/`) run the daily market/news update, the
  weekly summary, and the API health check. Required secrets are documented in
  `CLAUDE.md`.
