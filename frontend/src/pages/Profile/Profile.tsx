import { useState } from "react";
import { Check, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import FormField from "@/components/ui/FormField";
import { apiFetch } from "@/services/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { themes, useTheme } from "@/contexts/ThemeContext";

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
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

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

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch<void>("/profile", { method: "DELETE" }),
    onSuccess: async () => {
      await signOut();
      navigate("/");
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

      <section className="mt-10 border-t border-border-subtle pt-8" aria-labelledby="theme-heading">
        <div className="flex items-start gap-3">
          <div className="rounded-full border border-border-subtle bg-bg-secondary p-2 text-sage">
            <Palette size={18} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sage">Appearance</p>
            <h2 id="theme-heading" className="mt-1 font-serif text-xl text-ivory">Choose your theme</h2>
            <p className="mt-1 text-sm text-muted">Your choice is saved on this device.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {themes.map((option) => {
            const isSelected = option.id === theme;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setTheme(option.id)}
                className={`group rounded-anteiku border p-3 text-left transition-[border-color,background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-sage/70 ${isSelected ? "border-sage bg-bg-secondary shadow-[var(--shadow-soft)]" : "border-border-subtle bg-bg-card"}`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex shrink-0 overflow-hidden rounded-full border border-white/15">
                      {option.swatches.map((swatch) => (
                        <span key={swatch} className="h-5 w-5" style={{ backgroundColor: swatch }} />
                      ))}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ivory">{option.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted">{option.description}</span>
                    </span>
                  </span>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected ? "border-sage bg-sage text-bg-primary" : "border-border-subtle text-transparent"}`}>
                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-10 border-t border-red-900/40 pt-8" aria-labelledby="danger-heading">
        <p className="text-xs uppercase tracking-[0.3em] text-red-400">Danger zone</p>
        <h2 id="danger-heading" className="mt-1 font-serif text-xl text-ivory">Delete account</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Permanently removes your account, profile, watchlist, and viewing progress. This cannot be undone.
        </p>

        {!deleteConfirmation ? (
          <button
            type="button"
            onClick={() => setDeleteConfirmation(" ")}
            className="mt-4 rounded-anteiku border border-red-900/70 px-4 py-2 text-sm text-red-300 transition-colors hover:border-red-400 hover:bg-red-950/30 hover:text-red-200"
          >
            Delete my account
          </button>
        ) : (
          <div className="mt-4 rounded-anteiku border border-red-900/70 bg-red-950/20 p-4">
            <p className="text-sm text-red-200">Type <span className="font-semibold">DELETE</span> to confirm.</p>
            <input
              type="text"
              value={deleteConfirmation.trim()}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              autoComplete="off"
              className="mt-3 w-full rounded-anteiku border border-red-900/70 bg-bg-primary px-3 py-2 text-sm text-ivory placeholder:text-muted focus:border-red-400 focus:outline-none"
              placeholder="DELETE"
              aria-label="Type DELETE to confirm account deletion"
            />
            {deleteMutation.isError && (
              <p role="alert" className="mt-2 text-sm text-red-300">
                {deleteMutation.error instanceof Error ? deleteMutation.error.message : "Account deletion failed"}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setDeleteConfirmation(""); deleteMutation.reset(); }}
                className="rounded-anteiku border border-border-subtle px-4 py-2 text-sm text-muted hover:border-sage hover:text-ivory"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmation.trim() !== "DELETE" || deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
                className="rounded-anteiku bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting…" : "Permanently delete account"}
              </button>
            </div>
          </div>
        )}
      </section>

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
