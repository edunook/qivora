import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/authService";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function ResetPasswordPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const form = useForm<{ password: string }>();
  const mutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => navigate("/login")
  });

  return (
    <div className="mx-auto max-w-md">
      <h2 className="text-3xl font-bold text-white">Reset password</h2>
      <form
        className="mt-8 space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate({ ...values, token }))}
      >
        <Input type="password" placeholder="New password" {...form.register("password")} />
        <Button className="w-full" type="submit" disabled={mutation.isPending}>
          Reset password
        </Button>
      </form>
    </div>
  );
}
