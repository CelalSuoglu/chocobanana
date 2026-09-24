import Image from "next/image";
import type { CSSProperties } from "react";

function Star({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`star animate-twinkle ${className}`}
      style={style}
    >
      ✦
    </span>
  );
}

const navLinks = [
  { href: "#shop", label: "Shop" },
  { href: "#mail-club", label: "Mail Club" },
  { href: "#about", label: "About" },
] as const;

const steps = [
  {
    title: "Browse the Club",
    text: "Wander through the Mail Club and see what kinds of sweet parcels we dream up.",
  },
  {
    title: "Choose Your Favorites",
    text: "Pick the stationery and keepsakes that feel most like you — soft, playful, and a little nostalgic.",
  },
  {
    title: "Open the Mail",
    text: "When something arrives, settle in with a cup of something warm and enjoy the little ritual of opening mail.",
  },
] as const;

const products = [
  {
    name: "Letter Sets",
    note: "Soft paper, gentle lines, and room to write something kind.",
  },
  {
    name: "Sticker Sheets",
    note: "Tiny stars, pink hearts, and doodles ready to dress up an envelope.",
  },
  {
    name: "Sealing Touches",
    note: "Wax seals and ribbon details for parcels that feel handmade.",
  },
  {
    name: "Keepsake Notes",
    note: "Small cards meant to tuck into a letter or leave on a desk.",
  },
] as const;

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-col overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-24 z-0 flex justify-between px-6 md:px-16">
        <Star className="text-lg md:text-xl" style={{ animationDelay: "0.2s" }} />
        <Star className="mt-16 text-sm md:text-base" style={{ animationDelay: "1.1s" }} />
      </div>

      <header className="sticky top-0 z-40 border-b border-pink/30 bg-cream/85 backdrop-blur-md">
        <div className="section-pad mx-auto flex max-w-5xl items-center justify-center py-3.5 md:justify-between md:py-4">
          <a
            href="#top"
            className="font-serif text-lg tracking-[0.08em] text-chocolate transition-colors hover:text-pink-deep md:text-xl"
          >
            Chocobanana
          </a>
          <nav
            aria-label="Primary"
            className="absolute inset-x-0 top-full flex justify-center gap-7 border-b border-pink/20 bg-cream/90 py-2.5 font-serif text-[0.95rem] tracking-[0.14em] text-chocolate-soft md:static md:inset-auto md:top-auto md:border-0 md:bg-transparent md:py-0 md:text-base"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-pink-deep"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        {/* Spacer for the absolute mobile nav row */}
        <div className="h-10 md:hidden" aria-hidden="true" />
      </header>

      <main id="top" className="relative z-10 flex-1">
        {/* Brand intro */}
        <section
          aria-labelledby="brand-heading"
          className="section-pad mx-auto flex max-w-3xl flex-col items-center pb-10 pt-8 text-center md:pb-14 md:pt-14"
        >
          <div className="animate-rise relative">
            <Star
              className="absolute -left-5 -top-2 text-base md:-left-8 md:text-lg"
              style={{ animationDelay: "0.4s" }}
            />
            <Star
              className="absolute -right-4 top-6 text-sm md:-right-7"
              style={{ animationDelay: "1.4s" }}
            />
            <div className="animate-float overflow-hidden rounded-full bg-paper/60 p-2 shadow-[0_12px_40px_rgba(60,42,34,0.08)] ring-1 ring-pink/35">
              <Image
                src="/logo.jpg"
                alt="Chocobanana mail club logo with a kitten wearing a golden star"
                width={320}
                height={320}
                priority
                className="h-44 w-44 rounded-full object-cover object-center sm:h-52 sm:w-52 md:h-60 md:w-60"
              />
            </div>
          </div>

          <p className="animate-rise delay-1 mt-6 font-script text-3xl text-pink-deep md:text-4xl">
            hello, sweet friend
          </p>
          <h1
            id="brand-heading"
            className="animate-rise delay-2 mt-2 font-serif text-4xl font-semibold tracking-tight text-chocolate sm:text-5xl md:text-6xl"
          >
            Chocobanana
          </h1>
          <p className="animate-rise delay-3 mt-4 max-w-md font-serif text-lg leading-relaxed text-chocolate-soft md:text-xl">
            A cozy little mail club for soft stationery, handwritten moments,
            and parcels that feel like a hug in the post.
          </p>
          <div className="divider-ornament mt-7">
            <Star className="text-sm" style={{ animationDelay: "0.8s" }} />
          </div>
        </section>

        {/* Mail Club hero */}
        <section
          id="mail-club"
          aria-labelledby="mail-club-heading"
          className="section-pad scroll-mt-28 py-12 md:scroll-mt-24 md:py-20"
        >
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] bg-paper/80 px-6 py-12 text-center shadow-[0_18px_50px_rgba(60,42,34,0.07)] ring-1 ring-pink/40 md:px-14 md:py-16">
            <Star
              className="absolute left-6 top-6 text-lg"
              style={{ animationDelay: "0.3s" }}
            />
            <Star
              className="absolute bottom-8 right-8 text-base"
              style={{ animationDelay: "1.6s" }}
            />
            <p className="font-script text-2xl text-pink-deep md:text-3xl">
              the heart of it all
            </p>
            <h2
              id="mail-club-heading"
              className="mt-2 font-serif text-3xl font-semibold text-chocolate md:text-5xl"
            >
              The Mail Club
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-chocolate-soft md:text-lg">
              Chocobanana began with a simple wish: to make getting mail feel
              magical again. The Mail Club is where that wish lives — thoughtful
              stationery, playful details, and the quiet joy of something made
              just for opening slowly.
            </p>
            <a
              href="#how-it-works"
              className="mt-8 inline-flex items-center justify-center rounded-full border border-chocolate/80 bg-transparent px-7 py-3 font-serif text-sm tracking-[0.16em] uppercase text-chocolate transition-all duration-300 hover:border-pink-deep hover:bg-pink-soft/60 hover:text-chocolate md:text-base"
            >
              Explore the Mail Club
            </a>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          aria-labelledby="how-heading"
          className="section-pad scroll-mt-28 py-14 md:scroll-mt-24 md:py-20"
        >
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-script text-2xl text-pink-deep md:text-3xl">
              a gentle rhythm
            </p>
            <h2
              id="how-heading"
              className="mt-1 font-serif text-3xl font-semibold text-chocolate md:text-4xl"
            >
              How it works
            </h2>
            <div className="divider-ornament mt-5">
              <Star className="text-sm" />
            </div>

            <ol className="mt-10 grid gap-8 text-left md:grid-cols-3 md:gap-6">
              {steps.map((step, index) => (
                <li key={step.title} className="relative px-1 md:px-2">
                  <span className="font-script text-4xl text-gold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-serif text-2xl font-medium text-chocolate">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-chocolate-soft">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Shop / products */}
        <section
          id="shop"
          aria-labelledby="shop-heading"
          className="section-pad scroll-mt-28 bg-cream-deep/45 py-14 md:scroll-mt-24 md:py-20"
        >
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-script text-2xl text-pink-deep md:text-3xl">
              little treasures
            </p>
            <h2
              id="shop-heading"
              className="mt-1 font-serif text-3xl font-semibold text-chocolate md:text-4xl"
            >
              From the Shop
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-chocolate-soft">
              A peek at the kinds of pieces we love to make and share. The shop
              is still being prepared — browse the ideas for now.
            </p>

            <ul className="mt-10 grid gap-5 text-left sm:grid-cols-2">
              {products.map((product) => (
                <li
                  key={product.name}
                  className="rounded-3xl bg-paper/90 px-6 py-7 ring-1 ring-pink/35 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-2xl font-medium text-chocolate">
                      {product.name}
                    </h3>
                    <Star className="shrink-0 text-sm" />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-chocolate-soft md:text-[0.95rem]">
                    {product.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* About / story */}
        <section
          id="about"
          aria-labelledby="about-heading"
          className="section-pad scroll-mt-28 py-14 md:scroll-mt-24 md:py-20"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-script text-2xl text-pink-deep md:text-3xl">
              our story
            </p>
            <h2
              id="about-heading"
              className="mt-1 font-serif text-3xl font-semibold text-chocolate md:text-4xl"
            >
              About Chocobanana
            </h2>
            <div className="divider-ornament mt-5">
              <Star className="text-sm" />
            </div>
            <p className="mt-8 text-base leading-relaxed text-chocolate-soft md:text-lg">
              Chocobanana grew from late-night letter writing, scrapbook scraps,
              and a soft spot for anything that feels handmade. We believe the
              post can still carry warmth — a sticker, a note, a carefully chosen
              paper — reminders that someone thought of you.
            </p>
            <p className="mt-4 text-base leading-relaxed text-chocolate-soft md:text-lg">
              The kitten with the golden star is our little guardian of cozy
              mail days. Everything we make aims for that same feeling: sweet,
              a bit nostalgic, and gently playful.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-pink/30 bg-cream-deep/50">
        <div className="section-pad mx-auto flex max-w-4xl flex-col items-center gap-4 py-10 text-center md:py-12">
          <p className="font-serif text-xl tracking-[0.12em] text-chocolate">
            Chocobanana
          </p>
          <p className="font-script text-xl text-pink-deep">mail club</p>
          <nav
            aria-label="Footer"
            className="flex flex-wrap justify-center gap-5 font-serif text-sm tracking-[0.12em] text-chocolate-soft"
          >
            {navLinks.map((link) => (
              <a
                key={`footer-${link.href}`}
                href={link.href}
                className="transition-colors hover:text-pink-deep"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="mt-2 text-xs tracking-wide text-chocolate-soft/80">
            Made with soft paper &amp; golden stars.
          </p>
        </div>
      </footer>
    </div>
  );
}
