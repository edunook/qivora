import { forwardRef } from "react";
import { cn } from "../../utils/cn";

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, Props>(function Select({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60",
        className
      )}
      {...props}
    />
  );
});
