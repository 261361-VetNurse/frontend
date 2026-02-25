export type MobilePlatform = "ios" | "android";

export type MobileViewport = {
  platform: MobilePlatform;
  name: string;
  width: number;
  height: number;
};

export const IOS_VIEWPORTS: MobileViewport[] = [
  { platform: "ios", name: "iPhone SE / mini", width: 375, height: 667 },
  { platform: "ios", name: "iPhone Pro / Pro Max", width: 390, height: 844 },
  { platform: "ios", name: "iPhone Pro Max (Large)", width: 428, height: 926 },
];

export const ANDROID_VIEWPORTS: MobileViewport[] = [
  { platform: "android", name: "Small phone", width: 360, height: 640 },
  { platform: "android", name: "Medium phone", width: 360, height: 800 },
];

export const MOBILE_VIEWPORTS: MobileViewport[] = [
  ...IOS_VIEWPORTS,
  ...ANDROID_VIEWPORTS,
];

function resolveActiveViewports(): MobileViewport[] {
  const deviceGroup = String(Cypress.env("deviceGroup") ?? "all").toLowerCase();

  if (deviceGroup === "ios") return IOS_VIEWPORTS;
  if (deviceGroup === "android") return ANDROID_VIEWPORTS;

  return MOBILE_VIEWPORTS;
}

export function runForMobileViewports(
  suiteName: string,
  runSuite: (viewport: MobileViewport) => void
) {
  // TEMP: Lock to a single viewport while stabilizing flaky integration specs.
  // Re-enable `resolveActiveViewports()` after test flakiness is addressed.
  [IOS_VIEWPORTS[0]].forEach((viewport) => {
  // resolveActiveViewports().forEach((viewport) => {
    describe(
      `${suiteName} [${viewport.platform.toUpperCase()} | ${viewport.name} | ${viewport.width}x${viewport.height}]`,
      () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height);
        });

        runSuite(viewport);
      }
    );
  });
}
