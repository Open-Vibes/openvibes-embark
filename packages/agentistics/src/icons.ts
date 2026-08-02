import {
  createIcons,
  Zap,
  DollarSign,
  Bot,
  CalendarDays,
  BarChart3,
  ShieldCheck,
  Telescope,
  FileText,
  Flame,
  Users,
  Terminal,
  GitCompare,
  GitBranch,
  EyeOff,
  Type,
  Network,
} from "lucide";

export function initIcons(): void {
  createIcons({
    icons: {
      Zap,
      DollarSign,
      Bot,
      CalendarDays,
      BarChart3,
      ShieldCheck,
      Telescope,
      FileText,
      Flame,
      Users,
      Terminal,
      GitCompare,
      GitBranch,
      EyeOff,
      Type,
      Network,
    },
    attrs: {
      "stroke-width": "1.75",
      class: "lucide-icon",
    },
  });
}
