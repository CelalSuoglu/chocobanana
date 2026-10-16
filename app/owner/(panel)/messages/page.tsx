import { OwnerAutoRefresh } from "@/components/owner-auto-refresh";
import { listContactMessages } from "@/lib/contact/repository";
import { isDatabaseConfigured } from "@/lib/db";

export default async function OwnerMessagesPage() {
  const messages = isDatabaseConfigured() ? await listContactMessages() : [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="mt-1 text-sm text-chocolate-soft">
            Notes sent from the contact form.
          </p>
        </div>
        <OwnerAutoRefresh />
      </div>

      {messages.length === 0 ? (
        <p className="mt-10 text-sm text-chocolate-soft">No messages yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-t border-line">
          {messages.map((note) => (
            <li key={note.id} className="py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-serif text-lg text-chocolate">{note.name}</p>
                <p className="text-xs text-chocolate-soft">
                  {new Date(note.createdAt).toLocaleString("en-CA", {
                    timeZone: "America/Toronto",
                  })}
                </p>
              </div>
              <p className="mt-1 text-sm text-chocolate">
                <a href={`mailto:${note.email}`} className="hover:text-pink-deep">
                  {note.email}
                </a>
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-chocolate-soft">
                {note.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
