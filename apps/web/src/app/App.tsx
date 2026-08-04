import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router-dom";
import { AuthPage } from "../features/auth/pages/AuthPage.js";
import { HomePage } from "../features/home/pages/HomePage.js";
import { SessionsPage } from "../features/sessions/pages/SessionsPage.js";
import { useMe } from "../features/auth/hooks/useAuth.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5_000
    }
  }
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/app/*" element={<ProtectedApp />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </QueryClientProvider>
  );
}

function ProtectedApp() {
  const meQuery = useMe();

  if (meQuery.isLoading) {
    return (
      <main className="auth-shell">
        <section className="auth-panel">Loading session...</section>
      </main>
    );
  }

  if (meQuery.isError || !meQuery.data) {
    return <AuthPage />;
  }

  return <SessionsPage session={meQuery.data} />;
}
