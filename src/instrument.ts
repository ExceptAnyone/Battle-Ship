import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://f895b877f30a062582110b49825175b6@o4510819517923328.ingest.us.sentry.io/4510819518644224",
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // 게임 UI이므로 개인정보 마스킹 불필요
      maskAllText: false,
      blockAllMedia: false,
    }),
    // Canvas 기반 앱이므로 에러 발생 시 Canvas 화면 기록
    Sentry.replayCanvasIntegration(),
  ],

  // 성능 모니터링: 프로덕션 10% 샘플링
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

  // 세션 리플레이: 일반 1%, 에러 발생 시 100%
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  beforeSend(event) {
    if (import.meta.env.DEV) {
      console.warn("[Sentry 캡처됨]", event);
      return null;
    }
    return event;
  },
});
