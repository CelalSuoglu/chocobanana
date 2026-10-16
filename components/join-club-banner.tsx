import Link from "next/link";

export function JoinClubBanner({
  title,
  note,
  actionLabel,
  href,
}: {
  title: string;
  note: string;
  actionLabel: string;
  href: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-serif text-lg leading-snug text-chocolate">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-chocolate-soft">{note}</p>
        </div>
        <Link href={href} className="btn-primary !h-11 !min-h-11 !w-auto shrink-0 px-4 text-sm">
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}
