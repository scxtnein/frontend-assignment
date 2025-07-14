import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { routeTree } from './routeTree.gen';
import { AuthProvider } from '@/lib/auth/providers/auth-provider';
import { useAuthProvider } from '@/lib/auth/hooks/use-auth-provider';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';

const InnerApp = () => {
  const auth = useAuthProvider();
  return <RouterProvider router={router} context={{ auth }} />;
};

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: undefined!,
  },
  defaultPreload: 'viewport',
  scrollRestoration: true,

  // We use react-query - we don't want loaders to be stale
  // Ensure loader is always executed when route is preloaded/visited
  defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="system">
        <I18nProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <InnerApp />
            </AuthProvider>
          </QueryClientProvider>
        </I18nProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}
