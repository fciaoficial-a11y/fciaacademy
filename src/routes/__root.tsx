import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/site/SiteHeader";
import { SiteFooter } from "../components/site/SiteFooter";
import { MobileStickyCTA } from "../components/site/MobileStickyCTA";
import { WhatsAppFloat } from "../components/site/WhatsAppFloat";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { ThemeProvider, themeBootScript } from "@/lib/theme";
import { ThemeToggle } from "@/components/ui/theme-toggle";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FCIA Academy — Cursos, Treinamentos e Trilhas" },
      { name: "description", content: "Plataforma FCIA Academy: cursos, treinamentos e trilhas acadêmicas com certificação digital." },
      { name: "author", content: "FCIA Academy" },
      { property: "og:title", content: "FCIA Academy — Cursos, Treinamentos e Trilhas" },
      { property: "og:description", content: "Plataforma FCIA Academy: cursos, treinamentos e trilhas acadêmicas com certificação digital." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FCIA Academy" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FCIA Academy — Cursos, Treinamentos e Trilhas" },
      { name: "twitter:description", content: "Plataforma FCIA Academy: cursos, treinamentos e trilhas acadêmicas com certificação digital." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      {
        rel: "preload",
        as: "image",
        href: "/__l5e/assets-v1/b5f5afd1-e3fc-4189-adc8-e4f239a9b6ca/fcia-logo-full.webp",
        type: "image/webp",
        fetchPriority: "high",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Grotesk:wght@600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const HIDE_CHROME_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/dashboard",
  "/profile",
  "/admin",
  "/evolucao",
  "/settings",
  "/quiz",
  "/curso/",
  "/certificados",
];
const HIDE_STICKY_PREFIXES = ["/inscricao", "/login", "/register", "/forgot-password", "/reset-password", "/dashboard", "/profile", "/admin", "/settings", "/quiz", "/certificados"];

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideChrome = HIDE_CHROME_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
  const hideStickyCTA = HIDE_STICKY_PREFIXES.some((p) => pathname.startsWith(p));


  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  const canGoBack = pathname !== "/";

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          {!hideChrome && <SiteHeader />}
          {canGoBack && (
            <div className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined" && window.history.length > 1) {
                      router.history.back();
                    } else {
                      router.navigate({ to: "/" });
                    }
                  }}
                  aria-label="Voltar"
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  Voltar
                </button>
                <ThemeToggle />
              </div>
            </div>
          )}
          <main className="flex-1">
            <Outlet />
          </main>
          {!hideChrome && <SiteFooter />}
          {!hideChrome && !hideStickyCTA && <div aria-hidden className="h-20 lg:hidden" />}
        </div>
        <WhatsAppFloat />

        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}


