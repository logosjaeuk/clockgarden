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
  description: '직장인과 프리랜서를 위한 스마트 워크 & 생산성 실무 가이드. 엑셀, 스프레드시트, 노션, 실무 서식 및 자동화 워크플로우를 다룹니다.',
  analyticsEndpoint: import.meta.env.PUBLIC_ANALYTICS_ENDPOINT || '',
  searchConsoleVerification: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION || '',
} as const;

export const supportedLocales = ['ko', 'en'] as const;
export type Locale = (typeof supportedLocales)[number];
