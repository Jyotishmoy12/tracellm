import { Braces, Check, Eye, EyeOff, GitBranch, KeyRound, LogIn, UserPlus } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { ThemeToggle } from "../../../shared/components/ThemeToggle.js";
import { useLogin, useRegister } from "../hooks/useAuth.js";

type AuthMode = "login" | "register";

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const login = useLogin();
  const register = useRegister();
  const pending = login.isPending || register.isPending;
  const error = login.error?.message ?? register.error?.message;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "login") {
      login.mutate({ email, password });
      return;
    }

    const payload = {
      email,
      password
    };
    const trimmedName = name.trim();
    const trimmedWorkspaceName = workspaceName.trim();

    register.mutate({
      ...payload,
      ...(trimmedName ? { name: trimmedName } : {}),
      ...(trimmedWorkspaceName ? { workspaceName: trimmedWorkspaceName } : {})
    });
  }

  function switchMode(nextMode: AuthMode) {
    login.reset();
    register.reset();
    setMode(nextMode);
  }

  return (
    <main className="marketing-home grid min-h-screen place-items-center bg-[#f5f5f3] px-4 py-6 text-[#232323] sm:py-8">
      <section className="grid w-full max-w-md gap-5 lg:max-w-6xl lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden overflow-hidden rounded-[32px] border border-[#e4e4df] bg-white p-6 shadow-[0_22px_60px_rgba(30,30,30,0.07)] sm:p-8 lg:block">
          <div className="flex items-center justify-between gap-3">
            <a
              className="text-lg font-semibold lowercase tracking-[-0.02em] text-[#232323] no-underline"
              href="/"
            >
              tracellm
            </a>
            <ThemeToggle />
          </div>
          <h1 className="mt-12 max-w-md text-2xl font-semibold leading-tight text-[#232323] sm:text-3xl">
            {mode === "login" ? "Welcome back." : "Create your workspace."}
          </h1>
          <p className="mt-3 max-w-sm text-sm font-normal leading-6 text-[#777a7f]">
            Access your traces, API keys, and project settings.
          </p>

          <div className="mt-10 rounded-[24px] border border-[#e4e4df] bg-[#fafafa] p-4">
            <div className="mb-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#a8abb0]">
                included
              </p>
            </div>
            <div className="grid gap-2">
              {[
                ["API keys", "SDK access"],
                ["Config", "Capture policy"],
                ["Exports", "OTLP"]
              ].map(([title, detail], index) => (
                <div className="grid grid-cols-[34px_1fr] gap-3 rounded-2xl border border-[#e4e4df] bg-white px-3 py-3" key={title}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f1f0ff] text-[#4f46e5]">
                    {index === 0 ? <KeyRound size={14} /> : index === 1 ? <Braces size={14} /> : <GitBranch size={14} />}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-[#232323]">{title}</span>
                    <span className="mt-0.5 block text-xs font-normal text-[#777a7f]">{detail}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-normal text-[#777a7f]">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#f1f0ff] text-[#4f46e5]">
              <Check size={13} />
            </span>
            Secure cookie session.
          </div>
        </aside>

        <section className="rounded-[28px] border border-[#e4e4df] bg-white p-3 shadow-[0_22px_60px_rgba(30,30,30,0.07)] sm:rounded-[32px] sm:p-5">
          <div className="rounded-[24px] border border-[#e4e4df] bg-[#fafafa] p-4 sm:rounded-[26px] sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
              <a
                className="inline-flex text-base font-semibold lowercase tracking-[-0.02em] text-[#232323] no-underline"
                href="/"
              >
                tracellm
              </a>
              <ThemeToggle />
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e4e4df] bg-white text-[#4f46e5] shadow-sm sm:h-12 sm:w-12">
                <KeyRound size={20} />
              </span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#a8abb0]">
                  TraceLLM
                </p>
                <h2 className="mt-1 text-lg font-semibold leading-tight text-[#232323] sm:text-xl">
                  {mode === "login" ? "Welcome back" : "Create account"}
                </h2>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 rounded-2xl border border-[#e4e4df] bg-white p-1 sm:mt-7" role="tablist" aria-label="Authentication mode">
              <button
                className={`min-h-10 rounded-[14px] text-xs font-medium uppercase tracking-[0.08em] transition ${
                  mode === "login" ? "bg-[#232323] text-white" : "text-[#777a7f] hover:bg-[#f7f7f5]"
                }`}
                type="button"
                onClick={() => switchMode("login")}
              >
                Login
              </button>
              <button
                className={`min-h-10 rounded-[14px] text-xs font-medium uppercase tracking-[0.08em] transition ${
                  mode === "register" ? "bg-[#232323] text-white" : "text-[#777a7f] hover:bg-[#f7f7f5]"
                }`}
                type="button"
                onClick={() => switchMode("register")}
              >
                Sign up
              </button>
            </div>

            <form className="mt-6 grid gap-4 sm:mt-7" onSubmit={submit}>
              {mode === "register" ? (
                <>
                  <AuthField label="Name">
                    <input
                      className={inputClassName}
                      value={name}
                      onChange={(event) => setName(event.currentTarget.value)}
                      autoComplete="name"
                      placeholder="Jane Doe"
                    />
                  </AuthField>
                  <AuthField label="Workspace">
                    <input
                      className={inputClassName}
                      value={workspaceName}
                      onChange={(event) => setWorkspaceName(event.currentTarget.value)}
                      autoComplete="organization"
                      placeholder="Acme AI"
                    />
                  </AuthField>
                </>
              ) : null}

              <AuthField label="Email">
                <input
                  className={inputClassName}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
                />
              </AuthField>
              <AuthField label="Password">
                <div className="grid grid-cols-[1fr_48px]">
                  <input
                    className={`${inputClassName} rounded-r-none border-r-0`}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.currentTarget.value)}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    minLength={mode === "register" ? 12 : 1}
                    placeholder={mode === "login" ? "Your password" : "At least 12 characters"}
                    required
                  />
                  <button
                    className="flex h-11 items-center justify-center rounded-r-2xl border border-[#e4e4df] bg-white text-[#777a7f] transition hover:bg-[#f1f0ff] hover:text-[#4f46e5] focus:bg-[#f1f0ff] focus:text-[#4f46e5] focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </AuthField>

              {error ? (
                <p className="rounded-2xl border border-[#ffd6df] bg-[#fff1f5] px-4 py-3 text-sm font-bold text-[#9f1239]">
                  {error}
                </p>
              ) : null}

              <button
                className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#232323] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#4f46e5] focus:bg-[#4f46e5] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={pending}
              >
                {mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
                {pending ? "Working" : mode === "login" ? "Login" : "Create account"}
              </button>
            </form>
          </div>
        </section>
      </section>
    </main>
  );
}

const inputClassName =
  "h-11 w-full rounded-2xl border border-[#e4e4df] bg-white px-4 text-sm font-normal text-[#232323] outline-none transition placeholder:text-[#a8abb0] focus:border-[#d9d6ff] focus:shadow-[0_0_0_4px_rgba(241,240,255,0.85)]";

function AuthField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#a8abb0]">
        {label}
      </span>
      {children}
    </label>
  );
}
