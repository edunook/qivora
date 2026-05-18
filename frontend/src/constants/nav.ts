import { Home, LayoutDashboard, ShieldCheck, Trophy, WandSparkles } from "lucide-react";

export const navigation = [
  { to: "/", label: "Explore", icon: Home },
  { to: "/dashboard", label: "Workspace", icon: LayoutDashboard },
  { to: "/create-exam", label: "Exam Builder", icon: ShieldCheck },
  { to: "/results", label: "Results", icon: Trophy },
  { to: "/ai", label: "AI Assist", icon: WandSparkles }
];
