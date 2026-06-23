import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, LayoutDashboard, Sparkles, User2, UserCog, BookOpen, Award, Zap, Shield, Crown } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { registerDailyLogin } from "@/lib/gamification";
import { isAdminQuery } from "@/lib/admin-api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const baseNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trilhas", label: "Trilhas", icon: BookOpen },
  { to: "/evolucao", label: "Evolução", icon: Zap },
  { to: "/certificados", label: "Certificados", icon: Award },
  { to: "/planos", label: "Planos", icon: Crown },
  { to: "/profile", label: "Perfil", icon: UserCog },
] as const;
const adminNav = { to: "/admin", label: "Admin", icon: Shield } as const;

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>("");
  const isAdmin = useQuery(isAdminQuery);
  const navItems = isAdmin.data ? [...baseNav, adminNav] : baseNav;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!mounted || !userData.user) return;
      setEmail(userData.user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (mounted) setProfile(data ?? null);
      registerDailyLogin()
        .then((res) => {
          if (res && res.awarded > 0) {
            toast.success(`+${res.awarded} XP por login diário! 🔥 Streak: ${res.new_streak}`);
          }
        })
        .catch(() => {});
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Você saiu da plataforma.");
    navigate({ to: "/login", replace: true });
  }

  const displayName = profile?.full_name ?? email.split("@")[0] ?? "Você";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground ring-glow">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-[15px] font-semibold tracking-tight">
              FCIA<span className="text-muted-foreground/50">/</span>
              <span className="font-medium text-muted-foreground">Academy</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-colors ${
                    active
                      ? "bg-white/8 text-foreground ring-1 ring-inset ring-primary/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 rounded-full px-2 hover:bg-white/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground">
                  {initials || <User2 className="h-4 w-4" />}
                </div>
                <span className="hidden text-sm font-medium sm:inline">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">{email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
