import { docsUrl } from "../../../config/env.js";

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="border border-black bg-black p-5 text-white shadow-[12px_12px_0_#111] sm:p-8">
        <div className="grid gap-8 border border-white/20 bg-black p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.16em] text-white/45">
              Start tracing
            </p>
            <h2 className="mt-4 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl">
              Make your next AI bug inspectable.
            </h2>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-white/60">
              Create a project, copy an API key, install the SDK, and watch real
              traces appear in TraceLLM.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-80 lg:grid-cols-1">
            <a
              className="inline-flex min-h-12 items-center justify-center border border-white bg-white px-5 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-black no-underline transition hover:bg-black hover:text-white focus:bg-black focus:text-white focus:outline-none"
              href="/app"
            >
              Create account
            </a>
            <a
              className="inline-flex min-h-12 items-center justify-center border border-white px-5 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-white no-underline transition hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none"
              href={docsUrl("/sdk/node/")}
            >
              Read SDK docs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
