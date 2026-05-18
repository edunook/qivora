import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpenCheck, Clock3, ShieldAlert, Trophy } from "lucide-react";
import { examService } from "../services/examService";
import { resultService } from "../services/resultService";
import { useAuthStore } from "../stores/authStore";
import { Card } from "../components/ui/Card";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const examsQuery = useQuery({ queryKey: ["dashboard-exams"], queryFn: () => examService.list() });
  const resultsQuery = useQuery({ queryKey: ["dashboard-results"], queryFn: resultService.mine, enabled: !!user });

  const stats = useMemo(() => {
    const exams = examsQuery.data?.exams || [];
    const results = resultsQuery.data?.results || [];

    return [
      { label: "Public exams", value: exams.length, icon: BookOpenCheck },
      { label: "Results received", value: results.length, icon: Trophy },
      {
        label: "Published results",
        value: results.filter((result: any) => result.resultStatus === "published").length,
        icon: Clock3
      },
      {
        label: "Flagged attempts",
        value: results.filter((result: any) => result.isCheated).length,
        icon: ShieldAlert
      }
    ];
  }, [examsQuery.data, resultsQuery.data]);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-4 md:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <Icon className="h-6 w-6 text-cyan-300" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <p className="text-sm font-semibold text-white">Role-aware workspace</p>
          <p className="mt-2 text-sm text-slate-400">
            Students can attempt exams and track outcomes. Teachers and organizations can build multi-subject exams and manage result release. Admins can moderate the entire platform.
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-white">AI enabled</p>
          <p className="mt-2 text-sm text-slate-400">
            Qivora AI is already connected to Groq and Gemini through backend routes. Add your API keys to the backend environment and the assistant becomes live instantly.
          </p>
        </Card>
      </div>
    </div>
  );
}
