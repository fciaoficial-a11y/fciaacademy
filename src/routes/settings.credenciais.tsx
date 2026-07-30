import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

/**
 * Placeholder OCULTO de configurações de backend.
 *
 * Regras de segurança (não alterar sem revisão):
 * - Rota não linkada em nenhum menu e marcada como noindex/nofollow.
 * - Os campos são write-only: o valor salvo NUNCA é lido de volta para a UI.
 * - Só existe indicador booleano de "configurado" — sem máscara parcial,
 *   sem prefixo, sem sufixo, sem log em console.
 */

const URL_KEY = "fcia.backend.url";
const KEY_KEY = "fcia.backend.publishable_key";

type ConfigState = { url: boolean; key: boolean };

export const Route = createFileRoute("/settings/credenciais")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Credenciais do backend — FCIA Academy" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
      { name: "description", content: "Área interna de configuração." },
    ],
  }),
  component: CredentialsPlaceholder;
});

function readConfigured(): ConfigState {
  if (typeof window === "undefined") return { url: false, key: false };
  return {
    url: Boolean(window.localStorage.getItem(URL_KEY)),
    key: Boolean(window.localStorage.getItem(KEY_KEY)),
  };
}

function CredentialsPlaceholder() {
  const [configured, setConfigured] = useState<ConfigState>({ url: false, key: false });
  const [urlDraft, setUrlDraft] = useState("");
  const [keyDraft, setKeyDraft] = useState("");

  useEffect(() => {
    setConfigured(readConfigured());
  }, []);

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = urlDraft.trim();
    const key = keyDraft.trim();

    if (!url && !key) {
      toast.error("Nada para salvar.");
      return;
    }
    if (url && !/^https:\/\/[^\s]+$/.test(url)) {
      toast.error("URL inválida. Use uma URL https válida.");
      return;
    }

    if (url) window.localStorage.setItem(URL_KEY, url);
    if (key) window.localStorage.setItem(KEY_KEY, key);

    // Limpa os drafts imediatamente: os valores não ficam em memória de render.
    setUrlDraft("");
    setKeyDraft("");
    setConfigured(readConfigured());
    toast.success("Credenciais salvas. Os valores não são exibidos por segurança.");
  }

  function handleClear() {
    window.localStorage.removeItem(URL_KEY);
    window.localStorage.removeItem(KEY_KEY);
    setUrlDraft("");
    setKeyDraft("");
    setConfigured({ url: false, key: false });
    toast.success("Credenciais removidas deste dispositivo.");
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <KeyRound className="h-5 w-5" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-semibold sm:text-3xl">
        Credenciais do backend
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Área interna. Cole os valores abaixo — eles são gravados apenas neste dispositivo e
        nunca são exibidos novamente na interface.
      </p>

      <form onSubmit={handleSave} className="mt-8 space-y-5">
        <Field
          id="supabase-url"
          label="SUPABASE_URL"
          placeholder="https://..."
          value={urlDraft}
          onChange={setUrlDraft}
          configured={configured.url}
        />
        <Field
          id="supabase-publishable-key"
          label="SUPABASE_PUBLISHABLE_KEY"
          placeholder="Cole a chave publicável"
          value={keyDraft}
          onChange={setKeyDraft}
          configured={configured.key}
        />

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center rounded-full border border-border px-5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Limpar
          </button>
          <Link
            to="/settings"
            className="inline-flex items-center rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Voltar
          </Link>
        </div>
      </form>

      <p className="mt-8 text-xs text-muted-foreground">
        Os valores gravados são write-only: não há leitura, máscara parcial ou cópia disponível
        na interface. Para trocar uma credencial, cole o novo valor e salve novamente.
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  placeholder,
  value,
  onChange,
  configured,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
  configured: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {configured ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            <ShieldCheck className="h-3 w-3" />
            Configurado
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            Não configurado
          </span>
        )}
      </div>
      <input
        id={id}
        type="password"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-lpignore="true"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
