export const ADS_DISABLED = 'ADS_DISABLED' as const;
export const ADS_ENABLED = 'ADS_ENABLED' as const;

export type AdsState = typeof ADS_DISABLED | typeof ADS_ENABLED;

const adsState: AdsState =
  import.meta.env.PUBLIC_ADS_ENABLED === 'true' ? ADS_ENABLED : ADS_DISABLED;

/**
 * Advertising has a single, explicit control plane. No provider script, publisher ID,
 * or creative is bundled; the enabled state only exposes the reviewed integration region.
 */
export const adsConfig = {
  state: adsState,
  placements: {
    toolContentFooter: adsState === ADS_ENABLED,
  },
} as const;

export const siteConfig = {
  name: 'Clock Garden',
  shortName: 'Clock Garden',
  description: 'Fast, private clocks and time tools that run in your browser.',
  analyticsEndpoint: import.meta.env.PUBLIC_ANALYTICS_ENDPOINT || '',
  searchConsoleVerification: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION || '',
} as const;

export const supportedLocales = ['en', 'ko'] as const;
export type Locale = (typeof supportedLocales)[number];
