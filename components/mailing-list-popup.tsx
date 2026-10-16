"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { subscribeToMailingList } from "@/lib/mailing/actions";
import type { Locale } from "@/lib/i18n/config";
import { hrefFor } from "@/lib/nav";

const LATER_COOKIE = "cb_mail_later";
const JOINED_COOKIE = "cb_mail_joined";
const LATER_SECONDS = 60 * 60 * 24 * 30;

type MailingPopupProps = {
  locale: Locale;
  signedIn: boolean;
  labels: {
    title: string;
    note: string;
    firstName: string;
    email: string;
    consent: string;
    submit: string;
    pending: string;
    signIn: string;
    later: string;
    success: string;
    consentError: string;
    emailError: string;
    already: string;
    pendingNote: string;
    sendError: string;
    close: string;
  };
};

function hasCookie(name: string): boolean {
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${name}=`));
}

function writeCookie(name: string, maxAge: number) {
  document.cookie = `${name}=1; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

export function MailingListPopup({ locale, signedIn, labels }: MailingPopupProps) {
  const pathname = usePathname() || "";
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const blocked =
    signedIn || pathname.includes("/checkout") || pathname.includes("/site-unlock");

  useEffect(() => {
    if (blocked || hasCookie(LATER_COOKIE) || hasCookie(JOINED_COOKIE)) return;
    const timer = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, [blocked]);

  function later() {
    writeCookie(LATER_COOKIE, LATER_SECONDS);
    setOpen(false);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setMessage(null);
    setSuccess(false);
    const data = new FormData(event.currentTarget);
    if (data.get("marketingOptIn") !== "yes") {
      setMessage(labels.consentError);
      return;
    }
    setPending(true);
    try {
      const result = await subscribeToMailingList(null, data);
      if (result.ok) {
        writeCookie(JOINED_COOKIE, 60 * 60 * 24 * 365);
        setSuccess(true);
        setMessage(labels.success);
        return;
      }
      setMessage(
        result.reason === "consent"
          ? labels.consentError
          : result.reason === "email"
            ? labels.emailError
            : result.reason === "already"
              ? labels.already
              : result.reason === "pending"
                ? labels.pendingNote
                : labels.sendError,
      );
      if (result.reason === "already" || result.reason === "pending") {
        writeCookie(JOINED_COOKIE, 60 * 60 * 24 * 365);
      }
    } finally {
      setPending(false);
    }
  }

  if (!open || blocked) return null;

  return (
    <div className="app-safe-sheet fixed inset-0 z-50 flex items-end justify-center bg-chocolate/35 p-3 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-paper px-5 py-6 sm:px-7"
      >
        <span aria-hidden="true" className="absolute left-5 top-4 text-xs text-gold">
          ✦
        </span>
        <span aria-hidden="true" className="absolute right-16 top-6 text-[10px] text-gold">
          ✦
        </span>
        <span aria-hidden="true" className="absolute bottom-5 right-6 text-xs text-pink">
          ✦
        </span>
        <Image
          src="/logo.jpg"
          alt=""
          width={72}
          height={72}
          className="mx-auto h-16 w-16 rounded-full object-cover ring-1 ring-line"
        />
        <h2 id={titleId} className="mt-4 text-center font-serif text-3xl leading-tight text-chocolate">
          {labels.title}
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-chocolate-soft">{labels.note}</p>
        {success ? (
          <p className="mt-5 text-center text-sm text-chocolate" role="status">
            {message}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <label className="block">
              <span className="mb-1.5 block font-serif text-sm text-chocolate">{labels.firstName}</span>
              <input name="firstName" autoComplete="given-name" className="field" />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-serif text-sm text-chocolate">{labels.email}</span>
              <input name="email" type="email" required autoComplete="email" className="field" />
            </label>
            <label className="flex items-start gap-3 text-sm leading-relaxed text-chocolate">
              <input
                type="checkbox"
                name="marketingOptIn"
                value="yes"
                className="mt-1 h-4 w-4 accent-chocolate"
              />
              <span>{labels.consent}</span>
            </label>
            {message ? (
              <p className="text-sm text-pink-deep" role="alert">
                {message}
              </p>
            ) : null}
            <button type="submit" className="btn-primary w-full" disabled={pending}>
              {pending ? labels.pending : labels.submit}
            </button>
          </form>
        )}
        <div className="mt-4 flex flex-col items-center gap-2 text-sm">
          <Link href={hrefFor(locale, "/login")} className="text-chocolate-soft underline-offset-2 hover:underline">
            {labels.signIn}
          </Link>
          <button type="button" onClick={later} className="min-h-11 text-chocolate-soft">
            {labels.later}
          </button>
        </div>
        <button
          type="button"
          onClick={later}
          aria-label={labels.close}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center text-chocolate"
        >
          ×
        </button>
      </div>
    </div>
  );
}
