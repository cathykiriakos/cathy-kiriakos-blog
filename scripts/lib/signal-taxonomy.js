// scripts/lib/signal-taxonomy.js
// Shared content taxonomy and classification for all news-facing scripts.
// This is the single source of truth for the blog's editorial lens:
//
//   1. Applied AI          — hands-on implementation, MCP, context engines, orchestration
//   2. Governance-as-Code  — programmatic/agentic constraints, guardrails, automated compliance
//   3. Human-Centric Design — UX for AI, cognitive load protection, human-in-the-loop
//   +  Institutional Signal — University of Chicago / Booth / Polsky / Center for Applied AI, "mecha-nudges"
//
// Used by scripts/fetch-ai-news.js (weekly signal) and
// scripts/generate-daily-digest.js (daily digest), so both surface news
// through the same pillars and sentiment model.

// ---------------------------------------------------------------------------
// Taxonomy
// ---------------------------------------------------------------------------
// Each keyword is { term, weight } or { term, weight, pattern } where pattern
// is a custom regex source (used for abbreviations and hyphen/space variants).
// Matches in the title score double weight; matches in the summary score 1x.

export const WINDOW_DAYS = 7;
export const PILLAR_MIN_SCORE = 3; // minimum per-pillar score for a pillar tag to count

export const PILLARS = [
  {
    id: 'applied_ai',
    name: 'Applied AI',
    description:
      'Hands-on implementation, Model Context Protocol (MCP), context engines, and orchestration.',
    keywords: [
      { term: 'model context protocol', weight: 6 },
      { term: 'MCP', weight: 4, pattern: '\\bMCP\\b', caseSensitive: true },
      { term: 'context engine', weight: 5, pattern: 'context[- ]engine\\w*' },
      { term: 'context engineering', weight: 5 },
      { term: 'orchestration', weight: 4 },
      { term: 'agentic', weight: 3 },
      { term: 'ai agent', weight: 3, pattern: '\\bai agents?\\b' },
      { term: 'multi-agent', weight: 3, pattern: 'multi[- ]agent' },
      { term: 'retrieval-augmented', weight: 3, pattern: 'retrieval[- ]augmented' },
      { term: 'RAG', weight: 3, pattern: '\\bRAG\\b', caseSensitive: true },
      { term: 'fine-tuning', weight: 2, pattern: 'fine[- ]?tun\\w+' },
      { term: 'prompt engineering', weight: 3 },
      { term: 'tool use', weight: 2, pattern: '\\btool[- ]use\\b' },
      { term: 'implementation', weight: 2 },
      { term: 'hands-on', weight: 2, pattern: 'hands[- ]on' },
      { term: 'in production', weight: 2 },
      { term: 'context window', weight: 2 },
      { term: 'llm application', weight: 3, pattern: 'llm(-powered)? app\\w*' },
    ],
  },
  {
    id: 'governance_as_code',
    name: 'Governance-as-Code',
    description:
      'Deploying programmatic, agentic constraints for AI at scale, guardrails, and automated compliance.',
    keywords: [
      { term: 'governance-as-code', weight: 6, pattern: 'governance[- ]as[- ]code' },
      { term: 'guardrail', weight: 5, pattern: 'guard[- ]?rails?' },
      { term: 'agentic constraint', weight: 5, pattern: 'agentic constraints?' },
      { term: 'automated compliance', weight: 5 },
      { term: 'ai governance', weight: 5 },
      { term: 'governance', weight: 3 },
      { term: 'compliance', weight: 3 },
      { term: 'responsible ai', weight: 3 },
      { term: 'ai safety', weight: 3 },
      { term: 'ai oversight', weight: 3 },
      { term: 'model risk', weight: 3 },
      { term: 'ai audit', weight: 3, pattern: 'ai audit\\w*' },
      { term: 'red-teaming', weight: 3, pattern: 'red[- ]team\\w*' },
      { term: 'ai regulation', weight: 3 },
      { term: 'eu ai act', weight: 3, pattern: '(eu )?ai act\\b' },
      { term: 'ai policy', weight: 2 },
      { term: 'alignment', weight: 2 },
    ],
  },
  {
    id: 'human_centric_design',
    name: 'Human-Centric Design',
    description:
      'UX for AI, cognitive load protection, and human-in-the-loop systems.',
    keywords: [
      { term: 'human-in-the-loop', weight: 6, pattern: 'human[- ]in[- ]the[- ]loop' },
      { term: 'cognitive load', weight: 6 },
      { term: 'human-centered', weight: 5, pattern: 'human[- ]cent(?:er|r)ed|human[- ]centric' },
      { term: 'UX', weight: 4, pattern: '\\bUX\\b', caseSensitive: true },
      { term: 'user experience', weight: 4 },
      { term: 'interaction design', weight: 4 },
      { term: 'ai interface', weight: 3, pattern: 'ai interfaces?' },
      { term: 'human oversight', weight: 3 },
      { term: 'user research', weight: 3 },
      { term: 'usability', weight: 3 },
      { term: 'design for ai', weight: 4 },
      { term: 'ai design', weight: 3 },
      { term: 'accessibility', weight: 2 },
      { term: 'user trust', weight: 3 },
      { term: 'human factors', weight: 3 },
    ],
  },
];

