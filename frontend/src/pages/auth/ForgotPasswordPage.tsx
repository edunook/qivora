import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/authService";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function ForgotPasswordPage() {
  const form = useForm<{ email: string }>();
  const mutation = useMutation({
    mutationFn: authService.forgotPassword
  });

  return (
    <div className="mx-auto max-w-md">
      <h2 className="text-3xl font-bold text-white">Forgot password</h2>
      <p className="mt-2 text-sm text-slate-400">We will email a reset link if the account exists.</p>
      <form className="mt-8 space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <Input placeholder="Email" {...form.register("email")} />
        <Button className="w-full" type="submit" disabled={mutation.isPending}>
          Send reset link
        </Button>
      </form>
      {mutation.data ? <p className="mt-4 text-sm text-cyan-300">{mutation.data.message}</p> : null}
      <p className="mt-6 text-sm text-slate-400">
        <Link to="/login">Back to sign in</Link>
      </p>
    </div>
  );
}
