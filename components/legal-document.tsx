type LegalSection = { heading: string; body: string[] };

/** Shared layout for Terms of Sale and the privacy policy. */
export function LegalDocument({
  path,
  lang,
  title,
  updated,
  intro,
  sections,
  children,
}: {
  /** Page path without locale, e.g. "/terms". Used for the French/English links. */
  path?: string;
  lang: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  children?: React.ReactNode;
}) {
  return (
    <main lang={lang} className="section-pad flex-1 pb-16 pt-8 md:pb-20 md:pt-12">
      <article className="mx-auto max-w-2xl">
        <h1 className="page-title">{title}</h1>
        <p className="mt-2 text-xs text-chocolate-soft">{updated}</p>
        {path ? (
          <p className="mt-2 text-xs text-chocolate-soft">
            <a href={`/fr${path}`} lang="fr" className="underline underline-offset-2">Version française</a>
            {" · "}
            <a href={`/en${path}`} lang="en" className="underline underline-offset-2">English version</a>
          </p>
        ) : null}
        <p className="mt-6 text-sm leading-relaxed text-chocolate-soft">{intro}</p>
        {children}
        {sections.map((section) => (
          <section key={section.heading} className="mt-8">
            <h2 className="font-serif text-2xl text-chocolate">{section.heading}</h2>
            <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-relaxed text-chocolate-soft">
              {section.body.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ))}
      </article>
    </main>
  );
}
