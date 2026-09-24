"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ContactFormProps = {
  dict: Dictionary["contact"];
};

export function ContactForm({ dict }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="mx-auto mt-10 w-full max-w-lg space-y-5 text-start"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <div>
        <label
          htmlFor="contact-name"
          className="font-serif text-sm tracking-wide text-chocolate"
        >
          {dict.nameLabel}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          placeholder={dict.namePlaceholder}
          className="mt-2 w-full rounded-2xl border border-pink/40 bg-paper/90 px-4 py-3 text-chocolate outline-none focus-visible:ring-2 focus-visible:ring-pink"
        />
      </div>
      <div>
        <label
          htmlFor="contact-email"
          className="font-serif text-sm tracking-wide text-chocolate"
        >
          {dict.emailLabel}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          placeholder={dict.emailPlaceholder}
          className="mt-2 w-full rounded-2xl border border-pink/40 bg-paper/90 px-4 py-3 text-chocolate outline-none focus-visible:ring-2 focus-visible:ring-pink"
        />
      </div>
      <div>
        <label
          htmlFor="contact-message"
          className="font-serif text-sm tracking-wide text-chocolate"
        >
          {dict.messageLabel}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder={dict.messagePlaceholder}
          className="mt-2 w-full rounded-2xl border border-pink/40 bg-paper/90 px-4 py-3 text-chocolate outline-none focus-visible:ring-2 focus-visible:ring-pink"
        />
      </div>
      <button
        type="submit"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-chocolate/80 px-5 py-2.5 font-serif text-sm tracking-[0.12em] uppercase text-chocolate transition-colors hover:border-pink-deep hover:bg-pink-soft/60"
      >
        {dict.submit}
      </button>
      <p className="text-xs leading-relaxed text-chocolate-soft/90">
        {submitted ? dict.submittedNote : dict.formNote}
      </p>
    </form>
  );
}
