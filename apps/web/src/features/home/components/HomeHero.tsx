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
        <div className="border-x border-b border-black bg-white">
          <img
            className="block h-auto w-full"
            src="/dashboard-preview.svg"
            alt="TraceLLM dashboard showing session details and a trace timeline"
          />
        </div>
      </div>
    </section>
  );
}
