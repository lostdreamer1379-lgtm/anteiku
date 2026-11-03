import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormField from "@/components/ui/FormField";
import { signUpWithEmail } from "@/services/auth/authService";

const schema = z
  .object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export default function SignUp() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const result = await signUpWithEmail(values.email, values.password);
      // Supabase sends a confirmation email when email confirmation is enabled.
      // If the user is immediately available (email confirm disabled in project),
      // redirect to home; otherwise show the success notice.
      if (result.session) {
        navigate("/", { replace: true });
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Sign up failed");
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-sage">Almost there</p>
        <h1 className="mt-2 font-serif text-3xl text-ivory">Check your email</h1>
        <p className="mt-4 text-sm text-muted">
          We've sent a confirmation link to your inbox. Click it to activate your account, then{" "}
          <Link to="/signin" className="text-sage hover:underline">
            sign in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20 md:px-8">
      <p className="text-xs uppercase tracking-[0.3em] text-sage">Join Anteiku</p>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Create an account</h1>

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
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />
        <FormField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirm?.message}
          {...register("confirm")}
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
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/signin" className="text-sage hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
