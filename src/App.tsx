import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">오류가 발생했습니다</h1>
        <p className="text-gray-400 mb-6">
          {error?.message || "알 수 없는 오류가 발생했습니다."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}

const App = () => (
  <Sentry.ErrorBoundary fallback={<ErrorFallback error={new Error("Unknown error")} />}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </Sentry.ErrorBoundary>
);

export default App;
