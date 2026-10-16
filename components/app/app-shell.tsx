"use client";

import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { addPluginListener } from "@/lib/native/bridge";
import {
  checkPushPermission,
  forgetPushRegistration,
  hasStoredPushToken,
  syncPushRegistration,
} from "@/lib/native/push-client";

type AppShellProps = {
  locale: string;
  signedIn: boolean;
  pushCapable: boolean;
  labels: { offline: string; backOnline: string; loading: string };
  children: ReactNode;
};

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function isInternalNavigation(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const anchor = (event.target as Element | null)?.closest?.("a");
  if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return null;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return null;
  }
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    const samePage =
      url.pathname === window.location.pathname && url.search === window.location.search;
    return samePage ? null : url.pathname;
  } catch {
    return null;
  }
}

/**
 * App-only behaviour around every storefront page: page transitions, a
 * navigation progress bar, the offline banner, keyboard awareness and push
 * plumbing. Rendered only for the native shell, so the website is unchanged.
 */
export function AppShell({ locale, signedIn, pushCapable, labels, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  // Path we were on when a navigation started; the bar hides once the path changes.
  const [navFrom, setNavFrom] = useState<string | null>(null);
  const navigating = navFrom !== null && navFrom === pathname;
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine !== false,
    () => true,
  );
  const [showBackOnline, setShowBackOnline] = useState(false);
  // Portal target exists only after hydration; overlays render outside the page's stacking context.
  const portalTarget = useSyncExternalStore(
    () => () => {},
    () => document.body,
    () => null,
  );
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mark the document so app-only CSS (safe areas, tab bar spacing) applies.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.tabs = "1";
    return () => {
      delete root.dataset.tabs;
    };
  }, []);

  // Progress bar: start on internal link taps and form submits, stop when the route changes.
  useEffect(() => {
    const start = () => {
      setNavFrom(window.location.pathname);
      if (navTimer.current) clearTimeout(navTimer.current);
      navTimer.current = setTimeout(() => setNavFrom(null), 12000);
    };
    const onClick = (event: MouseEvent) => {
      if (isInternalNavigation(event)) start();
    };
    const onSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      if (form && !event.defaultPrevented && form.method.toLowerCase() !== "dialog") start();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
      if (navTimer.current) clearTimeout(navTimer.current);
    };
  }, []);

  // Connectivity: brief "back online" note, then refresh data that may be stale.
  useEffect(() => {
    let backTimer: ReturnType<typeof setTimeout> | null = null;
    const goOffline = () => setShowBackOnline(false);
    const goOnline = () => {
      setShowBackOnline(true);
      if (backTimer) clearTimeout(backTimer);
      backTimer = setTimeout(() => setShowBackOnline(false), 2500);
      router.refresh();
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      if (backTimer) clearTimeout(backTimer);
    };
  }, [router]);

  // Keyboard: hide the tab bar while typing so it never covers inputs.
  useEffect(() => {
    const root = document.documentElement;
    let baseline = window.innerHeight;
    const setOpen = (open: boolean) => root.classList.toggle("keyboard-open", open);
    const onResize = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      if (height > baseline) baseline = height;
      setOpen(baseline - height > 140);
    };
    const onFocusIn = (event: FocusEvent) => {
      const el = event.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) {
        setTimeout(() => el.scrollIntoView({ block: "center", behavior: "smooth" }), 300);
      }
    };
    window.visualViewport?.addEventListener("resize", onResize);
    window.addEventListener("resize", onResize);
    document.addEventListener("focusin", onFocusIn);
    const unsubs: Array<() => void> = [];
    void addPluginListener("Keyboard", "keyboardWillShow", () => setOpen(true)).then((u) => unsubs.push(u));
    void addPluginListener("Keyboard", "keyboardWillHide", () => setOpen(false)).then((u) => unsubs.push(u));
    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("focusin", onFocusIn);
      unsubs.forEach((u) => u());
      setOpen(false);
    };
  }, []);

  // Notification taps open the page the notification points at (same site only).
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;
    void addPluginListener("PushNotifications", "pushNotificationActionPerformed", (event) => {
      const data = (event as { notification?: { data?: Record<string, unknown> } })?.notification?.data;
      const url = typeof data?.url === "string" ? data.url : null;
      if (url && url.startsWith("/") && !url.startsWith("//")) router.push(url);
    }).then((u) => {
      if (cancelled) u();
      else unsubscribe = u;
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [router]);

  // Keep the device token attached to the signed-in member; detach it after sign-out.
  useEffect(() => {
    if (!pushCapable) return;
    let cancelled = false;
    void (async () => {
      if (!signedIn) {
        if (hasStoredPushToken()) await forgetPushRegistration().catch(() => {});
        return;
      }
      const permission = await checkPushPermission();
      if (!cancelled && permission === "granted") {
        await syncPushRegistration(locale).catch(() => {});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn, pushCapable, locale]);

  const overlays = (
    <>
      <div
        className={`app-progress ${navigating ? "is-active" : ""}`}
        role="progressbar"
        aria-label={labels.loading}
        aria-hidden={!navigating}
      />
      {!online || showBackOnline ? (
        <div
          role="status"
          aria-live="polite"
          className={`app-net-banner ${online ? "is-online" : ""}`}
        >
          {online ? labels.backOnline : labels.offline}
        </div>
      ) : null}
    </>
  );

  return (
    <>
      {portalTarget ? createPortal(overlays, portalTarget) : null}
      <div key={pathname} className="app-page flex flex-1 flex-col">
        {children}
      </div>
    </>
  );
}
