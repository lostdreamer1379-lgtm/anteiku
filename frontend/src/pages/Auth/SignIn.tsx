import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormField from "@/components/ui/FormField";
import { signInWithEmail } from "@/services/auth/authService";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await signInWithEmail(values.email, values.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Sign in failed");
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20 md:px-8">
      <p className="text-xs uppercase tracking-[0.3em] text-sage">Welcome back</p>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Sign in to Anteiku</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && (
          <p role="alert" className="rounded-anteiku border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-anteiku bg-forest py-2.5 text-sm font-medium tracking-wide text-ivory transition-colors hover:bg-sage hover:text-bg-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-muted">
        <p>
          Don't have an account?{" "}
          <Link to="/signup" className="text-sage hover:underline">
            Sign up
          </Link>
        </p>
        <p>
          <Link to="/reset-password" className="hover:text-ivory hover:underline">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}