export const INSTITUTIONAL = {
  id: 'institutional_signal',
  name: 'Institutional Signal',
  description:
    'Tracking for University of Chicago, UChicago Booth, Center for Applied AI, Polsky Center, and keywords like "mecha-nudges".',
  keywords: [
    { term: 'university of chicago', weight: 6 },
    { term: 'uchicago booth', weight: 6 },
    { term: 'uchicago', weight: 5, pattern: '\\buchicago\\b' },
    { term: 'chicago booth', weight: 5 },
    { term: 'booth school of business', weight: 5 },
    { term: 'center for applied ai', weight: 6 },
    { term: 'polsky center', weight: 6 },
    { term: 'mecha-nudges', weight: 6, pattern: 'mecha[\\s-]?nudg\\w*' },
  ],
};

// Articles must look AI-related (or carry an institutional signal) to qualify.
const AI_CONTEXT = [
  { term: 'AI', pattern: '\\bA\\.?I\\.?\\b', caseSensitive: true },
  { term: 'artificial intelligence' },
  { term: 'machine learning' },
  { term: 'llm', pattern: '\\bllms?\\b' },
  { term: 'large language model', pattern: 'large language models?' },
  { term: 'generative', pattern: 'generative|genai' },
  { term: 'chatbot', pattern: 'chat(bot|gpt)' },
  { term: 'neural network', pattern: 'neural net\\w*' },
  { term: 'openai' },
  { term: 'anthropic' },
  { term: 'deepmind' },
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function compileKeywords(keywords) {
  return keywords.map(k => ({
    ...k,
    regex: new RegExp(
      k.pattern || `\\b${escapeRegex(k.term)}\\b`,
      k.caseSensitive ? '' : 'i'
    ),
  }));
}

const COMPILED_PILLARS = PILLARS.map(p => ({ ...p, keywords: compileKeywords(p.keywords) }));
const COMPILED_INSTITUTIONAL = { ...INSTITUTIONAL, keywords: compileKeywords(INSTITUTIONAL.keywords) };
const COMPILED_AI_CONTEXT = compileKeywords(AI_CONTEXT);

// ---------------------------------------------------------------------------
// Classification & scoring
// ---------------------------------------------------------------------------

function scoreKeywords(keywords, title, summary) {
  let score = 0;
  const matched = [];
  for (const k of keywords) {
    const inTitle = k.regex.test(title);
    const inSummary = !inTitle && k.regex.test(summary);
    if (inTitle) score += k.weight * 2;
    else if (inSummary) score += k.weight;
    if (inTitle || inSummary) matched.push(k.term);
  }
  return { score, matched };
}

function recencyBonus(publishedDate) {
  const ageDays = (Date.now() - new Date(publishedDate).getTime()) / 86400000;
  if (Number.isNaN(ageDays)) return 0;
  if (ageDays <= 1) return 3;
  if (ageDays <= 3) return 2;
  if (ageDays <= WINDOW_DAYS) return 1;
  return 0;
}

// Returns an enriched article, or null if it doesn't qualify for the signal.
export function classifyArticle(article) {
  const title = article.title || '';
  const summary = article.summary || '';
  const isAiRelated = COMPILED_AI_CONTEXT.some(
    k => k.regex.test(title) || k.regex.test(summary)
  );

  const pillarResults = COMPILED_PILLARS.map(p => ({
    id: p.id,
    ...scoreKeywords(p.keywords, title, summary),
  }));
  const institutional = scoreKeywords(COMPILED_INSTITUTIONAL.keywords, title, summary);

  const qualifyingPillars = pillarResults.filter(r => r.score >= PILLAR_MIN_SCORE);
  const hasInstitutionalSignal = institutional.matched.length > 0;

  // Must hit at least one pillar or the institutional filter, and must be
  // AI-related unless it's an institutional item.
  if (qualifyingPillars.length === 0 && !hasInstitutionalSignal) return null;
  if (!isAiRelated && !hasInstitutionalSignal) return null;

  const pillarScore = qualifyingPillars.reduce((sum, r) => sum + r.score, 0);
  const relevanceScore = pillarScore + institutional.score + recencyBonus(article.published_date);

  const ranked = [...qualifyingPillars].sort((a, b) => b.score - a.score);
  const primaryPillar =
    ranked.length > 0
      ? ranked[0].id
      : COMPILED_INSTITUTIONAL.id;

  return {
    ...article,
    pillars: qualifyingPillars.map(r => r.id),
    primary_pillar: primaryPillar,
    institutional_signal: hasInstitutionalSignal,
    matched_keywords: [
      ...new Set([...qualifyingPillars.flatMap(r => r.matched), ...institutional.matched]),
    ],
    relevance_score: relevanceScore,
  };
}

// Simple sentiment analysis based on keywords (used for the news_items table,
// the weekly signal, and the daily digest).
export function analyzeSentiment(text) {
  const positiveWords = [
    'breakthrough', 'innovation', 'success', 'growth', 'advance', 'improved',
    'efficient', 'powerful', 'revolutionary', 'leading', 'milestone', 'achievement',
    'soaring', 'surge', 'gain', 'boost', 'optimistic', 'promising',
  ];

  const negativeWords = [
    'concern', 'risk', 'threat', 'decline', 'fail', 'loss', 'criticism',
    'controversy', 'challenge', 'problem', 'bubble', 'crash', 'collapse',
    'warning', 'danger', 'falling', 'plunge', 'worry', 'fear',
  ];

  // Leading word boundary keeps stem matches (gain → gains) while avoiding
  // mid-word false positives (gain in "against", loss in "blossom").
  const lowerText = String(text || '').toLowerCase();
  const hits = words =>
    words.filter(w => new RegExp(`\\b${w}`).test(lowerText)).length;
  const positiveCount = hits(positiveWords);
  const negativeCount = hits(negativeWords);

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}
