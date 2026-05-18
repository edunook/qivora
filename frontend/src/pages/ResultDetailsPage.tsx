import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { Loader } from "../components/ui/Loader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { formatSeconds } from "../utils/time";

export function ResultDetailsPage() {
  const { resultId = "" } = useParams();
  const query = useQuery({
    queryKey: ["result", resultId],
    queryFn: async () => {
      const module = await import("../services/resultService");
      return module.resultService.getById(resultId);
    }
  });

  if (query.isLoading) return <Loader label="Loading result..." />;
  if (query.data?.status === "pending") {
    return <EmptyState title="Results are not yet published." description="This exam uses delayed or manual result release." />;
  }

  const result = query.data.result;

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Unified final result</p>
            <h2 className="text-3xl font-bold text-white mt-1">{result.exam.title}</h2>
          </div>
          <Button variant="secondary" onClick={() => window.print()} className="print:hidden">
            <Printer className="mr-2 h-4 w-4" />
            Print scorecard
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6">
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                ["Score", `${result.scoredMarks}/${result.totalMarks}`],
                ["Percentage", `${result.overallPercentage}%`],
                ["Grade", result.overallGrade],
                ["GPA", result.gpa],
                ["Rank", `#${result.rank}`],
                ["Accuracy", `${result.accuracy}%`]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="bg-slate-950/60">
              <p className="font-semibold text-white">Performance analytics</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-sm text-slate-400">Correct</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-300">{result.correctAnswers}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-sm text-slate-400">Wrong</p>
                  <p className="mt-2 text-2xl font-bold text-rose-300">{result.wrongAnswers}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-sm text-slate-400">Unattempted</p>
                  <p className="mt-2 text-2xl font-bold text-slate-200">{result.unattemptedAnswers}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-300">Time spent: {formatSeconds(result.timeSpentSeconds)}</p>
              <p className="mt-2 text-sm text-slate-300">Strong areas: {result.strongSubjects.join(", ") || "None"}</p>
              <p className="mt-2 text-sm text-slate-300">Weak areas: {result.weakSubjects.join(", ") || "None"}</p>
            </Card>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-lg font-semibold text-white">Subject-wise analysis</p>
        <div className="mt-5 grid gap-4">
          {result.subjectStats.map((subject: any) => (
            <div key={subject.subjectId} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{subject.title}</p>
                  <p className="text-sm text-slate-400">
                    {subject.scoredMarks}/{subject.totalMarks} · {subject.grade}
                  </p>
                </div>
                <div className="text-sm text-slate-300">{subject.percentage}%</div>
              </div>
              <div className="mt-4 h-3 rounded-full bg-white/5">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-violet-600 to-cyan-400"
                  style={{ width: `${Math.max(0, Math.min(subject.percentage, 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
