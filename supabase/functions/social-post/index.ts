/**
 * Supabase Edge Function: social-post
 * ====================================
 * Posts content to LinkedIn, Facebook, Instagram, and/or Threads
 * using their respective APIs. API tokens are stored as Supabase
 * secrets (never exposed to the browser).
 *
 * SETUP INSTRUCTIONS
 * ------------------
 * Run the following in your terminal to set secrets before deploying:
 *
 *   supabase secrets set LINKEDIN_ACCESS_TOKEN="your_token"
 *   supabase secrets set LINKEDIN_AUTHOR_URN="urn:li:person:XXXXXXXXX"
 *   supabase secrets set META_ACCESS_TOKEN="your_page_access_token"
 *   supabase secrets set META_PAGE_ID="your_facebook_page_id"
 *   supabase secrets set META_INSTAGRAM_ACCOUNT_ID="your_instagram_account_id"
 *   supabase secrets set META_THREADS_USER_ID="your_threads_user_id"
 *
 * Then deploy with:
 *   supabase functions deploy social-post
 *
 * HOW TO OBTAIN API CREDENTIALS
 * ------------------------------
 *
 * LINKEDIN:
 *   1. Go to https://www.linkedin.com/developers/apps → Create App
 *   2. Request the "Share on LinkedIn" and "Sign In with LinkedIn" products
 *   3. Generate a token with scopes: w_member_social, r_liteprofile
 *   4. Your author URN is: urn:li:person:<your_profile_id>
 *      (find it via GET https://api.linkedin.com/v2/me with your token)
 *   Docs: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/share-api
 *
 * FACEBOOK (Pages):
 *   1. Go to https://developers.facebook.com → My Apps → Create App
 *   2. Add "Pages" product
 *   3. Generate a Page Access Token (long-lived) for your page
 *   4. Your page ID is in your page's "About" section
 *   Docs: https://developers.facebook.com/docs/pages/publishing/
 *
 * INSTAGRAM (Business):
 *   1. Same Meta app — add "Instagram Graph API" product
 *   2. Connect your Instagram Business/Creator account to a Facebook Page
 *   3. Get the Instagram Account ID via:
 *      GET https://graph.facebook.com/v19.0/{page-id}?fields=instagram_business_account&access_token={token}
 *   Docs: https://developers.facebook.com/docs/instagram-api/guides/content-publishing
 *
 * THREADS:
 *   1. Same Meta app — add "Threads API" product (requires app review)
 *   2. Your Threads user ID is the same as your Instagram user ID in most cases
 *   Docs: https://developers.facebook.com/docs/threads
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PostRequest {
  platforms: Array<"linkedin" | "facebook" | "instagram" | "threads">;
  title: string;
  excerpt: string;
  url: string;
  imageUrl?: string;
}

// ─── LinkedIn ────────────────────────────────────────────────────────────────

async function postToLinkedIn(payload: PostRequest): Promise<{ ok: boolean; error?: string }> {
  const token = Deno.env.get("LINKEDIN_ACCESS_TOKEN");
  const authorUrn = Deno.env.get("LINKEDIN_AUTHOR_URN");

  if (!token || !authorUrn) {
    return { ok: false, error: "LINKEDIN_ACCESS_TOKEN or LINKEDIN_AUTHOR_URN secret not set" };
  }

  const body = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: `${payload.title}\n\n${payload.excerpt}\n\n${payload.url}` },
        shareMediaCategory: payload.imageUrl ? "ARTICLE" : "NONE",
        media: payload.imageUrl
          ? [{ status: "READY", originalUrl: payload.url, title: { text: payload.title }, description: { text: payload.excerpt } }]
          : undefined,
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return { ok: false, error: `LinkedIn API error ${res.status}: ${err}` };
  }
  return { ok: true };
}

// ─── Facebook Page ────────────────────────────────────────────────────────────

async function postToFacebook(payload: PostRequest): Promise<{ ok: boolean; error?: string }> {
  const token = Deno.env.get("META_ACCESS_TOKEN");
  const pageId = Deno.env.get("META_PAGE_ID");

  if (!token || !pageId) {
    return { ok: false, error: "META_ACCESS_TOKEN or META_PAGE_ID secret not set" };
  }

  const message = `${payload.title}\n\n${payload.excerpt}`;
  const params = new URLSearchParams({
    message,
    link: payload.url,
    access_token: token,
  });

  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method: "POST",
    body: params,
  });

  if (!res.ok) {
    const err = await res.text();
    return { ok: false, error: `Facebook API error ${res.status}: ${err}` };
  }
  return { ok: true };
}

// ─── Instagram ────────────────────────────────────────────────────────────────
// Instagram requires an image URL — posts without an image use a caption-only carousel.
// For link sharing, we post a caption with the URL (Instagram doesn't support clickable links in feed posts).

async function postToInstagram(payload: PostRequest): Promise<{ ok: boolean; error?: string }> {
  const token = Deno.env.get("META_ACCESS_TOKEN");
  const igAccountId = Deno.env.get("META_INSTAGRAM_ACCOUNT_ID");

  if (!token || !igAccountId) {
    return { ok: false, error: "META_ACCESS_TOKEN or META_INSTAGRAM_ACCOUNT_ID secret not set" };
  }

  if (!payload.imageUrl) {
    return { ok: false, error: "Instagram requires an image. Add a featured image to your post first." };
  }

  // Step 1: Create media container
  const containerParams = new URLSearchParams({
    image_url: payload.imageUrl,
    caption: `${payload.title}\n\n${payload.excerpt}\n\n${payload.url}`,
    access_token: token,
  });

  const containerRes = await fetch(
    `https://graph.facebook.com/v19.0/${igAccountId}/media`,
    { method: "POST", body: containerParams }
  );

  if (!containerRes.ok) {
    const err = await containerRes.text();
    return { ok: false, error: `Instagram container error ${containerRes.status}: ${err}` };
  }

  const { id: creationId } = await containerRes.json();

  // Step 2: Publish the container
  const publishParams = new URLSearchParams({
    creation_id: creationId,
    access_token: token,
  });

  const publishRes = await fetch(
    `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`,
    { method: "POST", body: publishParams }
  );

  if (!publishRes.ok) {
    const err = await publishRes.text();
    return { ok: false, error: `Instagram publish error ${publishRes.status}: ${err}` };
  }
  return { ok: true };
}

// ─── Threads ──────────────────────────────────────────────────────────────────

async function postToThreads(payload: PostRequest): Promise<{ ok: boolean; error?: string }> {
  const token = Deno.env.get("META_ACCESS_TOKEN");
  const threadsUserId = Deno.env.get("META_THREADS_USER_ID");

  if (!token || !threadsUserId) {
    return { ok: false, error: "META_ACCESS_TOKEN or META_THREADS_USER_ID secret not set" };
  }

  const text = `${payload.title}\n\n${payload.excerpt}\n\n${payload.url}`;

  // Step 1: Create Threads media container
  const containerParams: Record<string, string> = {
    media_type: payload.imageUrl ? "IMAGE" : "TEXT",
    text,
    access_token: token,
  };
  if (payload.imageUrl) {
    containerParams.image_url = payload.imageUrl;
  }

  const containerRes = await fetch(
    `https://graph.threads.net/v1.0/${threadsUserId}/threads`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(containerParams),
    }
  );

  if (!containerRes.ok) {
    const err = await containerRes.text();
    return { ok: false, error: `Threads container error ${containerRes.status}: ${err}` };
  }

  const { id: creationId } = await containerRes.json();

  // Step 2: Publish the Threads post
  const publishRes = await fetch(
    `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: creationId, access_token: token }),
    }
  );

  if (!publishRes.ok) {
    const err = await publishRes.text();
    return { ok: false, error: `Threads publish error ${publishRes.status}: ${err}` };
  }
  return { ok: true };
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: PostRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { platforms, title, excerpt, url, imageUrl } = body;

  if (!platforms?.length || !title || !url) {
    return new Response(
      JSON.stringify({ error: "platforms (array), title, and url are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const results: Record<string, { ok: boolean; error?: string }> = {};

  await Promise.all(
    platforms.map(async (platform) => {
      switch (platform) {
        case "linkedin":
          results.linkedin = await postToLinkedIn({ platforms, title, excerpt, url, imageUrl });
          break;
        case "facebook":
          results.facebook = await postToFacebook({ platforms, title, excerpt, url, imageUrl });
          break;
        case "instagram":
          results.instagram = await postToInstagram({ platforms, title, excerpt, url, imageUrl });
          break;
        case "threads":
          results.threads = await postToThreads({ platforms, title, excerpt, url, imageUrl });
          break;
        default:
          results[platform] = { ok: false, error: "Unknown platform" };
      }
    })
  );

  const allOk = Object.values(results).every((r) => r.ok);
  return new Response(JSON.stringify({ success: allOk, results }), {
    status: allOk ? 200 : 207, // 207 Multi-Status if some failed
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
