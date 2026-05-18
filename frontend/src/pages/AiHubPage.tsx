import { Card } from "../components/ui/Card";

export function AiHubPage() {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-3xl font-bold text-white">AI Hub</h2>
        <p className="mt-3 max-w-3xl text-slate-300">
          Qivora AI is available from the floating widget across the app. Choose Groq or Gemini, then use it for question explanation, exam authoring assistance, study guidance, or feedback analysis.
        </p>
      </Card>
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          ["Student support", "Explain difficult questions, create revision plans, and summarize weak subject areas."],
          ["Creator support", "Generate question ideas, improve instruction clarity, and review exam difficulty balance."],
          ["Operational support", "Draft result summaries, moderation responses, and institutional comms."]
        ].map(([title, description]) => (
          <Card key={title}>
            <p className="font-semibold text-white">{title}</p>
            <p className="mt-2 text-sm text-slate-400">{description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
