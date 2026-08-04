const beforeItems = [
  "Provider dashboards split by vendor",
  "Logs without prompt or span context",
  "Token spikes discovered too late",
  "Errors detached from user sessions"
];

const afterItems = [
  "One timeline per AI workflow",
  "Project policy controls capture",
  "Tokens, metadata, and errors together",
  "Optional OTLP export to your stack"
];

export function BeforeAfterSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-28 sm:px-6 lg:px-8">
      <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a8abb0]">Before / After</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#232323] sm:text-3xl">
            Stop debugging AI with scattered clues.
          </h2>
        </div>
        <p className="max-w-2xl text-base font-normal leading-7 text-[#777a7f] lg:justify-self-end">
          TraceLLM turns model calls, app events, usage, and failures into a single product-level debugging record.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ComparisonPanel label="Before TraceLLM" items={beforeItems} footer="slow, manual, incomplete" tone="pink" />
        <ComparisonPanel label="After TraceLLM" items={afterItems} footer="one trace, one story" tone="green" />
      </div>
    </section>
  );
}

function ComparisonPanel({
  label,
  items,
  footer,
  tone
}: {
  label: string;
  items: string[];
  footer: string;
  tone: "pink" | "green";
}) {
  const classes = tone === "pink"
    ? "border-[#e4e4df] bg-white text-[#232323]"
    : "border-[#d9d6ff] bg-[#f1f0ff] text-[#232323]";

  return (
    <article className={`rounded-[26px] border p-5 shadow-[0_16px_42px_rgba(30,30,30,0.06)] ${classes}`}>
      <div className="w-fit rounded-full border border-[#e4e4df] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#777a7f]">
        {label}
      </div>
      <div className="mt-6 grid gap-3">
        {items.map((item, index) => (
          <div className="grid grid-cols-[52px_1fr] items-center rounded-[22px] border border-[#e4e4df] bg-white shadow-sm" key={item}>
            <div className="px-4 py-3 text-sm font-semibold text-[#4f46e5]">0{index + 1}</div>
            <div className="px-4 py-3 text-sm font-normal leading-6 text-[#777a7f]">{item}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-full border border-[#e4e4df] bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#232323]">
        {footer}
      </div>
    </article>
  );
}
