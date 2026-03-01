/**
 * Cloudflare Worker — Per-article Open Graph Link Previews
 * =========================================================
 *
 * HOW IT WORKS
 * ------------
 * When Facebook, LinkedIn, Threads, or any social crawler requests a URL
 * from your site, this Worker intercepts it. If the request is from a social
 * crawler bot and the URL is a blog post (/blog/:slug), the Worker fetches
 * that post's data from your Supabase REST API and returns a minimal HTML
 * page with the correct og:title, og:description, og:image, and og:url tags.
 * All other requests are proxied through to Lovable as normal.
 *
 * SETUP INSTRUCTIONS
 * ------------------
 * 1. Sign up at https://dash.cloudflare.com (free tier is sufficient).
 *
 * 2. In Cloudflare, point your custom domain's DNS to your Lovable site:
 *    - Add a CNAME record: your-domain.com → <lovable-project>.lovable.app
 *    - Enable the Cloudflare proxy (orange cloud icon).
 *
 * 3. Create a Worker:
 *    - Go to Workers & Pages → Create → "Hello World" Worker.
 *    - Replace the default script with the contents of this file.
 *    - Click Save & Deploy.
 *
 * 4. Add a Worker Route:
 *    - Go to your domain → Workers Routes → Add route.
 *    - Pattern: your-domain.com/* (or cathy-kiriakos.lovable.app/*)
 *    - Worker: the worker you just created.
 *
 * 5. Set Worker environment variables (Workers → your worker → Settings → Variables):
 *    SUPABASE_URL      = https://thkeyabexljbwpaxxkgr.supabase.co
 *    SUPABASE_ANON_KEY = <your VITE_SUPABASE_PUBLISHABLE_KEY value>
 *    SITE_URL          = https://your-domain.com   (no trailing slash)
 *    SITE_NAME         = Ni! New Innovation | Cathy Kiriakos
 *    DEFAULT_OG_IMAGE  = <URL to your default social share image>
 *
 * 6. After deploying, go to https://developers.facebook.com/tools/debug/
 *    and paste your article URL to verify og: tags are being picked up.
 *    Also test at https://www.linkedin.com/post-inspector/
 */

// Social crawler user-agent fragments — any match triggers the OG response
const SOCIAL_BOTS = [
  'facebookexternalhit',
  'facebookcatalog',
  'Facebot',
  'LinkedInBot',
  'Twitterbot',
  'Slackbot',
  'Slack-ImgProxy',
  'Discordbot',
  'TelegramBot',
  'WhatsApp',
  'iMessage',
  'Applebot',
  'pinterest',
  'Pinterestbot',
  'instagram',
  'Threadsbot',
  'meta-externalagent',
];

function isSocialCrawler(userAgent) {
  const ua = (userAgent || '').toLowerCase();
  return SOCIAL_BOTS.some((bot) => ua.includes(bot.toLowerCase()));
}

// Extract /blog/:slug from a pathname
function extractBlogSlug(pathname) {
  const match = pathname.match(/^\/blog\/([^/?#]+)/);
  return match ? match[1] : null;
}

// Fetch post data from Supabase REST API
async function fetchPost(slug, env) {
  const url =
    `${env.SUPABASE_URL}/rest/v1/posts` +
    `?slug=eq.${encodeURIComponent(slug)}` +
    `&select=title,excerpt,image_url,slug` +
    `&limit=1`;

  const res = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) return null;
  const rows = await res.json();
  return rows.length > 0 ? rows[0] : null;
}

// Build a minimal HTML page with og: meta tags for social crawlers
function buildOgHtml({ title, description, imageUrl, pageUrl, siteName }) {
  const safe = (s) => String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${safe(title)}</title>

  <!-- Open Graph (Facebook, LinkedIn, Threads, iMessage, Slack, Discord) -->
  <meta property="og:type"        content="article" />
  <meta property="og:site_name"   content="${safe(siteName)}" />
  <meta property="og:title"       content="${safe(title)}" />
  <meta property="og:description" content="${safe(description)}" />
  <meta property="og:image"       content="${safe(imageUrl)}" />
  <meta property="og:url"         content="${safe(pageUrl)}" />
  <meta property="og:locale"      content="en_US" />

  <!-- Twitter / X Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${safe(title)}" />
  <meta name="twitter:description" content="${safe(description)}" />
  <meta name="twitter:image"       content="${safe(imageUrl)}" />
  <meta name="twitter:creator"     content="@cathykiriakos" />

  <!-- Redirect real browsers immediately to the React app -->
  <meta http-equiv="refresh" content="0; url=${safe(pageUrl)}" />
</head>
<body>
  <p>Redirecting… <a href="${safe(pageUrl)}">Click here</a> if not redirected.</p>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('User-Agent') || '';

    // Only intercept GET requests from social crawlers
    if (request.method !== 'GET' || !isSocialCrawler(userAgent)) {
      // Pass all other requests through to Lovable unchanged
      return fetch(request);
    }

    const slug = extractBlogSlug(url.pathname);

    if (slug) {
      // Per-article preview
      const post = await fetchPost(slug, env).catch(() => null);

      if (post) {
        const pageUrl = `${env.SITE_URL}/blog/${post.slug}`;
        const html = buildOgHtml({
          title: post.title,
          description: post.excerpt || `Read "${post.title}" on ${env.SITE_NAME}`,
          imageUrl: post.image_url || env.DEFAULT_OG_IMAGE,
          pageUrl,
          siteName: env.SITE_NAME,
        });
        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
    }

    // Site-wide fallback for non-article URLs (home, /posts, /ni-data, etc.)
    const html = buildOgHtml({
      title: env.SITE_NAME,
      description:
        'NiData & AI Insights from Cathy Kiriakos — Data Engineering Manager and creator of NiData.',
      imageUrl: env.DEFAULT_OG_IMAGE,
      pageUrl: `${env.SITE_URL}${url.pathname}`,
      siteName: env.SITE_NAME,
    });
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
};
