import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { resultService } from "../services/resultService";
import { Loader } from "../components/ui/Loader";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";

export function ResultsPage() {
  const query = useQuery({
    queryKey: ["results"],
    queryFn: resultService.mine
  });

  if (query.isLoading) return <Loader label="Loading results..." />;
  const results = query.data?.results || [];

  if (results.length === 0) {
    return <EmptyState title="No results yet" description="Attempt an exam to generate your first scorecard." />;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {results.map((result: any) => (
        <Card key={result._id}>
          <p className="text-sm text-cyan-300">{result.exam.title}</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            {result.resultStatus === "published" ? `${result.overallPercentage}%` : "Pending"}
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            {result.resultStatus === "published"
              ? `Grade ${result.overallGrade} · Rank ${result.rank}`
              : "Results are not yet published."}
          </p>
          <Link to={`/results/${result._id}`} className="mt-5 inline-flex text-sm text-cyan-300">
            Open result dashboard
          </Link>
        </Card>
      ))}
    </div>
  );
}
