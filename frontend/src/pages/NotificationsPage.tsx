import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notificationService";
import { Loader } from "../components/ui/Loader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Check } from "lucide-react";

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.list
  });

  const mutation = useMutation({
    mutationFn: notificationService.read,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
  });

  const readAllMutation = useMutation({
    mutationFn: notificationService.readAll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
  });

  if (query.isLoading) return <Loader label="Loading notifications..." />;
  const notifications = query.data?.notifications || [];
  const hasUnread = notifications.some((notification: any) => !notification.readAt);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Notifications</h2>
        {hasUnread && (
          <Button
            variant="secondary"
            onClick={() => readAllMutation.mutate()}
            disabled={readAllMutation.isPending}
          >
            <Check className="mr-2 h-4 w-4" />
            {readAllMutation.isPending ? "Marking..." : "Mark all read"}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-8 text-slate-400">
          No notifications yet.
        </Card>
      ) : (
        notifications.map((notification: any) => (
          <Card key={notification._id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-white">{notification.title}</p>
              <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
            </div>
            {!notification.readAt ? (
              <Button variant="secondary" onClick={() => mutation.mutate(notification._id)}>
                Mark read
              </Button>
            ) : (
              <span className="text-xs text-slate-500 font-medium">Read</span>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
