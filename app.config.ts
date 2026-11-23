import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * 앱 설정. 환경(APP_VARIANT)마다 이름과 번들 ID를 나눠 세 앱을 한 휴대폰에 같이 깔 수 있게 한다.
 * - development: dev client (local Supabase)
 * - preview: 내부 배포·TestFlight (staging Supabase)
 * - production: 스토어 (production Supabase)
 * 환경변수는 아키텍처 §11. 공개 값만 EXPO_PUBLIC_*로 넣는다.
 */
const APP_NAME = 'APP_NAME'; // 임시 앱 이름
const BUNDLE_ID = 'kr.postech.deliverymate';

const VARIANTS = ['development', 'preview', 'production'] as const;
type Variant = (typeof VARIANTS)[number];

const rawVariant = process.env.APP_VARIANT ?? 'development';
if (!(VARIANTS as readonly string[]).includes(rawVariant)) {
  throw new Error(
    `APP_VARIANT는 ${VARIANTS.join(' | ')} 중 하나여야 한다. 현재 값: "${rawVariant}"`,
  );
}
const variant = rawVariant as Variant;

const suffix: Record<Variant, { id: string; name: string }> = {
  development: { id: '.dev', name: ' (Dev)' },
  preview: { id: '.preview', name: ' (Preview)' },
  production: { id: '', name: '' },
};

const linkDomain = process.env.EXPO_PUBLIC_LINK_DOMAIN ?? 'example.kr';

/**
 * 무료 Apple 계정(Personal Team)으로 로컬 빌드(`npx expo run:ios --device`)할 때:
 * - 번들 ID는 Apple 전체에서 한 팀만 쓸 수 있으므로 사람마다 DEV_BUNDLE_SUFFIX로 구분한다(.env.local).
 * - Personal Team은 Associated Domains를 못 쓰므로 development에서는 넣지 않는다. 딥링크는 preview에서 확인한다.
 */
const devSuffix = variant === 'development' ? process.env.DEV_BUNDLE_SUFFIX?.trim() : undefined;
const iosBundleId = BUNDLE_ID + suffix[variant].id + (devSuffix ? `.${devSuffix}` : '');

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_NAME + suffix[variant].name,
  owner: 'kimking075s-team',
  slug: 'postech-delivery-mate',
  scheme: 'deliverymate',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: iosBundleId,
    supportsTablet: false,
    ...(variant === 'development' ? {} : { associatedDomains: [`applinks:${linkDomain}`] }),
    infoPlist: { ITSAppUsesNonExemptEncryption: false },
  },
  android: {
    package: BUNDLE_ID + suffix[variant].id,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: { favicon: './assets/favicon.png', bundler: 'metro' },
  plugins: [
    'expo-router',
    'expo-status-bar',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
  ],
  // EAS Update (아키텍처 §11: main 머지 시 preview 채널로 배포)
  updates: { url: 'https://u.expo.dev/41e4212f-7272-4097-b3ec-9dafb895f042' },
  // 네이티브 구성이 바뀌면 런타임 버전도 바뀌어, 맞지 않는 JS 업데이트가 내려가지 않는다.
  runtimeVersion: { policy: 'fingerprint' },
  experiments: { typedRoutes: true },
  extra: {
    appVariant: variant,
    eas: { projectId: '41e4212f-7272-4097-b3ec-9dafb895f042' },
  },
});
