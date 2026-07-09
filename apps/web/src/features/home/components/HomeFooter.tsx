import { docsUrl, webEnv } from "../../../config/env.js";

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Platform", href: "#platform" },
      { label: "Trace Explorer", href: "/app" },
      { label: "Create account", href: "/app" }
    ]
  },
  {
    title: "Developers",
    links: [
      { label: "Docs", href: docsUrl("/") },
      { label: "Node SDK", href: docsUrl("/sdk/node/") },
      { label: "OpenAPI", href: webEnv.openApiUrl }
    ]
  },
  {
    title: "Observability",
    links: [
      { label: "SigNoz", href: docsUrl("/operations/signoz/") },
      { label: "Local setup", href: docsUrl("/getting-started/local-quickstart/") },
      { label: "Configuration", href: docsUrl("/product/customization/") }
    ]
  }
];

export function HomeFooter() {
  return (
    <footer className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="border border-black bg-white p-5 shadow-[8px_8px_0_#111]">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <a
              className="font-mono text-xl font-semibold lowercase tracking-[-0.02em] text-black no-underline"
              href="/"
            >
              tracellm
            </a>
            <p className="mt-4 max-w-sm text-base font-medium leading-7 text-black/60">
              Product-level observability for AI applications, with optional
              OpenTelemetry export.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div className="border border-black bg-[#fbfaf7] p-4" key={group.title}>
                <h3 className="font-mono text-sm font-semibold uppercase tracking-[0.12em] text-black/45">
                  {group.title}
                </h3>
                <div className="mt-4 grid gap-3">
                  {group.links.map((link) => (
                    <a
                      className="font-mono text-sm font-semibold text-black no-underline transition hover:text-black/55 focus:text-black/55 focus:outline-none"
                      href={link.href}
                      key={link.href}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-black pt-4 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-black/45 sm:flex-row sm:items-center sm:justify-between">
          <span>TraceLLM</span>
          <span>Built for production AI workflows</span>
        </div>
      </div>
    </footer>
  );
}
