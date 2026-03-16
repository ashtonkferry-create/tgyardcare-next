import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://f9ff2b1a3a0d3f402bb62bfe830c9254@o4511051920572416.ingest.us.sentry.io/4511051964022784",
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
  ],
});
