import { api } from "./api";

export const aiService = {
  ask: (payload: { provider: "groq" | "gemini"; prompt: string; context: string }) =>
    api.post("/ai/assistant", payload).then((res) => res.data)
};
