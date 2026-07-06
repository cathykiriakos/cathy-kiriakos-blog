// scripts/generate-weekly-post.js
// Reads data/weekly_signal.json (produced by scripts/fetch-ai-news.js) and
// generates a weekly summary blog post as a markdown file with YAML front
// matter under content/weekly-summaries/.
//
// Post layout:
//   1. "Institutional Highlights" — items flagged institutional_signal
//      (UChicago / Booth / Polsky / Center for Applied AI) at the top.
//   2. A markdown table grouping the remaining items into the three content
//      pillars (Applied AI, Governance-as-Code, Human-Centric Design).
//   3. Front matter tagged with the pillars present, for site navigation.
//
// Env:
//   WEEKLY_SIGNAL_PATH   — input signal file (default: data/weekly_signal.json)
//   WEEKLY_POSTS_DIR     — output directory (default: content/weekly-summaries)
//   POST_DATE            — YYYY-MM-DD override of "today" for deterministic
//                          testing (default: current execution time, local TZ)

import fs from 'node:fs';
import path from 'node:path';

const SIGNAL_PATH = process.env.WEEKLY_SIGNAL_PATH || 'data/weekly_signal.json';
const OUTPUT_DIR = process.env.WEEKLY_POSTS_DIR || 'content/weekly-summaries';

// ---------------------------------------------------------------------------
// Date handling
// ---------------------------------------------------------------------------
// All date fields are derived from the execution time in the local timezone.
// (Avoid toISOString() for calendar dates: it converts to UTC and can shift
// the date by a day for evening runs in non-UTC timezones.)

function resolvePostDate() {
  const override = process.env.POST_DATE;
  if (!override) return new Date();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(override)) {
    console.error(`Invalid POST_DATE "${override}" — expected YYYY-MM-DD`);
    process.exit(1);
  }
  // Anchor to local noon so the calendar date is stable in every timezone
  const date = new Date(`${override}T12:00:00`);
  // Round-trip check catches rollover dates like 2026-02-30 → March 2
  if (Number.isNaN(date.getTime()) || isoDate(date) !== override) {
    console.error(`Invalid POST_DATE "${override}" — not a real date`);
    process.exit(1);
  }
  return date;
}

const pad = n => String(n).padStart(2, '0');
const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const longDate = d =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// ---------------------------------------------------------------------------
// Markdown helpers
// ---------------------------------------------------------------------------

// Table cells cannot contain pipes or newlines
function tableCell(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

function yamlString(text) {
  return `"${String(text || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function articleLink(item) {
  const title = tableCell(item.title) || 'Untitled';
  return item.url ? `[${title}](${item.url})` : title;
}

// ---------------------------------------------------------------------------
// Post assembly
// ---------------------------------------------------------------------------

function renderInstitutionalHighlights(items) {
  const lines = ['## 🏛️ Institutional Highlights', ''];

  if (items.length === 0) {
    lines.push(
      '_No University of Chicago / Booth developments surfaced in the signal this week._',
      ''
    );
    return lines;
  }

  lines.push(
    'Developments this week from the University of Chicago, Booth, the Polsky',
    'Center, and the Center for Applied AI:',
    ''
  );

  for (const item of items) {
    lines.push(`### ${articleLink(item)}`);
    lines.push('');
    const published = item.published_date ? ` · ${item.published_date}` : '';
    lines.push(`**${item.source || 'Unknown source'}**${published}`);
    lines.push('');
    if (item.summary) {
      lines.push(`> ${item.summary.replace(/\s+/g, ' ').trim()}`);
      lines.push('');
    }
  }

  return lines;
}

