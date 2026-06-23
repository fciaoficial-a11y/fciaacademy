import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

const STORAGE_KEY = "fcia.supabase.credentials";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [status, setStatus] = useState<"idle" | "saved" | "cleared">("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const url = (form.elements.namedItem("supabase_url") as HTMLInputElement)
      .value.trim();
    const key = (
      form.elements.namedItem("supabase_publishable_key") as HTMLInputElement
    ).value.trim();

    if (!url || !key) return;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ url, key, savedAt: Date.now() }),
      );
    }
    form.reset();
    setStatus("saved");
  }

  function handleClear() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setStatus("cleared");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Internal credential placeholder. Values are stored locally and never
          displayed.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="supabase_url"
              className="text-xs font-medium text-foreground"
            >
              SUPABASE_URL
            </label>
            <input
              id="supabase_url"
              name="supabase_url"
              type="password"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="supabase_publishable_key"
              className="text-xs font-medium text-foreground"
            >
              SUPABASE_PUBLISHABLE_KEY
            </label>
            <input
              id="supabase_publishable_key"
              name="supabase_publishable_key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Clear
            </button>
          </div>

          {status === "saved" && (
            <p className="text-xs text-muted-foreground">Credentials saved locally.</p>
          )}
          {status === "cleared" && (
            <p className="text-xs text-muted-foreground">Credentials cleared.</p>
          )}
        </form>
      </div>
    </main>
  );
}
