import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import { Loader } from "../components/ui/Loader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export function AdminPage() {
  const queryClient = useQueryClient();
  const dashboard = useQuery({ queryKey: ["admin-dashboard"], queryFn: adminService.dashboard });
  const users = useQuery({ queryKey: ["admin-users"], queryFn: adminService.users });
  const exams = useQuery({ queryKey: ["admin-exams"], queryFn: adminService.exams });

  const suspendMutation = useMutation({
    mutationFn: ({ userId, isSuspended }: { userId: string; isSuspended: boolean }) =>
      adminService.suspendUser(userId, isSuspended),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] })
  });
  const deleteUserMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] })
  });
  const deleteExamMutation = useMutation({
    mutationFn: adminService.deleteExam,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-exams"] })
  });

  if (dashboard.isLoading || users.isLoading || exams.isLoading) return <Loader label="Loading admin console..." />;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {Object.entries(dashboard.data.stats).map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm capitalize text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-bold text-white">{value as number}</p>
          </Card>
        ))}
      </div>

      <Card>
        <p className="text-lg font-semibold text-white">Users</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="pb-3">Name</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.data.users.map((user: any) => (
                <tr key={user._id} className="border-t border-white/10">
                  <td className="py-3 text-white">{user.name}</td>
                  <td className="py-3">{user.role}</td>
                  <td className="py-3">{user.isSuspended ? "Suspended" : "Active"}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          suspendMutation.mutate({
                            userId: user._id,
                            isSuspended: !user.isSuspended
                          })
                        }
                      >
                        {user.isSuspended ? "Unsuspend" : "Suspend"}
                      </Button>
                      <Button variant="danger" onClick={() => deleteUserMutation.mutate(user._id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <p className="text-lg font-semibold text-white">Exams</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="pb-3">Exam</th>
                <th className="pb-3">Creator</th>
                <th className="pb-3">Attempts</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {exams.data.exams.map((exam: any) => (
                <tr key={exam._id} className="border-t border-white/10">
                  <td className="py-3 text-white">{exam.title}</td>
                  <td className="py-3">{exam.creator?.name}</td>
                  <td className="py-3">{exam.attemptsCount}</td>
                  <td className="py-3">
                    <Button variant="danger" onClick={() => deleteExamMutation.mutate(exam._id)}>
                      Delete exam
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
