import { docsUrl, webEnv } from "../../../config/env.js";

const navLinks = [
  { label: "Platform", href: "#platform" },
  { label: "SDK", href: docsUrl("/sdk/node/") },
  { label: "Docs", href: docsUrl("/") },
  { label: "API", href: webEnv.openApiUrl }
];

export function HomeHeader() {
  return (
    <header className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
        <a
          className="font-mono text-lg font-semibold lowercase tracking-[-0.02em] text-black no-underline transition hover:text-black/60 focus:text-black/60 focus:outline-none lg:justify-self-start"
          href="/"
          aria-label="TraceLLM home"
        >
          tracellm
        </a>

        <nav
          className="grid w-full max-w-sm grid-cols-4 border border-black bg-white lg:w-auto"
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => (
            <a
              className="border-l border-black px-3 py-2 text-center font-mono text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-black/70 no-underline transition first:border-l-0 hover:bg-black hover:text-white focus:bg-black focus:text-white focus:outline-none"
              key={link.href}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="grid w-full max-w-sm grid-cols-2 border border-black bg-white lg:w-auto lg:justify-self-end">
          <a
            className="inline-flex min-h-9 items-center justify-center border-r border-black px-3 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-black no-underline transition hover:bg-black hover:text-white focus:bg-black focus:text-white focus:outline-none"
            href="/app"
          >
            Sign in
          </a>
          <a
            className="inline-flex min-h-9 items-center justify-center bg-black px-3 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-white no-underline transition hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none"
            href="/app"
          >
            Create account
          </a>
        </div>
      </div>
    </header>
  );
}
