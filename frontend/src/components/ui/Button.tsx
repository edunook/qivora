import { forwardRef } from "react";
import { cn } from "../../utils/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", ...props },
  ref
) {
  const variants = {
    primary:
      "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-[0_14px_40px_rgba(76,29,149,0.35)] hover:brightness-110",
    secondary: "glass text-slate-100 hover:border-cyan-400/40 hover:bg-slate-900/70",
    ghost: "bg-transparent text-slate-300 hover:bg-white/5",
    danger: "bg-rose-600 text-white hover:bg-rose-500"
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
