import { docsUrl, webEnv } from "../../../config/env.js";
import { ThemeToggle } from "../../../shared/components/ThemeToggle.js";

const navLinks = [
  { label: "Platform", href: "#platform" },
  { label: "SDK", href: docsUrl("/sdk/node/") },
  { label: "Docs", href: docsUrl("/") },
  { label: "API", href: webEnv.openApiUrl }
];

const externalLinks = [
  { label: "GitHub", href: "https://github.com/Jyotishmoy12/tracellm" },
  { label: "npm", href: "https://www.npmjs.com/package/@use-tracellm/sdk-node" }
];

export function HomeHeader() {
  return (
    <header className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-3 rounded-[28px] border border-[#e4e4df] bg-white/88 p-2 shadow-sm backdrop-blur lg:grid-cols-[auto_1fr_auto] lg:items-center lg:rounded-full lg:px-4 lg:py-3">
        <div className="flex items-center justify-between gap-3 px-2 lg:px-0">
        <a
          className="text-lg font-semibold lowercase text-[#232323] no-underline transition hover:text-[#4f46e5] focus:text-[#4f46e5] focus:outline-none"
          href="/"
          aria-label="TraceLLM home"
        >
          tracellm
        </a>
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <a
              className="inline-flex min-h-9 items-center justify-center rounded-full bg-[#232323] px-4 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-white no-underline transition hover:bg-[#4f46e5] focus:bg-[#4f46e5] focus:outline-none"
              href="/app"
            >
              Create
            </a>
          </div>
        </div>

        <nav
          className="flex items-center gap-1 overflow-x-auto rounded-full bg-[#fafafa] p-1 lg:justify-center lg:bg-transparent lg:p-0"
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => (
            <a
              className="rounded-full px-3 py-2 text-center text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[#777a7f] no-underline transition hover:bg-[#f1f0ff] hover:text-[#232323] focus:bg-[#f1f0ff] focus:text-[#232323] focus:outline-none"
              key={link.href}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-1 lg:flex lg:justify-end">
          <ThemeToggle />
          {externalLinks.map((link) => (
            <a
              className="inline-flex min-h-9 items-center justify-center rounded-full px-3 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[#777a7f] no-underline transition hover:bg-[#f7f7f5] hover:text-[#232323] focus:bg-[#f7f7f5] focus:text-[#232323] focus:outline-none"
              href={link.href}
              key={link.href}
              rel="noreferrer"
              target="_blank"
            >
              {link.label}
            </a>
          ))}
          <a
            className="inline-flex min-h-9 items-center justify-center rounded-full px-3 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[#232323] no-underline transition hover:bg-[#f1f0ff] focus:bg-[#f1f0ff] focus:outline-none"
            href="/app"
          >
            Sign in
          </a>
          <a
            className="inline-flex min-h-9 items-center justify-center rounded-full bg-[#232323] px-4 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-white no-underline transition hover:bg-[#4f46e5] focus:bg-[#4f46e5] focus:outline-none"
            href="/app"
          >
            Create account
          </a>
        </div>
      </div>
    </header>
  );
}
