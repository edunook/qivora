import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Star, Users } from "lucide-react";
import { examService } from "../services/examService";
import { reviewService } from "../services/reviewService";
import { resultService } from "../services/resultService";
import { useAuthStore } from "../stores/authStore";
import { Loader } from "../components/ui/Loader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ReviewList } from "../components/community/ReviewList";
import { useForm } from "react-hook-form";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";

export function getSubjectTimingStatus(subject: any) {
  if (!subject.startDate || !subject.startTime) {
    return { status: "available" as const, message: "🔓 Available" };
  }

  try {
    const now = new Date();
    const startStr = `${subject.startDate.split("T")[0]}T${subject.startTime}`;
    const start = new Date(startStr);

    if (now < start) {
      const formattedStart = start.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      return { 
        status: "locked" as const, 
        message: `🔒 Locked until ${formattedStart}` 
      };
    }

    if (subject.endDate && subject.endTime) {
      const endStr = `${subject.endDate.split("T")[0]}T${subject.endTime}`;
      const end = new Date(endStr);
      if (now > end) {
        return { status: "expired" as const, message: "❌ Closed / Expired" };
      }
    }

    return { status: "available" as const, message: "🔓 Available" };
  } catch (err) {
    return { status: "available" as const, message: "🔓 Available" };
  }
}

export function ExamDetailsPage() {
  const { examId = "" } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const form = useForm<{ title: string; comment: string; rating: number }>({
    defaultValues: { title: "", comment: "", rating: 5 }
  });

  const query = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => examService.getById(examId)
  });

  const followMutation = useMutation({
    mutationFn: () => examService.followCreator(query.data.exam.creator._id || query.data.exam.creator.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exam", examId] })
  });

  const reviewMutation = useMutation({
    mutationFn: (values: { title: string; comment: string; rating: number }) =>
      reviewService.create(examId, values),
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
    }
  });

  const publishMutation = useMutation({
    mutationFn: () => resultService.publish(examId)
  });

  if (query.isLoading) return <Loader label="Loading exam..." />;
  const { exam, reviews } = query.data;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <img src={exam.banner || exam.thumbnail} alt={exam.title} className="h-72 w-full object-cover" />
        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{exam.category}</p>
              <h2 className="mt-3 text-4xl font-bold text-white">{exam.title}</h2>
              <p className="mt-4 max-w-3xl text-slate-300">{exam.description}</p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => navigate(user ? `/attempt/${exam._id}` : "/login")}>Start exam</Button>
              {(user?.role === "teacher" || user?.role === "organization" || user?.role === "admin") &&
              (user.id === exam.creator.id || user.id === exam.creator._id) ? (
                <Button variant="secondary" onClick={() => publishMutation.mutate()}>
                  Publish results
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="bg-slate-950/60">
              <p className="text-sm text-slate-400">Subjects</p>
              <p className="mt-2 text-3xl font-bold text-white">{exam.subjects.length}</p>
            </Card>
            <Card className="bg-slate-950/60">
              <p className="text-sm text-slate-400">Attempts</p>
              <p className="mt-2 text-3xl font-bold text-white">{exam.attemptsCount}</p>
            </Card>
            <Card className="bg-slate-950/60">
              <p className="text-sm text-slate-400">Average rating</p>
              <p className="mt-2 flex items-center gap-2 text-3xl font-bold text-white">
                <Star className="h-6 w-6 text-amber-300" /> {exam.averageRating.toFixed(1)}
              </p>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <Card>
              <p className="font-semibold text-white">Creator</p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <Link to={`/creators/${exam.creator._id || exam.creator.id}`} className="flex items-center gap-3">
                  <img src={exam.creator.avatar} alt={exam.creator.name} className="h-14 w-14 rounded-3xl object-cover" />
                  <div>
                    <p className="font-semibold text-white">{exam.creator.name}</p>
                    <p className="text-sm text-slate-400">@{exam.creator.username}</p>
                  </div>
                </Link>
                {user ? (
                  <Button variant="secondary" onClick={() => followMutation.mutate()}>
                    <Users className="mr-2 h-4 w-4" />
                    Follow
                  </Button>
                ) : null}
              </div>
            </Card>
            <Card>
              <p className="font-semibold text-white">Security profile</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>Fullscreen: {exam.security.fullscreenEnforced ? "Enabled" : "Disabled"}</li>
                <li>Tab switching detection: {exam.security.detectTabSwitching ? "Enabled" : "Disabled"}</li>
                <li>Violation limit: {exam.security.violationLimit}</li>
                <li>Result mode: {exam.schedule.releaseMode}</li>
              </ul>
            </Card>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <p className="text-lg font-semibold text-white">Subjects and structure</p>
          <div className="mt-4 space-y-4">
            {exam.subjects.map((subject: any) => {
              const timing = getSubjectTimingStatus(subject);
              return (
                <div key={subject._id} className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-white">{subject.title}</p>
                      {timing.status === "available" && (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-300 font-medium">
                          {timing.message}
                        </span>
                      )}
                      {timing.status === "locked" && (
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300 font-medium">
                          {timing.message}
                        </span>
                      )}
                      {timing.status === "expired" && (
                        <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs text-rose-300 font-medium">
                          {timing.message}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      {subject.durationMinutes} min · {subject.questions.length} questions
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{subject.instructions}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <p className="text-lg font-semibold text-white">Add review</p>
            <form className="space-y-3" onSubmit={form.handleSubmit((values) => reviewMutation.mutate(values))}>
              <Input placeholder="Review title" {...form.register("title")} />
              <Input type="number" min={1} max={5} {...form.register("rating", { valueAsNumber: true })} />
              <Textarea rows={4} placeholder="Share your experience" {...form.register("comment")} />
              <Button className="w-full" type="submit">
                Submit review
              </Button>
            </form>
          </Card>
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
