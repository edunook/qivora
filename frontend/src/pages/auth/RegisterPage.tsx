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

const schema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters."),
    username: z.string().min(3, "Username must be at least 3 characters."),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    role: z.enum(["student", "teacher", "admin", "organization"]),
    organizationName: z.string().optional()
  })
  .superRefine((value, ctx) => {
    if (value.role === "organization" && !value.organizationName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Organization name is required for organization accounts.",
        path: ["organizationName"]
      });
    }
  });

type Values = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { role: "student", organizationName: "" }
  });

  const role = form.watch("role");
  const errors = form.formState.errors;

  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      navigate("/dashboard");
    }
  });

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Enterprise Onboarding</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight text-white">Create your Qivora account</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Start as a student, teacher, organization, or admin and move directly into the production workspace.
        </p>
      </div>
      <form className="space-y-5" noValidate onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Full name</label>
            <Input placeholder="Full name" {...form.register("name")} />
            <FieldError message={errors.name?.message} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Username</label>
            <Input placeholder="Username" {...form.register("username")} />
            <FieldError message={errors.username?.message} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Email</label>
          <Input placeholder="Email" {...form.register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Password</label>
          <Input type="password" placeholder="Password" {...form.register("password")} />
          <p className="text-xs text-slate-500">Use at least 8 characters.</p>
          <FieldError message={errors.password?.message} />
        </div>
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Account type</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "student", label: "Student" },
              { value: "teacher", label: "Teacher" },
              { value: "organization", label: "Organization" },
              { value: "admin", label: "Admin" }
            ].map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm transition ${
                  role === option.value
                    ? "border-cyan-400/60 bg-cyan-400/10 text-white"
                    : "border-white/10 bg-slate-950/60 text-slate-300"
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  className="sr-only"
                  {...form.register("role")}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
        {role === "organization" ? (
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Organization</label>
            <Input placeholder="Organization name" {...form.register("organizationName")} />
            <FieldError message={errors.organizationName?.message} />
          </div>
        ) : null}
        {mutation.error ? (
          <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {getApiErrorMessage(mutation.error)}
          </p>
        ) : null}
        <Button className="w-full py-3.5 text-base" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-slate-400">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
