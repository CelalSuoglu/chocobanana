import {
  closePublicSiteAction,
  openPublicSiteAction,
} from "@/lib/owner/public-opening-actions";
import { PublicOpeningCountdown } from "@/components/public-opening-countdown";
import {
  formatTorontoDateTime,
  isOpeningActiveAt,
  readPublicSiteOpening,
} from "@/lib/site/public-opening";

export async function OwnerPublicOpening() {
  const now = new Date();
  const opening = await readPublicSiteOpening();
  const open = isOpeningActiveAt(opening, now);

  return (
    <section className="owner-card mt-8">
      <h2 className="font-serif text-2xl text-chocolate">Public site</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-chocolate-soft">
        The countdown stays the public default. Opening it here shows the real
        site to everyone for 30 minutes, then the same countdown returns on its
        own.
      </p>

      {open && opening ? (
        <div className="mt-4 space-y-1 text-sm text-chocolate">
          <p>
            Site public until{" "}
            <span className="font-serif text-lg">
              {formatTorontoDateTime(opening.endsAt)}
            </span>
          </p>
          <PublicOpeningCountdown
            endsAtIso={opening.endsAt.toISOString()}
            serverNowIso={now.toISOString()}
          />
        </div>
      ) : (
        <p className="mt-4 text-sm text-chocolate-soft">
          Visitors are seeing the countdown.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <form action={openPublicSiteAction}>
          <button type="submit" className="owner-btn owner-btn-primary">
            Open site for 30 minutes
          </button>
        </form>
        <form action={closePublicSiteAction}>
          <button type="submit" className="owner-btn">
            Close now
          </button>
        </form>
      </div>
    </section>
  );
}
