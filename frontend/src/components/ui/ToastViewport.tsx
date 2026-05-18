import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useToastStore } from "../../stores/toastStore";

export function ToastViewport() {
  const { toasts, remove } = useToastStore();

  useEffect(() => {
    const timers = toasts.map((toast) => setTimeout(() => remove(toast.id), 3500));
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(360px,90vw)] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-2xl p-4"
          >
            <p className="font-semibold text-slate-100">{toast.title}</p>
            {toast.description ? <p className="mt-1 text-sm text-slate-400">{toast.description}</p> : null}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
