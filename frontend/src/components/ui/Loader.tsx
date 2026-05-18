export function Loader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-5 py-3 text-sm text-slate-300">
        <span className="h-3 w-3 animate-pulse rounded-full bg-cyan-400" />
        {label}
      </div>
    </div>
  );
}
