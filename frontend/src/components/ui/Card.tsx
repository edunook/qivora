import { cn } from "../../utils/cn";

export function Card({
  className,
  children
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("glass rounded-3xl p-5 glow", className)}>{children}</div>;
}
