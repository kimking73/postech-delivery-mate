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

type Variant = 'development' | 'preview' | 'production';
const variant = (process.env.APP_VARIANT ?? 'development') as Variant;

const suffix: Record<Variant, { id: string; name: string }> = {
  development: { id: '.dev', name: ' (Dev)' },
  preview: { id: '.preview', name: ' (Preview)' },
  production: { id: '', name: '' },
};

const linkDomain = process.env.EXPO_PUBLIC_LINK_DOMAIN ?? 'example.kr';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_NAME + suffix[variant].name,
  slug: 'postech-delivery-mate',
  scheme: 'deliverymate',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: BUNDLE_ID + suffix[variant].id,
    supportsTablet: false,
    associatedDomains: [`applinks:${linkDomain}`],
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
  experiments: { typedRoutes: true },
  extra: {
    appVariant: variant,
    // eas init 후 projectId가 여기에 들어간다: eas: { projectId: '...' }
  },
});
