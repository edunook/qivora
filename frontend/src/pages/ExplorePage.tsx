import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Star, Timer } from "lucide-react";
import { examService } from "../services/examService";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Loader } from "../components/ui/Loader";
import { EmptyState } from "../components/ui/EmptyState";
import { formatDate } from "../utils/time";
import { useAuthBootstrap } from "../hooks/useAuthBootstrap";

export function ExplorePage() {
  useAuthBootstrap();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const query = useQuery({
    queryKey: ["exams", searchParams.toString()],
    queryFn: () => examService.list(Object.fromEntries(searchParams.entries()))
  });

  const exams = query.data?.exams || [];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Enterprise-grade exams</p>
            <h2 className="mt-3 text-4xl font-bold text-white">Schedule, secure, and release exams with real workflows.</h2>
            <p className="mt-4 max-w-2xl text-slate-300">
              Search public examinations, review creators, attempt protected CBT sessions, and receive unified results.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Anti-cheat", "Fullscreen enforcement, tab tracking, and violation logging"],
              ["AI-ready", "Groq and Gemini assistants built into the platform"],
              ["Release control", "Instant, scheduled, and manual result publishing"],
              ["Community", "Ratings, comments, creator profiles, and trending exams"]
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
            <Input
              className="pl-10"
              value={q}
              placeholder="Search exams, categories, creators"
              onChange={(event) => setSearchParams((current) => {
                const next = new URLSearchParams(current);
                if (event.target.value) next.set("q", event.target.value);
                else next.delete("q");
                return next;
              })}
            />
          </div>
          <Input
            placeholder="Filter by subject"
            onChange={(event) => setSearchParams((current) => {
              const next = new URLSearchParams(current);
              if (event.target.value) next.set("subject", event.target.value);
              else next.delete("subject");
              return next;
            })}
          />
          <select
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
            onChange={(event) => setSearchParams((current) => {
              const next = new URLSearchParams(current);
              if (event.target.value) next.set("sort", event.target.value);
              else next.delete("sort");
              return next;
            })}
          >
            <option value="newest">Newest</option>
            <option value="trending">Trending</option>
            <option value="rating">Top rated</option>
            <option value="popular">Popular</option>
          </select>
          <Input
            type="number"
            placeholder="Max duration"
            onChange={(event) => setSearchParams((current) => {
              const next = new URLSearchParams(current);
              if (event.target.value) next.set("duration", event.target.value);
              else next.delete("duration");
              return next;
            })}
          />
        </div>
      </Card>

      {query.isLoading ? <Loader label="Fetching exams..." /> : null}

      {!query.isLoading && exams.length === 0 ? (
        <EmptyState title="No exams found" description="Adjust the filters or create the first public exam." />
      ) : null}

      <div className="grid gap-5 xl:grid-cols-3 md:grid-cols-2">
        {exams.map((exam: any) => (
          <Card key={exam._id} className="overflow-hidden p-0">
            <img src={exam.banner || exam.thumbnail || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop"} alt={exam.title} className="h-44 w-full object-cover" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{exam.category}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{exam.title}</h3>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {exam.visibility}
                </div>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-slate-400">{exam.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                  {exam.subjects.length} subjects
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                  {exam.attemptsCount} attempts
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-300" />
                  {exam.averageRating.toFixed(1)}
                </span>
                <span className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-cyan-300" />
                  {formatDate(exam.schedule.startAt)}
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <Link to={`/creators/${exam.creator._id || exam.creator.id}`} className="text-sm text-cyan-300">
                  {exam.creator.name}
                </Link>
                <Link to={`/exams/${exam._id}`} className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
                  View exam
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
