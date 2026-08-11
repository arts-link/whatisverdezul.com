#!/usr/bin/env node
/**
 * Rebuilds the "Verdèzul — Site Performance" PostHog dashboard.
 *
 * The dashboard already exists (project 517301, dashboard 1983853) — this script
 * is the reproducible definition of it. The TILES below mirror the live tiles
 * exactly, so re-running updates them in place rather than duplicating or
 * silently changing them. Edit TILES and re-run instead of hand-editing insights
 * in the PostHog UI, or the two drift.
 *
 * Tile rationale lives in docs/ai/engineering/posthog-dashboard.md.
 *
 *   POSTHOG_API_KEY=phx_...  personal API key, scopes insight:write + dashboard:write
 *   POSTHOG_PROJECT_ID=517301
 *   POSTHOG_HOST=...         defaults to https://us.posthog.com
 *
 *   node scripts/posthog-dashboard.mjs --dry-run   # print payloads, call nothing
 *   node scripts/posthog-dashboard.mjs
 */

const DASHBOARD_NAME = 'Verdèzul — Site Performance';
const DASHBOARD_DESCRIPTION =
  'Site performance ordered by the priority list in docs/ai/strategy/site-goals.md: ' +
  'booking, fan growth, music discovery, shows and merch, traffic context, press. ' +
  'Spec: docs/ai/engineering/posthog-dashboard.md';

const DATE_FROM = '-90d';
const dryRun = process.argv.includes('--dry-run');

const { POSTHOG_API_KEY, POSTHOG_PROJECT_ID } = process.env;
const POSTHOG_HOST = (process.env.POSTHOG_HOST || 'https://us.posthog.com').replace(/\/+$/, '');

// --- query builders -------------------------------------------------------

const event = (name, opts = {}) => ({
  kind: 'EventsNode',
  event: name,
  name: opts.label || name,
  ...(opts.math ? { math: opts.math } : {}),
  ...(opts.properties ? { properties: opts.properties } : {}),
});

const urlContains = (fragment) => [
  { key: '$current_url', operator: 'icontains', value: fragment, type: 'event' },
];

const trend = (series, opts = {}) => ({
  kind: 'InsightVizNode',
  source: {
    kind: 'TrendsQuery',
    series,
    interval: 'week',
    dateRange: { date_from: DATE_FROM },
    trendsFilter: {
      display: opts.display || 'ActionsLineGraph',
      ...(opts.legend ? { showLegend: true } : {}),
    },
    ...(opts.breakdown
      ? { breakdownFilter: { breakdown: opts.breakdown, breakdown_type: 'event' } }
      : {}),
  },
});

const funnel = (series) => ({
  kind: 'InsightVizNode',
  source: {
    kind: 'FunnelsQuery',
    series,
    dateRange: { date_from: DATE_FROM },
    funnelsFilter: { funnelWindowInterval: 1, funnelWindowIntervalUnit: 'day' },
  },
});

// HogQL tiles repeat their aggregate expressions rather than referencing the
// SELECT aliases — that is what the live tiles do and it avoids alias-resolution
// differences between HogQL and plain ClickHouse.
const hogql = (query) => ({
  kind: 'DataVisualizationNode',
  display: 'ActionsTable',
  source: { kind: 'HogQLQuery', query },
});

// --- tiles ----------------------------------------------------------------

