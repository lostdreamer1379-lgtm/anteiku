import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import FormField from "@/components/ui/FormField";
import { apiFetch } from "@/services/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(32, "At most 32 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, _ and - allowed")
    .optional()
    .or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

interface ProfileData {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["profile"],
    queryFn: () =>
      apiFetch<{ data: ProfileData }>("/profile").then((r) => r.data),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      apiFetch<{ data: ProfileData }>("/profile", {
        method: "PUT",
        body: JSON.stringify({ username: values.username || undefined }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { username: profile?.username ?? "" },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md animate-pulse px-5 py-20 md:px-8">
        <div className="h-6 w-1/3 rounded bg-bg-card" />
        <div className="mt-3 h-4 w-1/2 rounded bg-bg-card" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16 md:px-8">
      <p className="text-xs uppercase tracking-[0.3em] text-sage">Your account</p>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Profile</h1>

      <div className="mt-6 rounded-anteiku border border-border-subtle bg-bg-card p-4 text-sm text-muted">
        <p>
          Signed in as <span className="text-ivory">{user?.email}</span>
        </p>
      </div>

      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        noValidate
        className="mt-8 space-y-5"
      >
        <FormField
          label="Username"
          type="text"
          autoComplete="username"
          placeholder="your_handle"
          error={errors.username?.message}
          {...register("username")}
        />

        {mutation.isError && (
          <p role="alert" className="text-sm text-red-400">
            {mutation.error instanceof Error ? mutation.error.message : "Update failed"}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-anteiku bg-forest py-2.5 text-sm font-medium tracking-wide text-ivory transition-colors hover:bg-sage hover:text-bg-primary disabled:opacity-60"
        >
          {mutation.isPending ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </form>

      <div className="mt-10 border-t border-border-subtle pt-8">
        <button
          type="button"
          onClick={signOut}
          className="rounded-anteiku border border-border-subtle px-4 py-2 text-sm text-muted hover:border-sage hover:text-ivory"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
