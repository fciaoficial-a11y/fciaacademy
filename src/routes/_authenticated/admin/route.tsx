import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Award,
  BookOpen,
  CreditCard,
  ExternalLink,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  ListTree,
  Loader2,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  User2,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isAdminQuery } from "@/lib/admin-api";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/login" });
    const { data, error } = await (supabase as any).rpc("has_role", {
      _user_id: u.user.id,
      _role: "admin",
    });
    if (error || !data) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [{ title: "Admin — FCIA Academy" }],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/admin/trilhas", label: "Trilhas", icon: ListTree, exact: false },
  { to: "/admin/cursos", label: "Cursos", icon: BookOpen, exact: false },
  { to: "/admin/modulos", label: "Módulos", icon: GraduationCap, exact: false },
  { to: "/admin/questoes", label: "Questões", icon: ListChecks, exact: false },
  { to: "/admin/certificados", label: "Certificados", icon: Award, exact: false },
  { to: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard, exact: false },
  { to: "/admin/usuarios", label: "Usuários", icon: Users, exact: false },
  { to: "/admin/ai-studio", label: "AI Studio", icon: Sparkles, exact: false },
  { to: "/admin/gerar-curso", label: "Gerar curso IA", icon: Sparkles, exact: false },
  { to: "/admin/senha", label: "Trocar senha", icon: KeyRound, exact: false },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAdmin = useQuery(isAdminQuery);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!mounted || !u.user) return;
      setEmail(u.user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", u.user.id)
        .maybeSingle();
      if (mounted) setName(data?.full_name ?? u.user.email?.split("@")[0] ?? "Admin");
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Você saiu da plataforma.");
    navigate({ to: "/login", replace: true });
  }

  if (isAdmin.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const initials = (name || "A")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((n) => {
        const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
        const Icon = n.icon;
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            className={`inline-flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-primary/10 text-foreground ring-1 ring-inset ring-primary/30"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-white/10 bg-background p-0">
                <SheetTitle className="sr-only">Menu administrativo</SheetTitle>
                <div className="flex h-14 items-center gap-2 border-b border-white/5 px-4">
                  <Logo size={28} />
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Admin</span>
                </div>
                <div className="p-3">
                  <SidebarNav onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/admin" className="flex items-center gap-2.5">
              <Logo size={30} />
            </Link>
            <span className="hidden items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-primary sm:inline-flex">
              <Shield className="h-3 w-3" />
              Admin
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden gap-2 text-muted-foreground hover:text-foreground sm:inline-flex">
              <Link to="/dashboard">
                <ExternalLink className="h-4 w-4" />
                Ver plataforma
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 rounded-full px-2 hover:bg-white/5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground">
                    {initials || <User2 className="h-4 w-4" />}
                  </div>
                  <span className="hidden text-sm font-medium sm:inline">{name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="text-sm font-medium">{name}</span>
                  <span className="text-xs text-muted-foreground">{email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="sm:hidden">
                  <Link to="/dashboard">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver plataforma
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 px-4 py-6 md:px-6 lg:grid lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">Admin</div>
          <SidebarNav />
        </aside>
        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
