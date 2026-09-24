"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Star } from "@/components/star";
import { logoutOwnerAction } from "@/lib/auth/actions";

const PANEL_LINKS = [
  { href: "/owner", label: "Dashboard", match: (path: string) => path === "/owner" },
  {
    href: "/owner/orders",
    label: "Orders",
    match: (path: string) => path.startsWith("/owner/orders"),
  },
  {
    href: "/owner/members",
    label: "Members",
    match: (path: string) => path.startsWith("/owner/members"),
  },
] as const;

export type OwnerHeaderProps =
  | { mode: "guest" }
  | {
      mode: "owner";
      name: string | null;
      email: string;
    };

export function OwnerHeader(props: OwnerHeaderProps) {
  const pathname = usePathname() || "/owner";
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (props.mode === "guest") {
    return (
      <header className="owner-header">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/owner/login" className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Chocobanana"
              width={48}
              height={48}
              className="h-11 w-11 rounded-full object-cover ring-1 ring-pink/45"
              priority
            />
            <div>
              <p className="font-script text-lg leading-none text-pink-deep sm:text-xl">
                Chocobanana
              </p>
              <p className="mt-0.5 font-serif text-sm tracking-[0.14em] text-chocolate">
                Owner Portal
              </p>
            </div>
          </Link>
          <Link href="/owner/login" className="owner-btn owner-btn-primary">
            Sign in
          </Link>
        </div>
      </header>
    );
  }

  const displayName = props.name?.trim() || props.email;

  return (
    <header className="owner-header">
      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/owner" className="shrink-0">
              <Image
                src="/logo.jpg"
                alt="Chocobanana"
                width={52}
                height={52}
                className="h-12 w-12 rounded-full object-cover ring-1 ring-pink/45"
                priority
              />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-script text-lg leading-none text-pink-deep sm:text-xl">
                  Chocobanana
                </p>
                <Star className="text-xs" style={{ animationDelay: "0.45s" }} />
              </div>
              <p className="mt-1 font-serif text-sm tracking-[0.12em] text-chocolate sm:text-base">
                Owner Dashboard
              </p>
              <p className="mt-0.5 truncate text-xs text-chocolate-soft sm:text-sm">
                {displayName}
                {props.name?.trim() && props.email !== props.name.trim() ? (
                  <span className="hidden sm:inline"> · {props.email}</span>
                ) : null}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <form action={logoutOwnerAction}>
              <button type="submit" className="owner-btn text-xs sm:text-sm">
                Sign out
              </button>
            </form>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-pink/45 bg-paper/90 text-chocolate md:hidden"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              <span aria-hidden="true" className="font-serif text-lg leading-none">
                {open ? "×" : "☰"}
              </span>
            </button>
          </div>
        </div>

        <nav
          aria-label="Owner panel"
          className="mt-3 hidden flex-wrap gap-x-5 gap-y-2 border-t border-pink/25 pt-3 font-serif text-[0.95rem] tracking-[0.1em] text-chocolate-soft md:flex"
        >
          {PANEL_LINKS.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-pink-deep ${
                  active ? "text-pink-deep" : ""
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <nav
          id={panelId}
          aria-label="Owner panel mobile"
          className={`mt-3 border-t border-pink/25 pt-3 md:hidden ${open ? "block" : "hidden"}`}
        >
          <ul className="flex flex-col gap-1">
            {PANEL_LINKS.map((link) => {
              const active = link.match(pathname);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block rounded-2xl px-4 py-3 font-serif text-base tracking-[0.08em] transition-colors ${
                      active
                        ? "bg-pink-soft/50 text-pink-deep"
                        : "text-chocolate-soft hover:bg-paper/80 hover:text-pink-deep"
                    }`}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
