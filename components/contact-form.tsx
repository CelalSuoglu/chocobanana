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
          className="field mt-2"
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
          className="field mt-2"
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
          className="field mt-2"
        />
      </div>
      <button
        type="submit"
        className="btn-secondary"
      >
        {dict.submit}
      </button>
      <p className="text-xs leading-relaxed text-chocolate-soft/90">
        {submitted ? dict.submittedNote : dict.formNote}
      </p>
    </form>
  );
}
