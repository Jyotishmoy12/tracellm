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
      { label: "OpenAPI", href: webEnv.openApiUrl },
      { label: "GitHub", href: "https://github.com/Jyotishmoy12/tracellm", external: true },
      { label: "npm package", href: "https://www.npmjs.com/package/@use-tracellm/sdk-node", external: true }
    ]
  },
  {
    title: "Observability",
    links: [
      { label: "SigNoz", href: docsUrl("/operations/signoz/") },
      { label: "External exports", href: docsUrl("/operations/external-otlp-exports/") },
      { label: "Configuration", href: docsUrl("/product/customization/") }
    ]
  }
];

export function HomeFooter() {
  return (
    <footer className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="rounded-[30px] border border-[#e4e4df] bg-white p-6 shadow-[0_18px_44px_rgba(30,30,30,0.06)]">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <a className="text-lg font-semibold lowercase text-[#232323] no-underline" href="/">
              tracellm
            </a>
            <p className="mt-3 max-w-sm text-sm font-normal leading-6 text-[#777a7f]">
              Product-level observability for AI applications, with optional OpenTelemetry export.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {footerGroups.map((group, index) => (
              <div
                className="rounded-[22px] border border-[#e4e4df] bg-[#fafafa] p-5"
                key={group.title}
              >
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777a7f]">{group.title}</h3>
                <div className="mt-4 grid gap-2.5">
                  {group.links.map((link) => (
                    <a
                      className="text-sm font-normal leading-6 text-[#232323] no-underline transition hover:text-[#4f46e5] focus:text-[#4f46e5] focus:outline-none"
                      href={link.href}
                      key={link.href}
                      rel={"external" in link && link.external ? "noreferrer" : undefined}
                      target={"external" in link && link.external ? "_blank" : undefined}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-[#e4e4df] pt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#a8abb0] sm:flex-row sm:items-center sm:justify-between">
          <span>TraceLLM</span>
          <span>Built for production AI workflows</span>
        </div>
      </div>
    </footer>
  );
}
