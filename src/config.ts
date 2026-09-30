export const ADS_DISABLED = 'ADS_DISABLED' as const;
export const ADS_ENABLED = 'ADS_ENABLED' as const;

export type AdsState = typeof ADS_DISABLED | typeof ADS_ENABLED;

const adsState: AdsState =
  import.meta.env.PUBLIC_ADS_ENABLED === 'true' ? ADS_ENABLED : ADS_DISABLED;

/**
 * Verification metadata and ads.txt remain available during review.
 * The provider script and placements are disabled until advertising is enabled.
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
