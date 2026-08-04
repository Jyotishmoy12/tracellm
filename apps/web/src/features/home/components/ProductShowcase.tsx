import { ArrowUpRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { docsUrl } from "../../../config/env.js";

type ShowcaseCard = {
  title: string;
  href: string;
  body: string;
  visual: ReactNode;
};

const cards: ShowcaseCard[] = [
  {
    title: "Drop in the SDK",
    href: docsUrl("/sdk/node/"),
    body: "Wrap real model, agent, RAG, and tool calls without changing where those requests run.",
    visual: <SdkVisual />
  },
  {
    title: "Full trace context",
    href: docsUrl("/getting-started/chatbot-step-1-session-tracing/"),
    body: "Sessions, spans, events, errors, token usage, metadata, and optional content stay attached to one turn.",
    visual: <TraceVisual />
  },
  {
    title: "Control capture",
    href: docsUrl("/product/customization/"),
    body: "Choose what gets stored: content, metadata, errors, usage, redaction, sampling, and span kinds.",
    visual: <ControlsVisual />
  },
  {
    title: "Export to your stack",
    href: docsUrl("/operations/external-otlp-exports/"),
    body: "Forward selected traces to SigNoz, Honeycomb, Tempo, Datadog, or any OTLP HTTP collector.",
    visual: <ExportVisual />
  },
  {
    title: "Provider agnostic",
    href: docsUrl("/getting-started/provider-testing/"),
    body: "Use TraceLLM with OpenAI, Claude, Gemini, custom gateways, internal tools, and MCP-shaped workflows.",
    visual: <StackVisual />
  },
  {
    title: "Project API keys",
    href: "/app",
    body: "Each key maps requests to one project and carries the project capture policy into your SDK runtime.",
    visual: <ApiKeyVisual />
  }
];

export function ProductShowcase() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-28 sm:px-6 lg:px-8" id="platform">
      <div className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a8abb0]">
          Platform
        </p>
        <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#232323] sm:text-3xl">
          The observability layer for AI applications.
        </h2>
      </div>

      <div className="rounded-[28px] border border-[#e4e4df] bg-white p-3 shadow-[0_18px_44px_rgba(30,30,30,0.06)] sm:p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <a
              className="group flex min-h-[250px] flex-col overflow-hidden rounded-[22px] border border-[#e4e4df] bg-[#fbfbfa] p-5 text-[#232323] no-underline transition hover:border-[#d9d6ff] hover:bg-white hover:shadow-[0_14px_34px_rgba(30,30,30,0.07)] focus:outline-none focus:ring-2 focus:ring-[#d9d6ff]"
              href={card.href}
              key={card.title}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold leading-snug">{card.title}</h3>
                  <p className="mt-2 max-w-sm text-sm font-normal leading-6 text-[#777a7f]">
                    {card.body}
                  </p>
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#e4e4df] bg-white text-[#4f46e5] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  <ArrowUpRight aria-hidden="true" size={16} />
                </span>
              </div>
              <div className="mt-5 flex flex-1 items-end">{card.visual}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function SdkVisual() {
  return (
    <div className="w-full rounded-[18px] border border-[#e4e4df] bg-white p-3 text-xs text-[#777a7f]">
      <div className="rounded-xl bg-[#232323] px-3 py-2 font-medium text-white">
        pnpm add @use-tracellm/sdk-node
      </div>
      <div className="mt-3 grid gap-2">
        {["startSession()", "startSpan({ kind: 'llm' })", "recordEvent()", "end({ usage })"].map((item) => (
          <div className="rounded-xl border border-[#eeeeeb] bg-[#fafafa] px-3 py-2 font-normal" key={item}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function TraceVisual() {
  return (
    <div className="w-full rounded-[18px] border border-[#e4e4df] bg-white p-3">
      {["session", "retrieval span", "tool span", "llm span"].map((item, index) => (
        <div className="mb-2 flex items-center gap-2 last:mb-0" key={item}>
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#f1f0ff] text-[10px] font-semibold text-[#4f46e5]">
            {index + 1}
          </span>
          <span className="rounded-xl border border-[#eeeeeb] bg-[#fafafa] px-3 py-2 text-xs font-medium text-[#777a7f]">
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

function ControlsVisual() {
  return (
    <div className="grid w-full gap-2">
      {[
        ["Content", "off"],
        ["Metadata", "on"],
        ["Redaction", "on"],
        ["Sampling", "70%"]
      ].map(([label, value]) => (
        <div className="flex items-center justify-between rounded-xl border border-[#e4e4df] bg-white px-3 py-2" key={label}>
          <span className="text-xs font-medium text-[#777a7f]">{label}</span>
          <span className="rounded-full bg-[#f1f0ff] px-2.5 py-1 text-[10px] font-semibold text-[#4f46e5]">{value}</span>
        </div>
      ))}
    </div>
  );
}

function ExportVisual() {
  const nodes = ["TraceLLM", "OTLP", "SigNoz"];

  return (
    <div className="grid w-full grid-cols-[1fr_26px_1fr_26px_1fr] items-center gap-2 text-center text-xs font-medium text-[#777a7f]">
      {nodes.map((item, index) => (
        <FragmentNode item={item} index={index} key={item} />
      ))}
    </div>
  );
}

function FragmentNode({ item, index }: { item: string; index: number }) {
  return (
    <>
      <span className="rounded-xl border border-[#e4e4df] bg-white px-3 py-3">
        {item}
      </span>
      {index < 2 ? <FlowPath delay={index * 0.75} /> : null}
    </>
  );
}

function FlowPath({ delay }: { delay: number }) {
  return (
    <span className="export-flow-path" aria-hidden="true" style={{ "--flow-delay": `${delay}s` } as CSSProperties}>
      <span />
    </span>
  );
}

function StackVisual() {
  return (
    <div className="grid w-full grid-cols-3 gap-2">
      {["Node", "OpenAI", "Claude", "Gemini", "RAG", "MCP"].map((item) => (
        <span className="rounded-xl border border-[#e4e4df] bg-white px-3 py-3 text-center text-xs font-medium text-[#777a7f]" key={item}>
          {item}
        </span>
      ))}
    </div>
  );
}

function ApiKeyVisual() {
  return (
    <div className="w-full rounded-[18px] border border-[#e4e4df] bg-white p-3">
      <div className="rounded-xl bg-[#232323] px-3 py-2 text-xs font-medium text-white">
        trllm_live_xxxxxxxxxxxx
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {["capture", "sampling", "redaction", "exports"].map((item) => (
          <span className="rounded-xl border border-[#eeeeeb] bg-[#fafafa] px-3 py-2 text-center text-[11px] font-medium text-[#777a7f]" key={item}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
