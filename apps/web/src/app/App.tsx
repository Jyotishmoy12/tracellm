import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
      <AppContent />
    </QueryClientProvider>
  );
}

function AppContent() {
  const path = window.location.pathname;

  if (path === "/") {
    return <HomePage />;
  }

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
