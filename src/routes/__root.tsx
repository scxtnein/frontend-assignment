import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { QueryClient } from '@tanstack/react-query';
import type { AuthContext } from '@/lib/auth/providers/auth-provider';
import { Toaster } from '@/shared/components/ui/sonner';

interface RouteContext {
  queryClient: QueryClient;
  auth: AuthContext;
}

export const Route = createRootRouteWithContext<RouteContext>()({
  component: () => (
    <>
      <Outlet />
      {import.meta.env.DEBUG === 'true' && (
        <>
          <ReactQueryDevtools buttonPosition='bottom-right' />
          <TanStackRouterDevtools />
        </>
      )}
      <Toaster />
    </>
  ),
});
