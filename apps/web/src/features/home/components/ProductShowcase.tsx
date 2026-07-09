import { Fragment } from "react";
import { ArrowUpRight } from "lucide-react";
import { docsUrl } from "../../../config/env.js";

const cards = [
  {
    title: "DROP IN SDK",
    href: docsUrl("/sdk/node/"),
    className: "",
    body: (
      <>
        <p>
          Add TraceLLM around real AI calls without changing where your model
          requests run.
        </p>
        <p>Start with Node today. Agents, RAG, tools, and gateways fit too.</p>
        <div className="mt-10 rounded-none border border-black bg-white p-4 font-mono text-sm leading-7 shadow-[8px_8px_0_#111]">
          <div>&gt; pnpm add @tracellm/sdk-node</div>
          <div className="mt-5 text-black/70">trace.span(&#123;</div>
          <div className="pl-5 text-black/55">provider: "openai",</div>
          <div className="pl-5 text-black/55">model: "gpt-4.1-mini"</div>
          <div className="text-black/70">&#125;)</div>
        </div>
      </>
    )
  },
  {
    title: "FULL TRACE CONTEXT",
    href: docsUrl("/getting-started/chatbot-step-1-session-tracing/"),
    className: "",
    body: (
      <>
        <p>Everything you need to debug one AI workflow:</p>
        <ul className="mt-6 space-y-2 font-mono text-sm leading-6 text-black/75">
          <li>sessions</li>
          <li>spans and lifecycle events</li>
          <li>errors, tokens, metadata</li>
          <li>prompt/output capture when enabled</li>
        </ul>
        <TraceContextDiagram />
      </>
    )
  },
  {
    title: "SPEAKS YOUR STACK",
    href: docsUrl("/sdk/node/"),
    className: "",
    body: (
      <>
        <p>
          Trace chatbots, agent workers, RAG services, internal tools, model
          routers, and custom provider wrappers.
        </p>
        <div className="mt-9 grid grid-cols-3 gap-3 bg-[linear-gradient(#11111116_1px,transparent_1px),linear-gradient(90deg,#11111116_1px,transparent_1px)] bg-[size:18px_18px] p-5">
          {["Node", "OpenAI", "Claude", "Gemini", "RAG", "+"].map((item) => (
            <span
              className="border border-black bg-white px-3 py-3 text-center font-mono text-sm font-semibold shadow-[4px_4px_0_#111]"
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
      </>
    )
  },
  {
    title: "PROJECT CONTROLS",
    href: docsUrl("/product/customization/"),
    className: "",
    body: (
      <>
        <p>Configure what gets captured from the UI or the project API key.</p>
        <div className="mt-8 space-y-4">
          {[
            ["content", "off"],
            ["metadata", "on"],
            ["redaction", "on"],
            ["sampling", "70%"]
          ].map(([label, value]) => (
            <div
              className="flex items-center justify-between border border-black bg-white px-4 py-3 font-mono text-sm"
              key={label}
            >
              <span>{label}</span>
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </>
    )
  },
  {
    title: "OPEN TELEMETRY",
    href: docsUrl("/operations/signoz/"),
    className: "lg:row-span-2",
    body: (
      <>
        <p>
          Keep product-level traces in TraceLLM and export the same workflow to
          SigNoz over OTLP.
        </p>
        <div className="mt-10 space-y-3">
          {["SDK", "TraceLLM API", "OTLP Collector", "SigNoz"].map(
            (step, index) => (
              <div
                className="flex items-center justify-between border border-black bg-white px-4 py-4"
                key={step}
              >
                <span className="font-mono text-sm">{step}</span>
                <span className="font-mono text-sm text-black/45">
                  0{index + 1}
                </span>
              </div>
            )
          )}
        </div>
        <OtelExportDiagram />
      </>
    )
  },
  {
    title: "API KEYS",
    href: "/app",
    className: "",
    body: (
      <>
        <p>
          Each project gets a key. The key carries SDK behavior, capture policy,
          and ownership.
        </p>
        <div className="mt-9 border border-black bg-black p-4 font-mono text-sm text-white">
          trllm_live_••••••••••••••
        </div>
      </>
    )
  }
];

export function ProductShowcase() {
  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 pb-28 sm:px-6 lg:px-8"
      id="platform"
    >
      <div className="mb-10 max-w-3xl">
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.16em] text-black/45">
          Platform
        </p>
        <h2 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] text-black sm:text-5xl">
          The observability layer for AI applications.
        </h2>
      </div>

      <div className="rounded-[28px] border border-black bg-[#fbfaf7] p-4 shadow-[12px_12px_0_#111] sm:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {cards.map((card) => (
            <a
              className={`group flex min-h-72 flex-col border border-black bg-white text-black no-underline transition hover:-translate-y-1 hover:shadow-[8px_8px_0_#111] focus:shadow-[8px_8px_0_#111] focus:outline-none ${card.className}`}
              href={card.href}
              key={card.title}
            >
              <div className="flex items-center justify-between border-b border-black px-5 py-4">
                <h3 className="font-mono text-lg font-semibold uppercase tracking-[0.04em]">
                  {card.title}
                </h3>
                <ArrowUpRight
                  className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                  size={20}
                />
              </div>
              <div className="flex flex-1 flex-col p-5 text-base font-medium leading-7 text-black/75">
                {card.body}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function TraceContextDiagram() {
  const rows = [
    ["SESSION", "chatbot.request", "traceId"],
    ["SPAN", "openai.chat.complete", "4.82s"],
    ["EVENT", "provider.response", "ok"],
    ["USAGE", "input 8 / output 19", "27 tok"],
    ["ERROR", "exception captured", "optional"]
  ];

  return (
    <div className="mt-8 border border-black bg-[#fbfaf7] p-4 font-mono text-xs shadow-[6px_6px_0_#111]">
      <div className="mb-4 flex items-center justify-between border-b border-black pb-3">
        <span className="font-semibold uppercase tracking-[0.12em]">
          Trace object
        </span>
        <span className="text-black/45">live</span>
      </div>

      <div className="relative space-y-3">
        <div className="absolute bottom-4 left-[10px] top-4 w-px bg-black" />
        {rows.map(([type, name, value]) => (
          <div className="relative flex items-stretch gap-3" key={type}>
            <span className="relative z-10 mt-3 h-5 w-5 border border-black bg-white">
              <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 bg-black" />
            </span>
            <div className="grid flex-1 grid-cols-[72px_1fr_auto] items-center border border-black bg-white">
              <span className="border-r border-black px-2 py-3 font-semibold">
                {type}
              </span>
              <span className="truncate px-3 py-3 text-black/70">{name}</span>
              <span className="border-l border-black px-2 py-3 text-black/45">
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OtelExportDiagram() {
  const nodes = ["TraceLLM", "OTLP", "SigNoz"];

  return (
    <div className="mt-8 border border-black bg-[#fbfaf7] p-4 font-mono text-xs shadow-[6px_6px_0_#111]">
      <div className="mb-4 flex items-center justify-between border-b border-black pb-3">
        <span className="font-semibold uppercase tracking-[0.12em]">
          Export pipeline
        </span>
        <span className="text-black/45">traces</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
        {nodes.map((node, index) => (
          <Fragment key={node}>
            <div
              className="border border-black bg-white px-3 py-4 text-center font-semibold"
            >
              {node}
            </div>
            {index < nodes.length - 1 ? (
              <div className="flex items-center gap-1">
                <span className="h-px w-5 bg-black" />
                <span className="h-2 w-2 rotate-45 border-r border-t border-black" />
              </div>
            ) : null}
          </Fragment>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 border border-black bg-white">
        {["span", "events", "errors"].map((item) => (
          <span
            className="border-l border-black px-3 py-2 text-center first:border-l-0"
            key={item}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
