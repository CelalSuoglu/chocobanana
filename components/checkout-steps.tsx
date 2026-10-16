type CheckoutStep = "details" | "payment" | "confirmation";

type CheckoutStepsProps = {
  current: CheckoutStep;
  label: string;
  details: string;
  payment: string;
  confirmation: string;
};

const order: CheckoutStep[] = ["details", "payment", "confirmation"];

export function CheckoutSteps({
  current,
  label,
  details,
  payment,
  confirmation,
}: CheckoutStepsProps) {
  const labels: Record<CheckoutStep, string> = {
    details,
    payment,
    confirmation,
  };
  const currentIndex = order.indexOf(current);

  return (
    <nav aria-label={label} className="mt-6">
      <ol className="grid grid-cols-3 gap-2 sm:gap-4">
        {order.map((step, index) => {
          const active = step === current;
          const done = index < currentIndex;
          return (
            <li key={step} className="min-w-0">
              <p
                className={`border-b-2 pb-2 font-serif text-sm leading-snug sm:text-base ${
                  active
                    ? "border-chocolate font-medium text-chocolate"
                    : done
                      ? "border-chocolate/40 text-chocolate"
                      : "border-line text-chocolate-soft"
                }`}
                aria-current={active ? "step" : undefined}
              >
                <span className="mb-1 block text-xs tracking-wide text-chocolate-soft">
                  {index + 1}
                </span>
                {labels[step]}
              </p>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
