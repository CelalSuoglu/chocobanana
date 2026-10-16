"use client";

import { useEffect, useState } from "react";
import {
  checkPushPermission,
  requestPushPermission,
  syncPushRegistration,
  type PushPermission,
} from "@/lib/native/push-client";

type PushSettingsCardProps = {
  locale: string;
  labels: {
    title: string;
    description: string;
    enable: string;
    enabled: string;
    denied: string;
    unavailable: string;
    error: string;
    saving: string;
  };
};

type ViewState = PushPermission | "checking" | "saving" | "error";

/** Account → Notifications, shown only in the native app. Never prompts on its own. */
export function PushSettingsCard({ locale, labels }: PushSettingsCardProps) {
  const [state, setState] = useState<ViewState>("checking");

  useEffect(() => {
    let cancelled = false;
    void checkPushPermission().then((permission) => {
      if (!cancelled) setState(permission);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setState("saving");
    const permission = await requestPushPermission();
    if (permission !== "granted") {
      setState(permission);
      return;
    }
    try {
      await syncPushRegistration(locale);
      setState("granted");
    } catch {
      setState("error");
    }
  }

  const message =
    state === "granted"
      ? labels.enabled
      : state === "denied"
        ? labels.denied
        : state === "unavailable"
          ? labels.unavailable
          : state === "error"
            ? labels.error
            : null;

  return (
    <section id="notifications" className="rounded-3xl border border-line bg-paper px-5 py-5">
      <h2 className="font-serif text-2xl text-chocolate">{labels.title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-chocolate-soft">{labels.description}</p>
      {message ? (
        <p
          className={`mt-3 text-sm ${state === "granted" ? "text-chocolate" : "text-chocolate-soft"}`}
          role={state === "error" ? "alert" : "status"}
        >
          {state === "granted" ? "✓ " : null}
          {message}
        </p>
      ) : null}
      {state === "prompt" || state === "error" || state === "saving" ? (
        <button
          type="button"
          className="btn-primary btn-inline mt-4"
          onClick={enable}
          disabled={state === "saving"}
          aria-busy={state === "saving"}
        >
          {state === "saving" ? labels.saving : labels.enable}
        </button>
      ) : null}
    </section>
  );
}
