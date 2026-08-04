import { docsUrl } from "../../../config/env.js";

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[30px] border border-[#e4e4df] bg-white p-6 shadow-[0_18px_44px_rgba(30,30,30,0.06)] sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a8abb0]">Start tracing</p>
            <h2 className="mt-2 max-w-2xl text-xl font-semibold leading-tight text-[#232323] sm:text-2xl">
              Make your next AI bug inspectable.
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-normal leading-6 text-[#777a7f]">
              Create a project, copy an API key, install the SDK, and watch real traces appear in TraceLLM.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-80 lg:grid-cols-1">
            <a
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#232323] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white no-underline transition hover:bg-[#4f46e5] focus:bg-[#4f46e5] focus:outline-none"
              href="/app"
            >
              Create account
            </a>
            <a
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#e4e4df] bg-[#fafafa] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-[#232323] no-underline transition hover:bg-[#f1f0ff] focus:bg-[#f1f0ff] focus:outline-none"
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
