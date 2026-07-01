import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Sensible SWR defaults: keep data warm across quick navigations
        staleTime: 60_000, // 1 min — most data is fine for a minute
        gcTime: 5 * 60_000, // 5 min in cache after unmount
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: 1,
      },
      mutations: { retry: 0 },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Prefetch on hover/touch for instant navigation
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    // Query owns freshness — router should not cache preloads
    defaultPreloadStaleTime: 0,
    defaultPendingMs: 200,
    defaultPendingMinMs: 300,
  });

  return router;
};
