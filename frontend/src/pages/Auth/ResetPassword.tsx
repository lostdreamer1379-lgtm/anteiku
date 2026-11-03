import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormField from "@/components/ui/FormField";
import { sendPasswordReset } from "@/services/auth/authService";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});
type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await sendPasswordReset(values.email);
      setSent(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Request failed");
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-sage">Sent</p>
        <h1 className="mt-2 font-serif text-3xl text-ivory">Check your inbox</h1>
        <p className="mt-4 text-sm text-muted">
          If that address is registered, you'll receive a reset link shortly.
        </p>
        <Link to="/signin" className="mt-6 inline-block text-sm text-sage hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20 md:px-8">
      <p className="text-xs uppercase tracking-[0.3em] text-sage">Account recovery</p>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Reset your password</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
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
          {isSubmitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link to="/signin" className="text-sage hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