const TILES = [
  // 1. Booking
  {
    name: 'Booking inquiries',
    description: 'contact_form_submit — the primary goal signal from site-goals.md.',
    query: trend([event('contact_form_submit', { math: 'total' })]),
  },
  {
    name: 'Booking funnel',
    description:
      "Separates 'nobody reaches contact' from 'people reach contact and do not submit'. " +
      'The tile that answers whether the site is actually producing bookings.',
    query: funnel([
      event('$pageview', { label: 'Any page' }),
      event('$pageview', { label: 'Contact page', properties: urlContains('/contact/') }),
      event('contact_form_submit', { label: 'Submitted' }),
    ]),
  },
  {
    name: 'Contact page reach',
    description: 'Unique visitors landing on /contact/. Context for the booking funnel.',
    query: trend([
      event('$pageview', {
        label: 'Contact page visitors',
        math: 'dau',
        properties: urlContains('/contact/'),
      }),
    ]),
  },
  {
    name: 'Booking conversion rate',
    description: 'Weekly contact form submits over unique contact-page visitors, as a percentage.',
    query: hogql(`SELECT
  toStartOfWeek(timestamp) AS week,
  countIf(event = 'contact_form_submit') AS submits,
  uniqIf(person_id, event = '$pageview' AND properties.$current_url LIKE '%/contact/%') AS contact_visitors,
  round(countIf(event = 'contact_form_submit') / nullif(uniqIf(person_id, event = '$pageview' AND properties.$current_url LIKE '%/contact/%'), 0) * 100, 1) AS conversion_pct
FROM events
WHERE timestamp >= now() - INTERVAL 90 DAY
  AND event IN ('contact_form_submit', '$pageview')
GROUP BY week
ORDER BY week`),
  },

  // 2. Fan growth
  {
    name: 'Email signups',
    description: 'email_signup_success — only fires when Formspree returns a 200.',
    query: trend([event('email_signup_success', { math: 'total' })]),
  },
  {
    name: 'Signup health',
    description:
      'Diagnostic, not a vanity metric: submit fires on click, success only on a Formspree 200. ' +
      'A widening gap between the two lines means Formspree is failing silently.',
    query: trend(
      [
        event('email_signup_submit', { label: 'Submitted', math: 'total' }),
        event('email_signup_success', { label: 'Succeeded', math: 'total' }),
      ],
      { legend: true },
    ),
  },
  {
    name: 'Signup drop-off',
    description:
      "Weekly count of email signups that never returned a Formspree 200. Non-zero 'failed' " +
      'means signups are being lost.',
    query: hogql(`SELECT
  toStartOfWeek(timestamp) AS week,
  countIf(event = 'email_signup_submit') AS submitted,
  countIf(event = 'email_signup_success') AS succeeded,
  countIf(event = 'email_signup_submit') - countIf(event = 'email_signup_success') AS failed
FROM events
WHERE timestamp >= now() - INTERVAL 90 DAY
  AND event IN ('email_signup_submit', 'email_signup_success')
GROUP BY week
ORDER BY week`),
  },
  {
    name: 'Social follows by platform',
    description: 'social_follow_click broken out by destination platform.',
    query: trend([event('social_follow_click', { math: 'total' })], {
      breakdown: 'platform',
      display: 'ActionsBar',
      legend: true,
    }),
  },

  // 3. Music discovery
  {
    name: 'Play clicks',
    description: 'Spotify and YouTube outbound play intent — the music discovery signal.',
    query: trend(
      [
        event('spotify_play_click', { label: 'Spotify', math: 'total' }),
        event('youtube_play_click', { label: 'YouTube', math: 'total' }),
      ],
      { legend: true },
    ),
  },
  {
    name: 'Top releases',
    description: 'spotify_play_click by release title.',
    query: trend([event('spotify_play_click', { math: 'total' })], {
      breakdown: 'release_title',
      display: 'ActionsBar',
      legend: true,
    }),
  },
  {
    name: 'Top videos',
    description: 'youtube_play_click by video title.',
    query: trend([event('youtube_play_click', { math: 'total' })], {
      breakdown: 'video_title',
      display: 'ActionsBar',
      legend: true,
    }),
  },

  // 4. Shows and merch
  {
    name: 'Ticket clicks by show',
    description: 'ticket_link_click by venue — which shows drive ticket interest.',
    query: trend([event('ticket_link_click', { math: 'total' })], {
      breakdown: 'venue',
      display: 'ActionsBar',
      legend: true,
    }),
  },
  {
    name: 'Merch clicks by item',
    description:
      'Outbound proxy — counts intent to check out, not completed PayPal purchases. ' +
      'Reads zero until data/merch.json has items with a checkout_url.',
    query: trend([event('merch_click', { math: 'total' })], {
      breakdown: 'item_name',
      display: 'ActionsBar',
      legend: true,
    }),
  },

  // 5. Traffic context
  {
    name: 'Unique visitors',
    description:
      'Context for every conversion tile — a flat booking line means very different things ' +
      'at 50 vs 5000 visitors a week.',
    query: trend([event('$pageview', { label: 'Unique visitors', math: 'dau' })]),
  },
  {
    name: 'Top pages',
    description: 'Unique visitors by URL.',
    query: trend([event('$pageview', { label: 'Visitors', math: 'dau' })], {
      breakdown: '$current_url',
      display: 'ActionsTable',
    }),
  },
  {
    name: 'Top referrers',
    description: 'Where visitors arrive from.',
    query: trend([event('$pageview', { label: 'Visitors', math: 'dau' })], {
      breakdown: '$referring_domain',
      display: 'ActionsTable',
    }),
  },

  // 6. Press
  {
    name: 'Press link clicks',
    description:
      'Reads zero until data/press.json.items is non-empty and the press nav un-hides. ' +
      'Built now so it is already collecting when press lands.',
    query: trend([event('press_link_click', { math: 'total' })], {
      breakdown: 'source',
      display: 'ActionsBar',
      legend: true,
    }),
  },
];

