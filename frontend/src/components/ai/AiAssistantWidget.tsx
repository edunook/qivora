import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WandSparkles, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { aiService } from "../../services/aiService";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { useAuthStore } from "../../stores/authStore";

export function AiAssistantWidget() {
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<"groq" | "gemini">("groq");
  const [prompt, setPrompt] = useState("");

  const mutation = useMutation({
    mutationFn: aiService.ask
  });

  if (!user) return null;

  return (
    <>
      <Button
        className="fixed bottom-5 right-5 z-40 rounded-full px-5 py-3"
        onClick={() => setOpen((value) => !value)}
      >
        <WandSparkles className="mr-2 h-4 w-4" />
        AI
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-24 right-5 z-40 w-[min(420px,calc(100vw-2rem))]"
          >
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Qivora AI</p>
                  <p className="text-xs text-slate-400">Use your free Groq or Gemini API keys from the backend env.</p>
                </div>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Select value={provider} onChange={(event) => setProvider(event.target.value as "groq" | "gemini")}>
                <option value="groq">Groq</option>
                <option value="gemini">Gemini</option>
              </Select>

              <Textarea
                rows={5}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Ask for question explanations, exam improvement suggestions, study plans, or creator-side question generation guidance."
              />

              <Button
                className="w-full"
                onClick={() =>
                  mutation.mutate({
                    provider,
                    prompt,
                    context: `Current user role: ${user.role}. Platform: secure examination ecosystem.`
                  })
                }
                disabled={!prompt.trim() || mutation.isPending}
              >
                {mutation.isPending ? "Thinking..." : "Ask AI"}
              </Button>

              {mutation.data?.reply ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200">
                  {mutation.data.reply}
                </div>
              ) : null}
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
