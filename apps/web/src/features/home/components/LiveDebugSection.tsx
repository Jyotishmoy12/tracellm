const debugSteps = [
  {
    label: "01",
    title: "Open the user session",
    detail: "Find the exact workflow run by session name, status, or timestamp."
  },
  {
    label: "02",
    title: "Inspect the model span",
    detail: "Check provider, model, latency, token usage, and request status."
  },
  {
    label: "03",
    title: "Read captured events",
    detail: "See lifecycle events around tools, retrieval, provider calls, and app logic."
  },
  {
    label: "04",
    title: "Follow the failure",
    detail: "Errors stay attached to the same trace with message, type, stack, and metadata."
  }
];

export function LiveDebugSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-28 sm:px-6 lg:px-8">
      <div className="border border-black bg-[#fbfaf7] p-4 shadow-[12px_12px_0_#111] sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border border-black bg-white p-6 sm:p-8">
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.16em] text-black/45">
              Live Debug
            </p>
            <h2 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] text-black sm:text-5xl">
              A bad answer becomes an inspectable trace.
            </h2>
            <p className="mt-5 text-lg font-medium leading-8 text-black/60">
              When a user reports a wrong response, TraceLLM gives you the
              sequence of things that happened before the answer appeared.
            </p>

            <div className="mt-10 border border-black bg-black p-5 font-mono text-sm leading-7 text-white">
              <div className="text-white/45">reported_issue.json</div>
              <div className="mt-5">&#123;</div>
              <div className="pl-5 text-white/70">"status": "bad_answer",</div>
              <div className="pl-5 text-white/70">"session": "chatbot.request",</div>
              <div className="pl-5 text-white/70">"trace": "openai.chat.complete"</div>
              <div>&#125;</div>
            </div>
          </div>

          <div className="border border-black bg-white p-5">
            <div className="border border-black bg-[#fbfaf7] p-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-black pb-3">
                <span className="font-semibold uppercase tracking-[0.12em]">
                  Investigation path
                </span>
                <span className="text-black/45">4 steps</span>
              </div>

              <div className="relative mt-5 space-y-4">
                <div className="absolute bottom-6 left-[23px] top-6 w-px bg-black" />
                {debugSteps.map((step) => (
                  <div
                    className="relative grid grid-cols-[48px_1fr] gap-4"
                    key={step.label}
                  >
                    <span className="relative z-10 flex h-12 w-12 items-center justify-center border border-black bg-white font-semibold">
                      {step.label}
                    </span>
                    <div className="border border-black bg-white p-4">
                      <h3 className="font-mono text-sm font-semibold uppercase tracking-[0.08em] text-black">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-black/60">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 border border-black bg-white font-mono text-xs">
              {["prompt", "span", "output"].map((item) => (
                <span
                  className="border-l border-black px-3 py-3 text-center font-semibold uppercase tracking-[0.08em] first:border-l-0"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
