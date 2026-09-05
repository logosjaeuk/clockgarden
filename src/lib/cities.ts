// Reviewed search aliases, not time-zone rules. Intl remains the source of offsets.
export const cityNames: Record<string, string[]> = {
  'Asia/Seoul': ['서울', 'Seoul', '부산', 'Busan'],
  'Asia/Tokyo': ['도쿄', 'Tokyo', '오사카', 'Osaka'],
  'America/New_York': ['뉴욕', 'New York', 'NYC'],
  'America/Los_Angeles': ['로스앤젤레스', 'Los Angeles', 'LA', '샌프란시스코', 'San Francisco'],
  'America/Chicago': ['시카고', 'Chicago'],
  'America/Toronto': ['토론토', 'Toronto'],
  'America/Vancouver': ['밴쿠버', 'Vancouver'],
  'Europe/London': ['런던', 'London'],
  'Europe/Paris': ['파리', 'Paris'],
  'Europe/Berlin': ['베를린', 'Berlin'],
  'Australia/Sydney': ['시드니', 'Sydney'],
  'Australia/Melbourne': ['멜버른', 'Melbourne'],
  'Pacific/Auckland': ['오클랜드', 'Auckland'],
  'Asia/Shanghai': ['상하이', 'Shanghai', '베이징', 'Beijing'],
  'Asia/Hong_Kong': ['홍콩', 'Hong Kong'],
  'Asia/Singapore': ['싱가포르', 'Singapore'],
  'Asia/Dubai': ['두바이', 'Dubai'],
  'Asia/Kolkata': ['뭄바이', 'Mumbai', '델리', 'Delhi', 'Kolkata'],
  'Asia/Kathmandu': ['카트만두', 'Kathmandu'],
  'Asia/Bangkok': ['방콕', 'Bangkok'],
};

export function resolveZone(value: string, zones: string[]): string | null {
  const normalized = value.trim().replaceAll('_', ' ').toLowerCase();
  if (!normalized) return null;
  const exact = zones.find((zone) => zone.replaceAll('_', ' ').toLowerCase() === normalized);
  if (exact) return exact;
  const city = zones.filter(
    (zone) => zone.split('/').at(-1)?.replaceAll('_', ' ').toLowerCase() === normalized,
  );
  if (city.length === 1) return city[0]!;
  const alias = Object.entries(cityNames).find(([, names]) =>
    names.some((name) => name.toLowerCase() === normalized),
  );
  if (alias) {
    try {
      const canonical = new Intl.DateTimeFormat('en', { timeZone: alias[0] }).resolvedOptions()
        .timeZone;
      return zones.find((zone) => zone === canonical || zone === alias[0]) ?? null;
    } catch {
      return null;
    }
  }
  // Accept valid IANA aliases such as Asia/Calcutta, including browser-local aliases.
  if (value.includes('/')) {
    try {
      return new Intl.DateTimeFormat('en', { timeZone: value.trim() }).resolvedOptions().timeZone;
    } catch {
      return null;
    }
  }
  return null;
}

export function displayZone(zone: string, korean: boolean): string {
  return korean && cityNames[zone]
    ? `${cityNames[zone]![0]} · ${zone}`
    : zone.replaceAll('_', ' ').replace('/', ' · ');
}
