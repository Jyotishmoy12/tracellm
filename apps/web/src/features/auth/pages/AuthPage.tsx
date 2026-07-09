import { Eye, EyeOff, KeyRound, LogIn, UserPlus } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
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
    <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-4 py-10 text-black">
      <section className="grid w-full max-w-5xl gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="border border-black bg-black p-6 text-white shadow-[10px_10px_0_#111] sm:p-8">
          <a
            className="font-mono text-xl font-semibold lowercase tracking-[-0.02em] text-white no-underline"
            href="/"
          >
            tracellm
          </a>
          <p className="mt-10 font-mono text-sm font-semibold uppercase tracking-[0.16em] text-white/45">
            Account access
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] text-white sm:text-5xl">
            {mode === "login" ? "Continue tracing your AI." : "Create your TraceLLM workspace."}
          </h1>
          <p className="mt-5 text-lg font-medium leading-8 text-white/60">
            Project API keys, capture policy, sessions, spans, errors, and OTLP
            export all live behind your workspace.
          </p>

          <div className="mt-10 grid gap-3 font-mono text-sm">
            {["project-scoped keys", "http-only session cookie", "config-driven SDK"].map((item) => (
              <div className="flex items-center justify-between border border-white/20 bg-white/[0.06] px-4 py-3" key={item}>
                <span>{item}</span>
                <span className="text-white/40">ready</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="border border-black bg-white p-5 shadow-[10px_10px_0_#111] sm:p-6">
          <div className="border border-black bg-[#fbfaf7] p-5 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center border border-black bg-white">
                <KeyRound size={20} />
              </span>
              <div>
                <p className="font-mono text-sm font-semibold uppercase tracking-[0.16em] text-black/45">
                  TraceLLM
                </p>
                <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-0.03em]">
                  {mode === "login" ? "Welcome back" : "Create account"}
                </h2>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 border border-black bg-white" role="tablist" aria-label="Authentication mode">
              <button
                className={`min-h-11 border-r border-black font-mono text-xs font-semibold uppercase tracking-[0.1em] transition ${
                  mode === "login" ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
                }`}
                type="button"
                onClick={() => switchMode("login")}
              >
                Login
              </button>
              <button
                className={`min-h-11 font-mono text-xs font-semibold uppercase tracking-[0.1em] transition ${
                  mode === "register" ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
                }`}
                type="button"
                onClick={() => switchMode("register")}
              >
                Sign up
              </button>
            </div>

            <form className="mt-7 grid gap-4" onSubmit={submit}>
              {mode === "register" ? (
                <>
                  <AuthField label="Name">
                    <input
                      className={inputClassName}
                      value={name}
                      onChange={(event) => setName(event.currentTarget.value)}
                      autoComplete="name"
                    />
                  </AuthField>
                  <AuthField label="Workspace">
                    <input
                      className={inputClassName}
                      value={workspaceName}
                      onChange={(event) => setWorkspaceName(event.currentTarget.value)}
                      autoComplete="organization"
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
                  required
                />
              </AuthField>
              <AuthField label="Password">
                <div className="grid grid-cols-[1fr_48px]">
                  <input
                    className={`${inputClassName} border-r-0`}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.currentTarget.value)}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    minLength={mode === "register" ? 12 : 1}
                    required
                  />
                  <button
                    className="flex h-12 items-center justify-center border border-black bg-white text-black transition hover:bg-black hover:text-white focus:bg-black focus:text-white focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </AuthField>

              {error ? (
                <p className="border border-black bg-white px-4 py-3 font-mono text-sm font-semibold text-black">
                  {error}
                </p>
              ) : null}

              <button
                className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 border border-black bg-black px-5 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
  "h-12 w-full border border-black bg-white px-4 font-mono text-sm text-black outline-none transition focus:shadow-[4px_4px_0_#111]";

function AuthField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-black/55">
        {label}
      </span>
      {children}
    </label>
  );
}
