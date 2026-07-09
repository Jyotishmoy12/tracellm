const beforeItems = [
  "provider dashboards split by vendor",
  "logs without prompt or span context",
  "token spikes discovered too late",
  "errors detached from user sessions"
];

const afterItems = [
  "one timeline per AI workflow",
  "project policy controls capture",
  "tokens, metadata, and errors together",
  "optional OTLP export to SigNoz"
];

export function BeforeAfterSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-28 sm:px-6 lg:px-8">
      <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="font-mono text-sm font-semibold uppercase tracking-[0.16em] text-black/45">
            Before / After
          </p>
          <h2 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] text-black sm:text-5xl">
            Stop debugging AI with scattered clues.
          </h2>
        </div>
        <p className="max-w-2xl text-lg font-medium leading-8 text-black/60 lg:justify-self-end">
          TraceLLM turns model calls, app events, usage, and failures into a
          single product-level debugging record.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ComparisonPanel
          label="Before TraceLLM"
          tone="light"
          items={beforeItems}
          footer="slow, manual, incomplete"
        />
        <ComparisonPanel
          label="After TraceLLM"
          tone="dark"
          items={afterItems}
          footer="one trace, one story"
        />
      </div>
    </section>
  );
}

function ComparisonPanel({
  label,
  tone,
  items,
  footer
}: {
  label: string;
  tone: "light" | "dark";
  items: string[];
  footer: string;
}) {
  const dark = tone === "dark";

  return (
    <article
      className={`border border-black p-5 shadow-[10px_10px_0_#111] ${
        dark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div
        className={`border border-current px-4 py-3 font-mono text-sm font-semibold uppercase tracking-[0.12em] ${
          dark ? "text-white/75" : "text-black/60"
        }`}
      >
        {label}
      </div>

      <div className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <div
            className={`grid grid-cols-[52px_1fr] border border-current ${
              dark ? "bg-white/[0.06]" : "bg-[#fbfaf7]"
            }`}
            key={item}
          >
            <div className="border-r border-current px-4 py-4 font-mono text-sm">
              0{index + 1}
            </div>
            <div className="px-4 py-4 text-base font-medium leading-7">
              {item}
            </div>
          </div>
        ))}
      </div>

      <div
        className={`mt-5 border border-current px-4 py-3 font-mono text-sm font-semibold uppercase tracking-[0.1em] ${
          dark ? "text-white/55" : "text-black/45"
        }`}
      >
        {footer}
      </div>
    </article>
  );
}
