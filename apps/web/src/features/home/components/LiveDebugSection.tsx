const debugSteps = [
  ["01", "Open the user session", "Find the exact workflow run by session name, status, or timestamp."],
  ["02", "Inspect the model span", "Check provider, model, latency, token usage, and request status."],
  ["03", "Read captured events", "See lifecycle events around tools, retrieval, provider calls, and app logic."],
  ["04", "Follow the failure", "Errors stay attached to the same trace with message, type, stack, and metadata."]
];

export function LiveDebugSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-28 sm:px-6 lg:px-8">
      <div className="rounded-[30px] border border-[#e4e4df] bg-white p-4 shadow-[0_18px_44px_rgba(30,30,30,0.06)] sm:p-5">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[24px] border border-[#e4e4df] bg-[#fafafa] p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a8abb0]">Live Debug</p>
            <h2 className="mt-2 text-xl font-semibold leading-tight text-[#232323] sm:text-2xl">
              A bad answer becomes an inspectable trace.
            </h2>
            <p className="mt-3 max-w-xl text-sm font-normal leading-6 text-[#777a7f]">
              When a user reports a wrong response, TraceLLM gives you the sequence of things that happened before the answer appeared.
            </p>

            <div className="mt-8 rounded-[22px] border border-[#e4e4df] bg-white p-4 text-sm leading-6 text-[#777a7f] shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a8abb0]">reported issue</div>
              <div className="mt-4 grid gap-2">
                {[
                  ["status", "bad_answer"],
                  ["session", "chatbot.request"],
                  ["trace", "openai.chat.complete"]
                ].map(([key, value]) => (
                  <div className="flex items-center justify-between rounded-xl border border-[#eeeeeb] bg-[#fafafa] px-3 py-2" key={key}>
                    <span className="font-medium">{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#e4e4df] bg-[#fafafa] p-5">
            <div className="rounded-[22px] border border-[#e4e4df] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777a7f]">Investigation path</span>
                <span className="rounded-full bg-[#f1f0ff] px-3 py-1 text-[11px] font-semibold text-[#4f46e5]">4 steps</span>
              </div>
              <div className="mt-4 space-y-3">
                {debugSteps.map(([label, title, detail]) => (
                  <div className="grid grid-cols-[40px_1fr] gap-3" key={label}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f0ff] text-sm font-semibold text-[#4f46e5]">
                      {label}
                    </span>
                    <div className="rounded-xl border border-[#eeeeeb] bg-[#fafafa] p-3">
                      <h3 className="text-sm font-semibold text-[#232323]">{title}</h3>
                      <p className="mt-1.5 text-sm font-normal leading-6 text-[#777a7f]">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#777a7f]">
              {["prompt", "span", "output"].map((item) => (
                <span className="rounded-xl border border-[#e4e4df] bg-white px-3 py-2.5 text-center" key={item}>
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
