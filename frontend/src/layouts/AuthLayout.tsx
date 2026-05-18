import { Outlet } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.16),transparent_20%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.24),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.12),transparent_28%)]" />
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/85 shadow-[0_30px_120px_rgba(15,23,42,0.65)] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="hidden border-r border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.35),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.18),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.95))] p-12 lg:block">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 shadow-[0_12px_40px_rgba(34,211,238,0.12)]">
            <ShieldCheck className="h-8 w-8 text-cyan-300" />
          </div>
          <h1 className="mt-10 max-w-xl text-5xl font-black tracking-tight text-white">
            Launch secure digital assessments with a premium institutional experience.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            Qivora connects exam authoring, proctored delivery, delayed or instant results, creator discovery, and AI copilots in one production stack.
          </p>
          <div className="mt-10 grid gap-4">
            {[
              "Multi-subject exam orchestration with result release control",
              "Live browser-based anti-cheat monitoring with stored violations",
              "Groq and Gemini copilots for students and creators"
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.96))] p-6 sm:p-10 lg:p-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
