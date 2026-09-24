import { Star } from "@/components/star";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  intro: string;
};

export function PageHero({ eyebrow, title, intro }: PageHeroProps) {
  return (
    <header className="mx-auto max-w-2xl text-center">
      <p className="font-script text-2xl text-pink-deep md:text-3xl">{eyebrow}</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold text-chocolate md:text-5xl">
        {title}
      </h1>
      <div className="divider-ornament mt-5">
        <Star className="text-sm" />
      </div>
      <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-chocolate-soft md:text-lg">
        {intro}
      </p>
    </header>
  );
}
