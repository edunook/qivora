import axios from "axios";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

type Provider = "groq" | "gemini";

export async function askAi(provider: Provider, prompt: string, context: string) {
  if (provider === "groq") {
    if (!env.GROQ_API_KEY) {
      throw new AppError("Groq API key is missing", 400);
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are Qivora AI, an examination assistant that helps students revise and helps creators improve assessments."
          },
          {
            role: "user",
            content: `${context}\n\n${prompt}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${env.GROQ_API_KEY}`
        }
      }
    );

    return response.data.choices?.[0]?.message?.content || "No response from Groq.";
  }

  if (!env.GEMINI_API_KEY) {
    throw new AppError("Gemini API key is missing", 400);
  }

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [
            {
              text: `You are Qivora AI, an examination platform copilot.\n${context}\n\n${prompt}`
            }
          ]
        }
      ]
    }
  );

  return (
    response.data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("\n") ||
    "No response from Gemini."
  );
}
