import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CapacitorConfig } from "@capacitor/cli";

/**
 * The app is a native shell around the live storefront, so the site, the
 * app and the owner panel share one database, one login and one order list.
 * Nothing secret belongs in this file: it ships inside the app binary.
 *
 * Point a test build at a Vercel Preview deployment with:
 *   CHOCO_APP_URL=https://<preview>.vercel.app npx cap sync
 */
const APP_URL = (process.env.CHOCO_APP_URL || "https://thechocobananaclub.com").replace(/\/$/, "");
const APP_HOST = new URL(APP_URL).host;

// Android crashes if push registration runs without Firebase configured, so the
// site only offers notifications on Android once google-services.json exists.
const androidHasFirebase = existsSync(join(__dirname, "android", "app", "google-services.json"));

// iOS: offer notifications only after Xcode → Signing & Capabilities → + Push Notifications
// has created App.entitlements (and the APNs key is set on the server).
const iosEntitlements = join(__dirname, "ios", "App", "App", "App.entitlements");
const iosHasPush =
  existsSync(iosEntitlements) && readFileSync(iosEntitlements, "utf8").includes("aps-environment");

const UA = "ChocobananaApp/1.0";

const config = {
  appId: "com.thechocobananaclub.app",
  appName: "Chocobanana",
  webDir: "www",
  backgroundColor: "#fff4cc",
  server: {
    url: APP_URL,
    cleartext: APP_URL.startsWith("http://"),
    // Shown by the native layer when the site cannot be reached (offline, DNS, 5xx on launch).
    errorPath: "offline.html",
    // Hosts that stay inside the app. Everything else (Instagram, mail links…) opens in the system browser.
    allowNavigation: [
      APP_HOST,
      "thechocobananaclub.com",
      "www.thechocobananaclub.com",
      "checkout.stripe.com",
      "billing.stripe.com",
      "*.stripe.com",
    ],
  },
  ios: {
    appendUserAgent: `${UA}${iosHasPush ? " Push/1" : ""}`,
    contentInset: "never",
    backgroundColor: "#fff4cc",
    scrollEnabled: true,
  },
  android: {
    appendUserAgent: `${UA}${androidHasFirebase ? " Push/1" : ""}`,
    backgroundColor: "#fff4cc",
    allowMixedContent: false,
    adjustMarginsForEdgeToEdge: "auto",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#fff4cc",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      // Dark text on the cream header.
      style: "LIGHT",
      backgroundColor: "#fffbee",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "native",
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
} as CapacitorConfig;

export default config;
