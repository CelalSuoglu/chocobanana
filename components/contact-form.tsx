"use client";

import { useState } from "react";
import { sendContactMessage } from "@/lib/contact/actions";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ContactFormProps = {
  dict: Dictionary["contact"];
};

export function ContactForm({ dict }: ContactFormProps) {
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState(dict.formNote);
  const [noteRole, setNoteRole] = useState<"status" | "alert">("status");

  return (
    <form
      className="mx-auto mt-10 w-full min-w-0 max-w-lg space-y-5 px-1 text-start"
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending) return;
        const form = event.currentTarget;
        const data = new FormData(form);
        setPending(true);
        setNoteRole("status");
        setNote(dict.formNote);
        const result = await sendContactMessage({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          message: String(data.get("message") ?? ""),
        });
        setPending(false);
        if (!result.ok) {
          setNoteRole("alert");
          setNote(dict.invalidNote);
          return;
        }
        if (result.mode === "mailto") {
          window.location.href = result.href;
          setNote(dict.submittedNote);
          return;
        }
        form.reset();
        setNote(dict.sentNote);
      }}
    >
      <div>
        <label
          htmlFor="contact-name"
          className="mb-2 block font-serif text-sm text-chocolate"
        >
          {dict.nameLabel}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder={dict.namePlaceholder}
          className="field"
        />
      </div>
      <div>
        <label
          htmlFor="contact-email"
          className="mb-2 block font-serif text-sm text-chocolate"
        >
          {dict.emailLabel}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={dict.emailPlaceholder}
          className="field"
        />
      </div>
      <div>
        <label
          htmlFor="contact-message"
          className="mb-2 block font-serif text-sm text-chocolate"
        >
          {dict.messageLabel}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          placeholder={dict.messagePlaceholder}
          className="field"
        />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? dict.sending : dict.submit}
      </button>
      <p className="text-sm leading-relaxed text-chocolate-soft" role={noteRole}>
        {note}
      </p>
    </form>
  );
}