// --- api ------------------------------------------------------------------

async function api(path, { method = 'GET', body } = {}) {
  const url = `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${POSTHOG_API_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status} ${res.statusText}\n${text}`);
  }
  return text ? JSON.parse(text) : null;
}

async function findDashboard() {
  const { results } = await api('/dashboards/?limit=500');
  return results.find((d) => d.name === DASHBOARD_NAME && !d.deleted) || null;
}

async function existingInsightsFor(dashboardId) {
  const dashboard = await api(`/dashboards/${dashboardId}/`);
  const byName = new Map();
  for (const tile of dashboard.tiles || []) {
    if (tile.insight && !tile.insight.deleted) byName.set(tile.insight.name, tile.insight.id);
  }
  return byName;
}

async function main() {
  if (dryRun) {
    console.log(`Dashboard: ${DASHBOARD_NAME}`);
    console.log(`Host:      ${POSTHOG_HOST}`);
    console.log(`Tiles:     ${TILES.length}\n`);
    for (const tile of TILES) {
      console.log(`── ${tile.name}`);
      console.log(JSON.stringify(tile.query, null, 2));
      console.log();
    }
    console.log('Dry run — nothing was sent to PostHog.');
    return;
  }

  const missing = ['POSTHOG_API_KEY', 'POSTHOG_PROJECT_ID'].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing required env: ${missing.join(', ')}`);
    console.error('Run with --dry-run to inspect the payloads without credentials.');
    process.exit(1);
  }

  let dashboard = await findDashboard();
  if (dashboard) {
    console.log(`Reusing dashboard "${DASHBOARD_NAME}" (id ${dashboard.id})`);
  } else {
    dashboard = await api('/dashboards/', {
      method: 'POST',
      body: { name: DASHBOARD_NAME, description: DASHBOARD_DESCRIPTION, pinned: true },
    });
    console.log(`Created dashboard "${DASHBOARD_NAME}" (id ${dashboard.id})`);
  }

  const existing = await existingInsightsFor(dashboard.id);
  let created = 0;
  let updated = 0;

  for (const tile of TILES) {
    const payload = {
      name: tile.name,
      description: tile.description,
      query: tile.query,
      dashboards: [dashboard.id],
    };

    const existingId = existing.get(tile.name);
    if (existingId) {
      await api(`/insights/${existingId}/`, { method: 'PATCH', body: payload });
      updated += 1;
      console.log(`  updated  ${tile.name}`);
    } else {
      await api('/insights/', { method: 'POST', body: payload });
      created += 1;
      console.log(`  created  ${tile.name}`);
    }
  }

  console.log(`\n${created} created, ${updated} updated.`);
  console.log(`${POSTHOG_HOST}/project/${POSTHOG_PROJECT_ID}/dashboard/${dashboard.id}`);
}

main().catch((err) => {
  console.error(`\n${err.message}`);
  process.exit(1);
});
