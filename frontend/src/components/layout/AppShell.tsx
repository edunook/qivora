import { Bell, LogOut, Menu, ShieldCheck } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { navigation } from "../../constants/nav";
import { useAuthStore } from "../../stores/authStore";
import { authService } from "../../services/authService";
import { Button } from "../ui/Button";
import { ToastViewport } from "../ui/ToastViewport";
import { AiAssistantWidget } from "../ai/AiAssistantWidget";
import { useAuthBootstrap } from "../../hooks/useAuthBootstrap";

export function AppShell() {
  useAuthBootstrap();
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();

  async function handleLogout() {
    await authService.logout();
    clearSession();
    navigate("/login");
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[300px_1fr]">
        <aside
          className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] p-6 transition lg:static lg:w-auto lg:translate-x-0 lg:bg-transparent`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold">Qivora</p>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Examination OS</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${isActive ? "bg-gradient-to-r from-violet-600/25 to-cyan-500/20 text-white shadow-[0_12px_40px_rgba(76,29,149,0.16)]" : "text-slate-400 hover:bg-white/5 hover:text-white"}`
                  }
                >
                  <Icon className="h-4 w-4 transition group-hover:scale-110" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(124,58,237,0.08))] p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Account</p>
            <p className="mt-1">{user?.name}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{user?.role}</p>
          </div>
        </aside>

        <main className="min-w-0 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <header className="glass mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="lg:hidden" onClick={() => setOpen((value) => !value)}>
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Production Console</p>
                <h1 className="text-xl font-semibold text-white">Secure examination operations</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => navigate("/notifications")}>
                <Bell className="mr-2 h-4 w-4" />
                Alerts
              </Button>
              <Button variant="secondary" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
      <ToastViewport />
      <AiAssistantWidget />
    </div>
  );
}
