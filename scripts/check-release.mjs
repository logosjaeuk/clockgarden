const value = process.env.PUBLIC_SITE_URL;
let url;
try {
  url = new URL(value);
} catch {
  /* Report configuration, not a guessed domain. */
}
if (
  !url ||
  url.protocol !== 'https:' ||
  url.pathname !== '/' ||
  url.search ||
  url.hash ||
  url.username ||
  url.password ||
  /(^localhost$|^127\.|\.example$|\.localhost$)/.test(url.hostname)
) {
  console.error(
    'Release blocked: set PUBLIC_SITE_URL to the final HTTPS origin (no path, query or placeholder).',
  );
  process.exit(1);
}
if (process.env.PUBLIC_ADS_ENABLED === 'true') {
  console.error(
    'Release blocked: advertising is not integrated or approved. Keep PUBLIC_ADS_ENABLED=false.',
  );
  process.exit(1);
}
if (process.env.PUBLIC_ANALYTICS_ENDPOINT) {
  console.error(
    'Release blocked: review the privacy notice and consent requirements before enabling analytics.',
  );
  process.exit(1);
}
console.log(`Release origin verified: ${url.origin}`);
