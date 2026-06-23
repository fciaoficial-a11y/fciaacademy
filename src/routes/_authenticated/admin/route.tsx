import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  ListTree,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isAdminQuery } from "@/lib/admin-api";

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
  { to: "/admin/usuarios", label: "Usuários", icon: Users, exact: false },
  { to: "/admin/ai-studio", label: "AI Studio", icon: Sparkles, exact: false },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = useQuery(isAdminQuery);

  if (isAdmin.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Admin</div>
        <nav className="mt-3 flex flex-col gap-1">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`inline-flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-white/8 text-foreground ring-1 ring-inset ring-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
}
