import {
  Bot,
  Brain,
  Code2,
  DollarSign,
  Rocket,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Bot,
  Brain,
  Code2,
  DollarSign,
  Rocket,
  Sparkles,
  TrendingUp,
};

export function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Sparkles;
  return map[name] ?? Sparkles;
}
