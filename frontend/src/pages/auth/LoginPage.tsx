import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/authService";
import { getApiErrorMessage } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { FieldError } from "../../components/ui/FieldError";
import { useToastStore } from "../../stores/toastStore";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

type Values = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const pushToast = useToastStore((state) => state.push);
  const form = useForm<Values>({ resolver: zodResolver(schema), mode: "onSubmit", reValidateMode: "onChange" });
  const errors = form.formState.errors;

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      pushToast({ title: "Welcome back", description: "Your workspace is ready." });
      navigate("/dashboard");
    }
  });

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Secure Access</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight text-white">Sign in to Qivora</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Access your live examination workspace, result dashboards, creator controls, and AI copilots.
        </p>
      </div>
      <form className="space-y-5" noValidate onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Email</label>
          <Input placeholder="Email" {...form.register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Password</label>
          <Input type="password" placeholder="Password" {...form.register("password")} />
          <FieldError message={errors.password?.message} />
        </div>
        {mutation.error ? (
          <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {getApiErrorMessage(mutation.error)}
          </p>
        ) : null}
        <Button className="w-full py-3.5 text-base" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="mt-6 flex justify-between text-sm text-slate-400">
        <Link to="/forgot-password">Forgot password</Link>
        <Link to="/register">Create account</Link>
      </div>
    </div>
  );
}
