import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { examService } from "../services/examService";
import { Card } from "../components/ui/Card";
import { Loader } from "../components/ui/Loader";
import { Button } from "../components/ui/Button";

export function CreatorProfilePage() {
  const { creatorId = "" } = useParams();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["creator", creatorId],
    queryFn: () => examService.getCreator(creatorId)
  });

  const mutation = useMutation({
    mutationFn: () => examService.followCreator(creatorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["creator", creatorId] })
  });

  if (query.isLoading) return <Loader label="Loading creator..." />;
  const { creator, exams } = query.data;

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={creator.avatar} alt={creator.name} className="h-20 w-20 rounded-[28px] object-cover" />
          <div>
            <h2 className="text-3xl font-bold text-white">{creator.name}</h2>
            <p className="mt-1 text-slate-400">@{creator.username}</p>
            <p className="mt-2 text-sm text-slate-300">{creator.bio || creator.organizationName || "Exam creator"}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => mutation.mutate()}>
          Follow creator
        </Button>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {exams.map((exam: any) => (
          <Card key={exam._id}>
            <p className="text-sm text-cyan-300">{exam.category}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{exam.title}</h3>
            <p className="mt-3 text-sm text-slate-400">{exam.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
