# Deployment Guide

The site is hosted **entirely on Cloudflare Workers** and served from
**https://blog.kiriakosai.com**. There is no Lovable or Netlify involvement —
Cloudflare serves the static build and runs the edge Open Graph Worker.

## Architecture

| Layer | Runs on | Config |
|-------|---------|--------|
| Frontend SPA (`./dist`) | Cloudflare Workers static assets | `wrangler.toml` (`[assets]`) |
| Social OG previews | Cloudflare Worker | `cloudflare-worker.js` (`main` in `wrangler.toml`) |
| Backend / database | Supabase | `supabase/` |
| Data pipelines | GitHub Actions | `.github/workflows/` |

A single Worker fronts everything: real browsers are served the static SPA
(with SPA fallback for client-side routes), while social crawlers hitting a
`/blog/:slug` URL get a minimal HTML page with the correct `og:` tags fetched
live from Supabase.

## Deploying the frontend

```sh
# 1. Build the production bundle → ./dist
npm run build

# 2. Deploy the Worker + static assets to Cloudflare
npx wrangler deploy
```

Wrangler reads `wrangler.toml`, which points `main` at `cloudflare-worker.js`
and binds the `./dist` directory as static assets (`binding = "ASSETS"`,
`not_found_handling = "single-page-application"`).

## One-time Cloudflare setup

1. **Custom domain** — In the Cloudflare dashboard: Workers & Pages → this
   Worker → Settings → Domains & Routes → add `blog.kiriakosai.com` as a Custom
   Domain (or add a Route on the proxied `kiriakosai.com` zone).

2. **Worker variables** — Set these under Workers → this Worker → Settings →
   Variables, or add a `[vars]` block to `wrangler.toml`:

   | Variable | Value |
   |----------|-------|
   | `SUPABASE_URL` | `https://thkeyabexljbwpaxxkgr.supabase.co` |
   | `SUPABASE_ANON_KEY` | the `VITE_SUPABASE_PUBLISHABLE_KEY` value |
   | `SITE_URL` | `https://blog.kiriakosai.com` (no trailing slash) |
   | `SITE_NAME` | `Ni! New Innovation \| Cathy Kiriakos` |
   | `DEFAULT_OG_IMAGE` | URL to the default social share image |

3. **Verify OG tags** — After deploying, paste an article URL into
   <https://developers.facebook.com/tools/debug/> and
   <https://www.linkedin.com/post-inspector/> to confirm previews render.

## Populating market data

Market data comes from the GitHub Actions pipeline, not the deploy. If the
Market Intelligence page shows `$0.00T`, the daily job hasn't populated Supabase
yet:

1. Go to <https://github.com/cathykiriakos/cathy-kiriakos-blog/actions>
2. Run the **"Daily Market & News Update"** workflow (`workflow_dispatch`)
3. Wait 5–10 minutes; it fetches market data + AI news and writes to Supabase

After the first run it updates automatically every day at 09:00 UTC.
