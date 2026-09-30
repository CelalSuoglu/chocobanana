type PageHeroProps = {
  eyebrow: string;
  title: string;
  intro: string;
};

export function PageHero({ eyebrow, title, intro }: PageHeroProps) {
  return (
    <header className="mx-auto max-w-2xl text-center">
      <p className="kicker">{eyebrow}</p>
      <h1 className="page-title mt-2">{title}</h1>
      <p className="page-lead mx-auto">{intro}</p>
    </header>
  );
}
