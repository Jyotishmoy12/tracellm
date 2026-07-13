export function HomeHero() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-20 pt-12 text-center sm:px-6 lg:px-8 lg:pt-16">
      <h1 className="mt-16 max-w-5xl text-6xl font-extrabold leading-[0.95] tracking-[-0.045em] text-black sm:text-7xl lg:text-8xl">
        Understand what your AI is doing.
      </h1>
      <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-black/58 sm:text-xl">
        Trace prompts, spans, tokens, errors, and model calls.
      </p>

      <div className="mt-16 w-full border border-black bg-white p-3 shadow-[12px_12px_0_#111]">
        <div className="grid min-h-12 grid-cols-1 items-center gap-3 border border-black bg-[#fbfaf7] px-4 py-3 text-left md:grid-cols-[auto_1fr_auto]">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 border border-black bg-black" />
            <span className="h-3 w-3 border border-black bg-white" />
            <span className="h-3 w-3 border border-black bg-white" />
          </div>
          <div className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-black/55">
            app.tracellm.dev/sessions
          </div>
          <div className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-black/55">
            live trace
          </div>
        </div>

        <div className="grid border-x border-b border-black bg-white text-left lg:grid-cols-[240px_1fr]">
          <aside className="hidden border-r border-black bg-[#fbfaf7] p-5 lg:block">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <div className="text-3xl font-black tracking-[-0.04em] text-black">tracellm</div>
                <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black/48">
                  AI observability
                </div>
              </div>
              <div className="grid h-9 w-9 place-items-center border border-black bg-white font-mono text-xs font-bold shadow-[3px_3px_0_#111]">
                //
              </div>
            </div>

            <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
              Explore
            </div>
            <nav className="grid gap-2">
              {["Home", "Traces", "Config", "API Keys", "Exports"].map((item) => (
                <div
                  className={`flex items-center justify-between border border-black px-3 py-2.5 font-mono text-[11px] font-bold uppercase ${
                    item === "Traces" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                  key={item}
                >
                  <span>{item}</span>
                  <span>{item === "Traces" ? "on" : "go"}</span>
                </div>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 bg-white">
            <div className="flex flex-col gap-4 border-b border-black bg-white p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-black/52">
                  LLM observability
                </div>
                <div className="mt-1 text-3xl font-black tracking-[-0.04em] text-black">Trace Explorer</div>
              </div>
              <div className="flex gap-2">
                <div className="grid h-11 w-11 place-items-center border border-black bg-black text-white shadow-[3px_3px_0_#111]">
                  R
                </div>
                <div className="grid h-11 w-11 place-items-center border border-black bg-white text-black shadow-[3px_3px_0_#111]">
                  E
                </div>
              </div>
            </div>

            <div className="grid min-h-[560px] lg:grid-cols-[310px_1fr]">
              <div className="border-b border-black bg-[#fbfaf7] p-5 lg:border-b-0 lg:border-r">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black/50">
                      Sessions
                    </div>
                    <div className="text-3xl font-black tracking-[-0.04em] text-black">Live traces</div>
                  </div>
                  <div className="border border-black bg-white px-3 py-2 font-mono text-sm font-bold shadow-[3px_3px_0_#111]">
                    3
                  </div>
                </div>

                <div className="mb-4 border border-black bg-white px-3 py-3 font-mono text-xs font-semibold text-black/52">
                  Search sessions
                </div>

                <div className="mb-5 grid grid-cols-3 border border-black text-center font-mono text-[10px] font-bold uppercase">
                  <div className="bg-black px-2 py-2 text-white">all</div>
                  <div className="border-l border-black bg-white px-2 py-2 text-black">ok</div>
                  <div className="border-l border-black bg-white px-2 py-2 text-black">error</div>
                </div>

                <div className="grid gap-3">
                  {[
                    ["OpenAI chatbot trace", "4.82s · 27 tokens", "ok"],
                    ["Agent workflow", "1.31s · 64 tokens", "ok"],
                    ["Retrieval answer", "823ms · 18 tokens", "ok"]
                  ].map(([title, meta, status], index) => (
                    <div
                      className={`border border-black p-4 shadow-[4px_4px_0_#111] ${
                        index === 0 ? "bg-black text-white" : "bg-white text-black"
                      }`}
                      key={title}
                    >
                      <div className="text-lg font-black tracking-[-0.03em]">{title}</div>
                      <div className={`mt-3 font-mono text-xs ${index === 0 ? "text-white/75" : "text-black/60"}`}>
                        {meta}
                      </div>
                      <div
                        className={`mt-4 inline-flex border px-3 py-1 font-mono text-[10px] font-bold uppercase ${
                          index === 0 ? "border-white bg-white text-black" : "border-black bg-[#fbfaf7] text-black"
                        }`}
                      >
                        {status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="min-w-0 p-5">
                <div className="mb-5 border border-black bg-white p-5 shadow-[5px_5px_0_#111]">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-black/52">
                        Session detail
                      </div>
                      <div className="mt-1 text-3xl font-black tracking-[-0.04em] text-black">
                        OpenAI chatbot trace
                      </div>
                    </div>
                    <div className="border border-black bg-[#fbfaf7] px-3 py-1 font-mono text-[10px] font-black uppercase text-black">
                      ok
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    {[
                      ["Latency", "4.82s"],
                      ["Spans", "1"],
                      ["Tokens", "27"],
                      ["Errors", "0"]
                    ].map(([label, value]) => (
                      <div className="border border-black bg-[#fbfaf7] p-3" key={label}>
                        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-black/52">
                          {label}
                        </div>
                        <div className="mt-2 text-xl font-black text-black">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-black bg-white p-5 shadow-[5px_5px_0_#111]">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="text-3xl font-black tracking-[-0.04em] text-black">Timeline</div>
                    <div className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-black/52">4 records</div>
                  </div>

                  <div className="grid gap-3">
                    {[
                      ["provider.request.started", "gpt-4.1-mini request started", "event"],
                      ["openai.chat.complete", "assistant response captured with usage", "llm"],
                      ["project.export.sent", "forwarded to SigNoz OTLP destination", "export"]
                    ].map(([name, title, kind], index) => (
                      <div
                        className={`grid gap-2 border border-black p-4 ${
                          index === 1 ? "bg-black text-white" : "bg-[#fbfaf7] text-black"
                        }`}
                        key={name}
                      >
                        <div className={`font-mono text-[11px] font-bold ${index === 1 ? "text-white/65" : "text-black/52"}`}>
                          {name}
                        </div>
                        <div className="text-lg font-black tracking-[-0.03em]">{title}</div>
                        <div
                          className={`w-fit border px-2 py-1 font-mono text-[10px] font-black uppercase ${
                            index === 1 ? "border-white text-white" : "border-black text-black"
                          }`}
                        >
                          {kind}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {["Capture policy", "Redaction", "OTLP exports"].map((item) => (
                    <div className="border border-black bg-[#fbfaf7] p-3 font-mono text-[11px] font-black uppercase tracking-[0.08em] text-black" key={item}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
