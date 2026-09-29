import { QueryClient } from '@tanstack/react-query';

/**
 * Factory to create a new QueryClient configured with sensible defaults:
 * - staleTime: 30s (avoids immediate aggressive refetching while keeping data fresh)
 * - retry: 1 (retry failed network requests once before erroring)
 * - refetchOnWindowFocus: false (prevents background refetches when toggling tabs)
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Standard Next.js App Router query client singleton getter.
 * On server: creates a new client per request.
 * On browser: creates a singleton client and reuses it across renders.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: keep existing query client or create new one
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export const queryClient = getQueryClient();

export default queryClient;
