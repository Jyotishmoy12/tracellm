import { ArrowRight, Braces, CircleDot, GitBranch, KeyRound, RadioTower } from "lucide-react";
import type { ReactNode } from "react";
import { docsUrl, webEnv } from "../../../config/env.js";
import { useProductHuntStats } from "../hooks/useProductHuntStats.js";

const traceSteps = [
  { label: "prompt", value: "user question" },
  { label: "retrieval", value: "3 chunks" },
  { label: "tool", value: "crm.lookup" },
  { label: "output", value: "answer + usage" }
];

const signals = [
  ["latency", "4.82s"],
  ["tokens", "27"],
  ["errors", "0"],
  ["export", "otlp"]
];

const chipPositions = [
  "left-6 top-7",
  "right-6 top-7",
  "left-6 bottom-8",
  "right-6 bottom-8"
];

export function HomeHero() {
  const productHuntStats = useProductHuntStats();
  const votesCount = productHuntStats.data?.votesCount;
  const productHuntUrl = productHuntStats.data?.postUrl ?? webEnv.productHuntUrl;

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-24 lg:pt-20">
      <div className="flex flex-col justify-center lg:-translate-y-16">
        <div className="relative h-7">
          <a
            className="absolute -top-8 left-0 inline-flex w-fit items-center gap-3 rounded-full border border-[#e4e4df] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#777a7f] no-underline shadow-sm transition hover:border-[#d9d6ff] hover:text-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#d9d6ff] lg:-top-12"
            href={productHuntUrl}
            rel="noreferrer"
            target="_blank"
          >
            <span className="h-2 w-2 rounded-full bg-[#4f46e5]" />
            {typeof votesCount === "number" ? `${votesCount.toLocaleString()} upvotes on Product Hunt` : "Live on Product Hunt"}
          </a>
        </div>

        <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight text-[#232323] sm:text-4xl lg:text-5xl">
          See the full trace behind every AI answer.
        </h1>
        <p className="mt-5 max-w-2xl text-base font-normal leading-7 text-[#777a7f] sm:text-lg">
          TraceLLM connects prompts, retrieval, tool calls, model spans, token usage, errors, and exports into one inspectable workflow.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#232323] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white no-underline transition hover:bg-[#4f46e5] focus:bg-[#4f46e5] focus:outline-none"
            href="/app"
          >
            Create account
          </a>
          <a
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#e4e4df] bg-white px-5 text-xs font-semibold uppercase tracking-[0.08em] text-[#232323] no-underline transition hover:bg-[#f1f0ff] focus:bg-[#f1f0ff] focus:outline-none"
            href={docsUrl("/sdk/node/")}
          >
            Read SDK docs
          </a>
        </div>

        <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
          {signals.map(([label, value]) => (
            <div className="rounded-2xl border border-[#e4e4df] bg-white px-4 py-3" key={label}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a8abb0]">
                {label}
              </div>
              <div className="mt-1 text-sm font-semibold text-[#232323]">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-4 rounded-[40px] bg-[radial-gradient(circle_at_30%_20%,rgba(79,70,229,0.12),transparent_34%),radial-gradient(circle_at_78%_72%,rgba(35,35,35,0.08),transparent_30%)]" />
        <div className="relative overflow-hidden rounded-[32px] border border-[#e4e4df] bg-white p-5 shadow-[0_22px_60px_rgba(30,30,30,0.08)]">
          <div className="flex items-center justify-between border-b border-[#e4e4df] pb-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a8abb0]">
                Trace map
              </div>
              <div className="mt-1 text-xl font-semibold text-[#232323]">one AI turn, opened up</div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#e4e4df] bg-[#fafafa] px-3 py-2 text-xs font-semibold text-[#777a7f]">
              <CircleDot aria-hidden="true" size={14} />
              live
            </div>
          </div>

          <div className="grid gap-5 py-6">
            <div className="relative min-h-[390px] overflow-hidden rounded-[26px] border border-[#e4e4df] bg-[#fafafa] p-5">
              <svg
                aria-hidden="true"
                className="trace-map-lines absolute inset-0 z-20 h-full w-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <path d="M36 39 C29 34 25 28 20 24" />
                <path d="M64 39 C71 34 75 28 80 24" />
                <path d="M36 61 C29 66 25 72 20 76" />
                <path d="M64 61 C71 66 75 72 80 76" />
              </svg>

              <div className="absolute left-1/2 top-1/2 z-30 w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-[#d9d6ff] bg-white p-5 text-center shadow-[0_18px_44px_rgba(30,30,30,0.08)]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f0ff] text-[#4f46e5]">
                  <Braces aria-hidden="true" size={22} />
                </div>
                <div className="mt-4 text-xs font-semibold uppercase tracking-[0.13em] text-[#a8abb0]">
                  model span
                </div>
                <div className="mt-1 text-lg font-semibold text-[#232323]">gpt-4.1-mini</div>
                <div className="mt-3 rounded-full bg-[#fafafa] px-3 py-2 text-xs font-medium text-[#777a7f]">
                  4.82s - 27 tokens
                </div>
              </div>

              {traceSteps.map((step, index) => (
                <TraceChip
                  icon={index === 0 ? <KeyRound size={15} /> : <GitBranch size={15} />}
                  key={step.label}
                  label={step.label}
                  value={step.value}
                  className={chipPositions[index] ?? ""}
                />
              ))}
            </div>

            <div className="grid gap-3 rounded-[24px] border border-[#e4e4df] bg-white p-4 md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f1f0ff] text-[#4f46e5]">
                  <RadioTower aria-hidden="true" size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a8abb0]">
                    external export
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#232323]">Forward selected trace data</div>
                </div>
              </div>
              <div className="hidden h-px bg-[#e4e4df] md:block" />
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#777a7f]">
                <span className="rounded-full border border-[#e4e4df] bg-[#fafafa] px-3 py-2">TraceLLM</span>
                <ArrowRight aria-hidden="true" className="text-[#4f46e5]" size={15} />
                <span className="rounded-full border border-[#e4e4df] bg-[#fafafa] px-3 py-2">OTLP</span>
                <ArrowRight aria-hidden="true" className="text-[#4f46e5]" size={15} />
                <span className="rounded-full border border-[#e4e4df] bg-[#fafafa] px-3 py-2">SigNoz</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-t border-[#e4e4df] pt-4 sm:grid-cols-3">
            {["capture policy", "redaction", "sampling"].map((item) => (
              <div className="rounded-2xl border border-[#e4e4df] bg-[#fafafa] px-4 py-3 text-xs font-medium text-[#777a7f]" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TraceChip({
  className,
  icon,
  label,
  value
}: {
  className: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className={`absolute z-30 w-[180px] rounded-2xl border border-[#e4e4df] bg-white p-3 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 text-[#4f46e5]">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a8abb0]">{label}</span>
      </div>
      <div className="mt-2 text-sm font-semibold text-[#232323]">{value}</div>
    </div>
  );
}