function renderPillarTable(pillars, itemsByPillar) {
  const lines = ['## 📡 This Week Across the Pillars', ''];

  const populated = pillars.filter(p => (itemsByPillar.get(p.id) || []).length > 0);
  if (populated.length === 0) {
    lines.push('_No pillar-classified news items this week._', '');
    return lines;
  }

  lines.push('| Pillar | Headline | Source | Published |');
  lines.push('|--------|----------|--------|-----------|');

  for (const pillar of populated) {
    const items = itemsByPillar.get(pillar.id);
    items.forEach((item, i) => {
      // Show the pillar name only on the first row of each group
      const pillarCell = i === 0 ? `**${tableCell(pillar.name)}**` : '';
      lines.push(
        `| ${pillarCell} | ${articleLink(item)} | ${tableCell(item.source)} | ${tableCell(item.published_date)} |`
      );
    });
  }

  lines.push('');
  return lines;
}

function buildPost(signal, postDate) {
  const items = signal.items || [];
  const pillars = signal.pillars || [];
  const windowDays = signal.window_days || 7;

  const weekStart = new Date(postDate.getTime() - windowDays * 86400000);
  const dateSlug = isoDate(postDate);
  const title = `Weekly AI Signal — Week of ${longDate(weekStart)}`;

  // Institutional items lead the post; everything else goes into the pillar
  // table under its primary pillar (so multi-pillar items appear once).
  const institutionalItems = items.filter(i => i.institutional_signal);
  const pillarItems = items.filter(i => !i.institutional_signal);

  const itemsByPillar = new Map(pillars.map(p => [p.id, []]));
  for (const item of pillarItems) {
    const bucket =
      itemsByPillar.get(item.primary_pillar) ||
      itemsByPillar.get(item.pillars?.[0]);
    if (bucket) bucket.push(item);
  }
  for (const bucket of itemsByPillar.values()) {
    bucket.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
  }

  const tags = pillars
    .filter(p => (itemsByPillar.get(p.id) || []).length > 0)
    .map(p => p.name);
  if (institutionalItems.length > 0) tags.push('Institutional Signal');

  const frontMatter = [
    '---',
    `title: ${yamlString(title)}`,
    `date: ${dateSlug}`,
    `slug: weekly-ai-signal-${dateSlug}`,
    `description: ${yamlString(
      `Automated weekly roundup of AI news across Applied AI, Governance-as-Code, and Human-Centric Design, with UChicago institutional highlights. Covering ${longDate(weekStart)} – ${longDate(postDate)}.`
    )}`,
    'author: "AI Signal Bot"',
    'category: "weekly-signal"',
    'tags:',
    ...tags.map(t => `  - ${yamlString(t)}`),
    'draft: true',
    '---',
    '',
  ];

  const body = [
    `_Covering ${longDate(weekStart)} through ${longDate(postDate)} · ${items.length} signal items_`,
    '',
    ...renderInstitutionalHighlights(institutionalItems),
    ...renderPillarTable(pillars, itemsByPillar),
    '---',
    '',
    `_Generated automatically from \`weekly_signal.json\` (signal captured ${signal.generated_at || 'unknown'})._`,
    '',
  ];

  return { filename: `weekly-summary-${dateSlug}.md`, content: [...frontMatter, ...body].join('\n') };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  if (!fs.existsSync(SIGNAL_PATH)) {
    console.error(`Signal file not found: ${SIGNAL_PATH}`);
    console.error('Run `node scripts/fetch-ai-news.js` first, or point WEEKLY_SIGNAL_PATH at an existing file.');
    process.exit(1);
  }

  let signal;
  try {
    signal = JSON.parse(fs.readFileSync(SIGNAL_PATH, 'utf8'));
  } catch (error) {
    console.error(`Failed to parse ${SIGNAL_PATH}: ${error.message}`);
    process.exit(1);
  }

  if (!Array.isArray(signal.items)) {
    console.error(`Unexpected signal format in ${SIGNAL_PATH}: missing "items" array`);
    process.exit(1);
  }

  const postDate = resolvePostDate();
  const { filename, content } = buildPost(signal, postDate);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outputPath, content);

  const institutionalCount = signal.items.filter(i => i.institutional_signal).length;
  console.log(`✅ Weekly summary post generated: ${outputPath}`);
  console.log(`   ${signal.items.length} items (${institutionalCount} institutional highlights)`);
}

main();
