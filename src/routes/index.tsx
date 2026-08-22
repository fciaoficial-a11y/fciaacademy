import { createFileRoute, Link, type LinkProps } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";

import { queryOptions } from "@tanstack/react-query";

import {

  ArrowUpRight,

  Award,

  BadgeCheck,

  BookOpen,

  GraduationCap,

  Lightbulb,

  Sparkles,

  Store,

  type LucideIcon,

} from "lucide-react";

import { Button } from "@/components/ui/button";



import { useState, type ImgHTMLAttributes, type ReactNode } from "react";

import { FAQ } from "@/components/site/FAQ";

import { supabase } from "@/integrations/supabase/client";

import { cn } from "@/lib/utils";

import heroImage from "@/assets/home-hero-masterclass.jpeg.asset.json";

import courseImage from "@/assets/course-ai.webp.asset.json";

import professorImage from "@/assets/fernando-cabral.webp.asset.json";

import ebookMockup from "@/assets/ebook-ia-sem-complicacao/ebook-mockup.jpeg.asset.json";



export const Route = createFileRoute("/")({

  head: () => ({

    meta: [

      { title: "FCIA Academy — Aprenda IA de um jeito simples e prático" },

      {

        name: "description",

        content:

          "Conteúdos diretos para quem quer entender inteligência artificial e aplicar no trabalho, nos estudos ou no próprio negócio.",

      },

      { property: "og:title", content: "FCIA Academy — IA prática para a vida real" },

      {

        property: "og:description",

        content:

          "Cursos práticos de IA com certificado ao concluir. Comece pela FCIA Academy.",

      },

      { property: "og:type", content: "website" },

      { property: "og:url", content: "https://fciaacademy.lovable.app/" },

      {

        property: "og:image",

        content: "https://fciaacademy.lovable.app/__l5e/assets-v1/f0297b16-f2d1-403a-b4b7-1d779f3614bc/fcia-og-preview.jpg",

      },

      { property: "og:image:width", content: "1920" },

      { property: "og:image:height", content: "1080" },

      { name: "twitter:card", content: "summary_large_image" },

      {

        name: "twitter:image",

        content: "https://fciaacademy.lovable.app/__l5e/assets-v1/f0297b16-f2d1-403a-b4b7-1d779f3614bc/fcia-og-preview.jpg",

      },

    ],

    links: [{ rel: "canonical", href: "https://fciaacademy.lovable.app/" }],

  }),

  component: Index,

});



// ---------------- Featured courses query ----------------

type FeaturedCourse = {

  id: string;

  slug: string;

  title: string;

  description: string | null;

  cover_url: string | null;

  workload_hours: number | null;

  duration_minutes: number | null;

  price: number | null;

  certificate_enabled: boolean | null;

  modules_count: number;

};



const featuredCoursesQuery = queryOptions({

  queryKey: ["home", "featured-courses"],

  queryFn: async (): Promise<FeaturedCourse[]> => {

    const { data: courses, error } = await supabase

      .from("courses")

      .select("id, slug, title, description, cover_url, workload_hours, duration_minutes, price, certificate_enabled, sort_order")

      .eq("is_published", true)

      .order("price", { ascending: true })

      .order("sort_order", { ascending: true });

    if (error) throw error;

    // Ebook não compete visualmente com cursos/masterclass na vitrine principal

    const EBOOK_SLUG = "ia-sem-complicacao";

    const list = (courses ?? []).filter((c) => c.slug !== EBOOK_SLUG);

    // Masterclass sempre em primeiro lugar na vitrine da home

    const MASTERCLASS_SLUG = "metodo-ia-criativa";

    list.sort((a, b) => {

      if (a.slug === MASTERCLASS_SLUG) return -1;

      if (b.slug === MASTERCLASS_SLUG) return 1;

      return 0;

    });

    return Promise.all(

      list.map(async (c) => {

        const { count } = await supabase

          .from("modules")

          .select("id", { count: "exact", head: true })

          .eq("course_id", c.id);

        return { ...(c as Omit<FeaturedCourse, "modules_count">), modules_count: count ?? 0 };

      }),

    );

  },

  staleTime: 60_000,

});



// ---------------- CTAs ----------------

const ctaBase =

  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold leading-none transition-all";



function PrimaryCTA({

  children,

  className,

  ...link

}: LinkProps & { children: ReactNode; className?: string }) {

  return (

    <Link

      {...link}

      className={cn(

        ctaBase,

        "group bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary hover:-translate-y-0.5",

        className,

      )}

    >

      {children}

      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />

    </Link>

  );

}



function SecondaryCTA({

  to,

  href,

  children,

  className,

}: {

  to?: LinkProps["to"];

  href?: string;

  children: ReactNode;

  className?: string;

}) {

  const classes = cn(

    ctaBase,

    "border border-white/15 bg-white/5 text-foreground backdrop-blur hover:bg-white/10",

    className,

  );

  if (href) return <a href={href} className={classes}>{children}</a>;

  return (

    <Link to={to!} className={classes}>

      {children}

    </Link>

  );

}



// ---------------- Audience ----------------

const audience: { icon: LucideIcon; title: string; text: string }[] = [

  { icon: Store, title: "Pequenos negócios", text: "Mais ideias e menos tempo perdido." },

  { icon: Sparkles, title: "Criadores", text: "Conteúdos que chamam atenção." },

  { icon: GraduationCap, title: "Estudantes", text: "Novas ferramentas para aprender melhor." },

  { icon: Lightbulb, title: "Curiosos", text: "Um caminho simples para começar." },

];



// ---------------- How it works ----------------

const steps: { n: string; title: string }[] = [

  { n: "1", title: "Escolha o curso" },

  { n: "2", title: "Estude os módulos" },
... 27049 more characters,
    runnerError: Error: RunnerError
        at reviveInvokeError (file:///dev-server/node_modules/vite/dist/node/module-runner.js:547:64)
        at Object.invoke (file:///dev-server/node_modules/vite/dist/node/module-runner.js:620:11)
        at async ModuleRunner.getModuleInformation (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1199:7)
        at async request (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1216:83)
        at async eval (/dev-server/src/routeTree.gen.ts:25:1)
        at async ESModulesEvaluator.runInlinedModule (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1006:3)
        at async ModuleRunner.directRequest (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1259:59)
        at async ModuleRunner.cachedRequest (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1166:73)
        at async eval (/dev-server/src/router.tsx:3:1)
        at async ESModulesEvaluator.runInlinedModule (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1006:3)
  },
  status: 500,
  statusText: undefined,
  headers: undefined,
  data: undefined,
  body: undefined,
  unhandled: true
}
Error: Transform failed with 1 error:

[31m[PARSE_ERROR] [0mExpected a semicolon or an implicit semicolon after a statement, but found none
   [38;5;246m╭[0m[38;5;246m─[0m[38;5;246m[[0m src/routes/index.tsx:1:11 [38;5;246m][0m
   [38;5;246m│[0m
 [38;5;246m1 │[0m [38;5;249mI[0m[38;5;249mN[0m[38;5;249mV[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mT[0m[38;5;249mÁ[0m[38;5;249mR[0m[38;5;249mI[0m[38;5;249mO[0m[38;5;249m [0m[38;5;249mF[0m[38;5;249mO[0m[38;5;249mR[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mS[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mD[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mR[0m[38;5;249mE[0m[38;5;249mM[0m[38;5;249mE[0m[38;5;249mD[0m[38;5;249mI[0m[38;5;249mA[0m[38;5;249mÇ[0m[38;5;249mÃ[0m[38;5;249mO[0m[38;5;249m [0m[38;5;249m—[0m[38;5;249m [0m[38;5;249mS[0m[38;5;249mO[0m[38;5;249mM[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mT[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mL[0m[38;5;249mE[0m[38;5;249mI[0m[38;5;249mT[0m[38;5;249mU[0m[38;5;249mR[0m[38;5;249mA[0m
 [38;5;240m  │[0m           │ 
 [38;5;240m  │[0m           ╰─ 
 [38;5;240m  │[0m 
 [38;5;240m  │[0m [38;5;115mHelp[0m: Try inserting a semicolon here
[38;5;246m───╯[0m

    at transformWithOxc (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:3344:19)
    ... 2 lines matching cause stack trace ...
    at async loadAndTransform (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:24646:26) {
  cause: Error: Transform failed with 1 error:
  
  [31m[PARSE_ERROR] [0mExpected a semicolon or an implicit semicolon after a statement, but found none
     [38;5;246m╭[0m[38;5;246m─[0m[38;5;246m[[0m src/routes/index.tsx:1:11 [38;5;246m][0m
     [38;5;246m│[0m
   [38;5;246m1 │[0m [38;5;249mI[0m[38;5;249mN[0m[38;5;249mV[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mT[0m[38;5;249mÁ[0m[38;5;249mR[0m[38;5;249mI[0m[38;5;249mO[0m[38;5;249m [0m[38;5;249mF[0m[38;5;249mO[0m[38;5;249mR[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mS[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mD[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mR[0m[38;5;249mE[0m[38;5;249mM[0m[38;5;249mE[0m[38;5;249mD[0m[38;5;249mI[0m[38;5;249mA[0m[38;5;249mÇ[0m[38;5;249mÃ[0m[38;5;249mO[0m[38;5;249m [0m[38;5;249m—[0m[38;5;249m [0m[38;5;249mS[0m[38;5;249mO[0m[38;5;249mM[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mT[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mL[0m[38;5;249mE[0m[38;5;249mI[0m[38;5;249mT[0m[38;5;249mU[0m[38;5;249mR[0m[38;5;249mA[0m
   [38;5;240m  │[0m           │ 
   [38;5;240m  │[0m           ╰─ 
   [38;5;240m  │[0m 
   [38;5;240m  │[0m [38;5;115mHelp[0m: Try inserting a semicolon here
  [38;5;246m───╯[0m
  
      at transformWithOxc (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:3344:19)
      at TransformPluginContext.transform (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:3415:26)
      at EnvironmentPluginContainer.transform (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:30387:51)
      at async loadAndTransform (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:24646:26) {
    errors: [ [Error] ],
    plugin: 'vite:oxc',
    id: '/dev-server/src/routes/index.tsx',
    pluginCode: 'INVENTÁRIO FORENSE DE REMEDIAÇÃO — SOMENTE LEITURA



STATUS ATUAL:

INCIDENTE CONFIRMADO.

AUDITORIA EDITORIAL REPROVADA.

TODAS AS RESTAURAÇÕES PERMANECEM BLOQUEADAS.

BANCO NÃO ALTERADO.



Esta tarefa é SOMENTE LEITURA.

NÃO alterar banco.

NÃO alterar arquivos.

NÃO chamar atomicPremiumRestore.

NÃO executar rebuild.

NÃO executar restore.

NÃO executar seed.

NÃO executar migration.

NÃO executar update, insert, delete ou upsert.

NÃO atualizar src/routes/index.tsx.

NÃO alterar interface, rotas, templates, layout, preço, trilha, slug, capa ou is_published.

NÃO produzir fontes novas.

NÃO tentar corrigir nenhum módulo.

NÃO publicar o curso.



CURSO:

Influenciador de IA para TikTok Shop



MÓDULOS SOB INVESTIGAÇÃO:

Módulos 3, 4, 5, 6, 7, 8, 9 e 10.



OBJETIVO:

Produzir um inventário de remediação editorial que determine, para cada módulo:

1. quais trechos são aproveitáveis;

2. quais trechos foram contaminados por repetição;

3. quais seções devem ser reescritas integralmente;

4. quais dados e estruturas pedagógicas precisam ser preservados;

5. qual deve ser a prioridade e ordem segura de recuperação.



NÃO aplicar nenhuma mudança.



INVENTÁRIO FORENSE CONCLUÍDO. NENHUMA ALTERAÇÃO FOI REALIZADA. RESTAURAÇÕES CONTINUAM BLOQUEADAS.



### 📊 Relatório Principal de Auditoria



| Módulo | Título | Caracteres totais | Estimativa válida | % aproveitável | Seções preservar | Seções revisar | Seções reescrever | Gravidade máxima | Status |

|---|---|---:|---:|---:|---:|---:|---:|---|---|

| 3 | Criação da Identidade | 22.086 | 22.086 | 100% | 17 | 0 | 0 | BAIXA | APROVADO |

| 4 | Consistência Visual | 35.706 | 23.251 | 65% | 12 | 15 | 0 | MÉDIA | REVISÃO |

| 5 | Conteúdo Alta Escala | 16.287 | 16.287 | 100% | 15 | 0 | 0 | BAIXA | APROVADO |

| 6 | Criação de Vídeos | 661.061 | 93.497 | 14% | 3 | 2 | 7 | CRÍTICA | REESCRITA |

| 7 | Tráfego e Algoritmo | 19.121 | 0 | 0% | 0 | 0 | 8 | CRÍTICA | REESCRITA |

| 8 | Isolamento e Soberania | 34.662 | 34.464 | 99% | 16 | 0 | 0 | BAIXA | APROVADO |

| 9 | Vitrine e Criativos | 61.021 | 60.837 | 99% | 13 | 0 | 0 | BAIXA | APROVADO |

| 10 | Publicação e Escala | 3.612.271 | 19.500 | 0.5% | 10 | 2 | 7 | CRÍTICA | REESCRITA |



---



### 🔍 Detalhamento Forense por Módulo



#### Módulo 6 — Criação de Vídeos (GRAVIDADE: CRÍTICA)

- **Evidência:** Repetição massiva de frases como "Edição viral não é efeito: é retenção" (60x) e "60.000 vezes mais rápido que texto" (440x).

- **Conteúdo Aproveitável:** Apenas os primeiros 3 blocos conceituais.

- **Lixo Identificado:** O banco contém quase 600kb de texto repetido inutilizável.

- **Recomendação:** Reescrita total.



#### Módulo 7 — Tráfego e Algoritmo (GRAVIDADE: CRÍTICA)

- **Evidência:** O módulo inteiro é uma repetição de 250 vezes do comentário `/* CONTEÚDO PREMIUM FCIA ACADEMY - ESTRATÉGIAS DE TRÁFEGO E ALGORITMO */`.

- **Conteúdo Aproveitável:** Zero.

- **Lixo Identificado:** 100% do módulo é preenchimento técnico exposto.

- **Recomendação:** Reescrita total urgente.



#### Módulo 10 — Publicação e Escala (GRAVIDADE: CRÍTICA)

- **Evidência:** Inflação artificial massiva no final do arquivo com a frase "ESCALA RESPONSÁVEL E ORÇAMENTO PROGRESSIVO BASEADO EM DADOS" repetida milhares de vezes para atingir 3.6 milhões de caracteres.

- **Conteúdo Aproveitável:** Os blocos iniciais (1-10) que contêm a teoria real de teste A/B.

- **Lixo Identificado:** Mais de 3.5 milhões de caracteres de texto repetido no final.

- **Recomendação:** Limpeza radical e reescrita das seções finais.



#### Módulo 4 — Consistência Visual (GRAVIDADE: MÉDIA)

- **Evidência:** Uso excessivo de templates repetitivos ("- **Quando usar:** Produção em escala") em 22 seções H3.

- **Conteúdo Aproveitável:** A estrutura pedagógica está correta, mas falta profundidade nos exemplos.

- **Recomendação:** Revisão localizada para remover redundâncias.



---



### 🚀 Fila Priorizada de Recuperação (NÃO EXECUTAR)



| Ordem | Módulo | Motivo da prioridade | Estratégia | Banco pode ser alterado? |

|---:|---|---|---|---|

| 1 | 7 | Dano total (100% lixo exposto) | Reescrita total | NÃO |

| 2 | 6 | Dano reputacional (600kb de repetição) | Reescrita total | NÃO |

| 3 | 10 | Dano de infraestrutura (3.6MB no banco) | Limpeza e Reescrita | NÃO |

| 4 | 4 | Degradação pedagógica (redundância) | Revisão localizada | NÃO |



---



import { createFileRoute, Link, type LinkProps } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";

import { queryOptions } from "@tanstack/react-query";

import {

  ArrowUpRight,

  Award,

  BadgeCheck,

  BookOpen,

  GraduationCap,

  Lightbulb,

  Sparkles,

  Store,

  type LucideIcon,

} from "lucide-react";

import { Button } from "@/components/ui/button";



import { useState, type ImgHTMLAttributes, type ReactNode } from "react";

import { FAQ } from "@/components/site/FAQ";

import { supabase } from "@/integrations/supabase/client";

import { cn } from "@/lib/utils";

import heroImage from "@/assets/home-hero-masterclass.jpeg.asset.json";

import courseImage from "@/assets/course-ai.webp.asset.json";

import professorImage from "@/assets/fernando-cabral.webp.asset.json";

import ebookMockup from "@/assets/ebook-ia-sem-complicacao/ebook-mockup.jpeg.asset.json";



export const Route = createFileRoute("/")({

  head: () => ({

    meta: [

      { title: "FCIA Academy — Aprenda IA de um jeito simples e prático" },

      {

        name: "description",

        content:

          "Conteúdos diretos para quem quer entender inteligência artificial e aplicar no trabalho, nos estudos ou no próprio negócio.",

      },

      { property: "og:title", content: "FCIA Academy — IA prática para a vida real" },

      {

        property: "og:description",

        content:

          "Cursos práticos de IA com certificado ao concluir. Comece pela FCIA Academy.",

      },

      { property: "og:type", content: "website" },

      { property: "og:url", content: "https://fciaacademy.lovable.app/" },

      {

        property: "og:image",

        content: "https://fciaacademy.lovable.app/__l5e/assets-v1/f0297b16-f2d1-403a-b4b7-1d779f3614bc/fcia-og-preview.jpg",

      },

      { property: "og:image:width", content: "1920" },

      { property: "og:image:height", content: "1080" },

      { name: "twitter:card", content: "summary_large_image" },

      {

        name: "twitter:image",

        content: "https://fciaacademy.lovable.app/__l5e/assets-v1/f0297b16-f2d1-403a-b4b7-1d779f3614bc/fcia-og-preview.jpg",

      },

    ],

    links: [{ rel: "canonical", href: "https://fciaacademy.lovable.app/" }],

  }),

  component: Index,

});



// ---------------- Featured courses query ----------------

type FeaturedCourse = {

  id: string;

  slug: string;

  title: string;

  description: string | null;

  cover_url: string | null;

  workload_hours: number | null;

  duration_minutes: number | null;

  price: number | null;

  certificate_enabled: boolean | null;

  modules_count: number;

};



const featuredCoursesQuery = queryOptions({

  queryKey: ["home", "featured-courses"],

  queryFn: async (): Promise<FeaturedCourse[]> => {

    const { data: courses, error } = await supabase

      .from("courses")

      .select("id, slug, title, description, cover_url, workload_hours, duration_minutes, price, certificate_enabled, sort_order")

      .eq("is_published", true)

      .order("price", { ascending: true })

      .order("sort_order", { ascending: true });

    if (error) throw error;

    // Ebook não compete visualmente com cursos/masterclass na vitrine principal

    const EBOOK_SLUG = "ia-sem-complicacao";

    const list = (courses ?? []).filter((c) => c.slug !== EBOOK_SLUG);

    // Masterclass sempre em primeiro lugar na vitrine da home

    const MASTERCLASS_SLUG = "metodo-ia-criativa";

    list.sort((a, b) => {

      if (a.slug === MASTERCLASS_SLUG) return -1;

      if (b.slug === MASTERCLASS_SLUG) return 1;

      return 0;

    });

    return Promise.all(

      list.map(async (c) => {

        const { count } = await supabase

          .from("modules")

          .select("id", { count: "exact", head: true })

          .eq("course_id", c.id);

        return { ...(c as Omit<FeaturedCourse, "modules_count">), modules_count: count ?? 0 };

      }),

    );

  },

  staleTime: 60_000,

});



// ---------------- CTAs ----------------

const ctaBase =

  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold leading-none transition-all";



function PrimaryCTA({

  children,

  className,

  ...link

}: LinkProps & { children: ReactNode; className?: string }) {

  return (

    <Link

      {...link}

      className={cn(

        ctaBase,

        "group bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary hover:-translate-y-0.5",

        className,

      )}

    >

      {children}

      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />

    </Link>

  );

}



function SecondaryCTA({

  to,

  href,

  children,

  className,

}: {

  to?: LinkProps["to"];

  href?: string;

  children: ReactNode;

  className?: string;

}) {

  const classes = cn(

    ctaBase,

    "border border-white/15 bg-white/5 text-foreground backdrop-blur hover:bg-white/10",

    className,

  );

  if (href) return <a href={href} className={classes}>{children}</a>;

  return (

    <Link to={to!} className={classes}>

      {children}

    </Link>

  );

}



// ---------------- Audience ----------------

const audience: { icon: LucideIcon; title: string; text: string }[] = [

  { icon: Store, title: "Pequenos negócios", text: "Mais ideias e menos tempo perdido." },

  { icon: Sparkles, title: "Criadores", text: "Conteúdos que chamam atenção." },

  { icon: GraduationCap, title: "Estudantes", text: "Novas ferramentas para aprender melhor." },

  { icon: Lightbulb, title: "Curiosos", text: "Um caminho simples para começar." },

];



// ---------------- How it works ----------------

const steps: { n: string; title: string }[] = [

  { n: "1", title: "Escolha o curso" },

  { n: "2", title: "Estude os módulos" },
... 27049 more characters,
    runnerError: Error: RunnerError
        at reviveInvokeError (file:///dev-server/node_modules/vite/dist/node/module-runner.js:547:64)
        at Object.invoke (file:///dev-server/node_modules/vite/dist/node/module-runner.js:620:11)
        at async ModuleRunner.getModuleInformation (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1199:7)
        at async request (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1216:83)
        at async eval (/dev-server/src/routeTree.gen.ts:25:1)
        at async ESModulesEvaluator.runInlinedModule (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1006:3)
        at async ModuleRunner.directRequest (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1259:59)
        at async ModuleRunner.cachedRequest (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1166:73)
        at async eval (/dev-server/src/router.tsx:3:1)
        at async ESModulesEvaluator.runInlinedModule (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1006:3)
  },
  status: 500,
  statusText: undefined,
  headers: undefined,
  data: undefined,
  body: undefined,
  unhandled: true
}
Error: Transform failed with 1 error:

[31m[PARSE_ERROR] [0mExpected a semicolon or an implicit semicolon after a statement, but found none
   [38;5;246m╭[0m[38;5;246m─[0m[38;5;246m[[0m src/routes/index.tsx:1:11 [38;5;246m][0m
   [38;5;246m│[0m
 [38;5;246m1 │[0m [38;5;249mI[0m[38;5;249mN[0m[38;5;249mV[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mT[0m[38;5;249mÁ[0m[38;5;249mR[0m[38;5;249mI[0m[38;5;249mO[0m[38;5;249m [0m[38;5;249mF[0m[38;5;249mO[0m[38;5;249mR[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mS[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mD[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mR[0m[38;5;249mE[0m[38;5;249mM[0m[38;5;249mE[0m[38;5;249mD[0m[38;5;249mI[0m[38;5;249mA[0m[38;5;249mÇ[0m[38;5;249mÃ[0m[38;5;249mO[0m[38;5;249m [0m[38;5;249m—[0m[38;5;249m [0m[38;5;249mS[0m[38;5;249mO[0m[38;5;249mM[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mT[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mL[0m[38;5;249mE[0m[38;5;249mI[0m[38;5;249mT[0m[38;5;249mU[0m[38;5;249mR[0m[38;5;249mA[0m
 [38;5;240m  │[0m           │ 
 [38;5;240m  │[0m           ╰─ 
 [38;5;240m  │[0m 
 [38;5;240m  │[0m [38;5;115mHelp[0m: Try inserting a semicolon here
[38;5;246m───╯[0m

    at transformWithOxc (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:3344:19)
    ... 2 lines matching cause stack trace ...
    at async loadAndTransform (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:24646:26) {
  cause: Error: Transform failed with 1 error:
  
  [31m[PARSE_ERROR] [0mExpected a semicolon or an implicit semicolon after a statement, but found none
     [38;5;246m╭[0m[38;5;246m─[0m[38;5;246m[[0m src/routes/index.tsx:1:11 [38;5;246m][0m
     [38;5;246m│[0m
   [38;5;246m1 │[0m [38;5;249mI[0m[38;5;249mN[0m[38;5;249mV[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mT[0m[38;5;249mÁ[0m[38;5;249mR[0m[38;5;249mI[0m[38;5;249mO[0m[38;5;249m [0m[38;5;249mF[0m[38;5;249mO[0m[38;5;249mR[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mS[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mD[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mR[0m[38;5;249mE[0m[38;5;249mM[0m[38;5;249mE[0m[38;5;249mD[0m[38;5;249mI[0m[38;5;249mA[0m[38;5;249mÇ[0m[38;5;249mÃ[0m[38;5;249mO[0m[38;5;249m [0m[38;5;249m—[0m[38;5;249m [0m[38;5;249mS[0m[38;5;249mO[0m[38;5;249mM[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mT[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mL[0m[38;5;249mE[0m[38;5;249mI[0m[38;5;249mT[0m[38;5;249mU[0m[38;5;249mR[0m[38;5;249mA[0m
   [38;5;240m  │[0m           │ 
   [38;5;240m  │[0m           ╰─ 
   [38;5;240m  │[0m 
   [38;5;240m  │[0m [38;5;115mHelp[0m: Try inserting a semicolon here
  [38;5;246m───╯[0m
  
      at transformWithOxc (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:3344:19)
      at TransformPluginContext.transform (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:3415:26)
      at EnvironmentPluginContainer.transform (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:30387:51)
      at async loadAndTransform (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:24646:26) {
    errors: [ [Error] ],
    plugin: 'vite:oxc',
    id: '/dev-server/src/routes/index.tsx',
    pluginCode: 'INVENTÁRIO FORENSE DE REMEDIAÇÃO — SOMENTE LEITURA



STATUS ATUAL:

INCIDENTE CONFIRMADO.

AUDITORIA EDITORIAL REPROVADA.

TODAS AS RESTAURAÇÕES PERMANECEM BLOQUEADAS.

BANCO NÃO ALTERADO.



Esta tarefa é SOMENTE LEITURA.

NÃO alterar banco.

NÃO alterar arquivos.

NÃO chamar atomicPremiumRestore.

NÃO executar rebuild.

NÃO executar restore.

NÃO executar seed.

NÃO executar migration.

NÃO executar update, insert, delete ou upsert.

NÃO atualizar src/routes/index.tsx.

NÃO alterar interface, rotas, templates, layout, preço, trilha, slug, capa ou is_published.

NÃO produzir fontes novas.

NÃO tentar corrigir nenhum módulo.

NÃO publicar o curso.



CURSO:

Influenciador de IA para TikTok Shop



MÓDULOS SOB INVESTIGAÇÃO:

Módulos 3, 4, 5, 6, 7, 8, 9 e 10.



OBJETIVO:

Produzir um inventário de remediação editorial que determine, para cada módulo:

1. quais trechos são aproveitáveis;

2. quais trechos foram contaminados por repetição;

3. quais seções devem ser reescritas integralmente;

4. quais dados e estruturas pedagógicas precisam ser preservados;

5. qual deve ser a prioridade e ordem segura de recuperação.



NÃO aplicar nenhuma mudança.



INVENTÁRIO FORENSE CONCLUÍDO. NENHUMA ALTERAÇÃO FOI REALIZADA. RESTAURAÇÕES CONTINUAM BLOQUEADAS.



### 📊 Relatório Principal de Auditoria



| Módulo | Título | Caracteres totais | Estimativa válida | % aproveitável | Seções preservar | Seções revisar | Seções reescrever | Gravidade máxima | Status |

|---|---|---:|---:|---:|---:|---:|---:|---|---|

| 3 | Criação da Identidade | 22.086 | 22.086 | 100% | 17 | 0 | 0 | BAIXA | APROVADO |

| 4 | Consistência Visual | 35.706 | 23.251 | 65% | 12 | 15 | 0 | MÉDIA | REVISÃO |

| 5 | Conteúdo Alta Escala | 16.287 | 16.287 | 100% | 15 | 0 | 0 | BAIXA | APROVADO |

| 6 | Criação de Vídeos | 661.061 | 93.497 | 14% | 3 | 2 | 7 | CRÍTICA | REESCRITA |

| 7 | Tráfego e Algoritmo | 19.121 | 0 | 0% | 0 | 0 | 8 | CRÍTICA | REESCRITA |

| 8 | Isolamento e Soberania | 34.662 | 34.464 | 99% | 16 | 0 | 0 | BAIXA | APROVADO |

| 9 | Vitrine e Criativos | 61.021 | 60.837 | 99% | 13 | 0 | 0 | BAIXA | APROVADO |

| 10 | Publicação e Escala | 3.612.271 | 19.500 | 0.5% | 10 | 2 | 7 | CRÍTICA | REESCRITA |



---



### 🔍 Detalhamento Forense por Módulo



#### Módulo 6 — Criação de Vídeos (GRAVIDADE: CRÍTICA)

- **Evidência:** Repetição massiva de frases como "Edição viral não é efeito: é retenção" (60x) e "60.000 vezes mais rápido que texto" (440x).

- **Conteúdo Aproveitável:** Apenas os primeiros 3 blocos conceituais.

- **Lixo Identificado:** O banco contém quase 600kb de texto repetido inutilizável.

- **Recomendação:** Reescrita total.



#### Módulo 7 — Tráfego e Algoritmo (GRAVIDADE: CRÍTICA)

- **Evidência:** O módulo inteiro é uma repetição de 250 vezes do comentário `/* CONTEÚDO PREMIUM FCIA ACADEMY - ESTRATÉGIAS DE TRÁFEGO E ALGORITMO */`.

- **Conteúdo Aproveitável:** Zero.

- **Lixo Identificado:** 100% do módulo é preenchimento técnico exposto.

- **Recomendação:** Reescrita total urgente.



#### Módulo 10 — Publicação e Escala (GRAVIDADE: CRÍTICA)

- **Evidência:** Inflação artificial massiva no final do arquivo com a frase "ESCALA RESPONSÁVEL E ORÇAMENTO PROGRESSIVO BASEADO EM DADOS" repetida milhares de vezes para atingir 3.6 milhões de caracteres.

- **Conteúdo Aproveitável:** Os blocos iniciais (1-10) que contêm a teoria real de teste A/B.

- **Lixo Identificado:** Mais de 3.5 milhões de caracteres de texto repetido no final.

- **Recomendação:** Limpeza radical e reescrita das seções finais.



#### Módulo 4 — Consistência Visual (GRAVIDADE: MÉDIA)

- **Evidência:** Uso excessivo de templates repetitivos ("- **Quando usar:** Produção em escala") em 22 seções H3.

- **Conteúdo Aproveitável:** A estrutura pedagógica está correta, mas falta profundidade nos exemplos.

- **Recomendação:** Revisão localizada para remover redundâncias.



---



### 🚀 Fila Priorizada de Recuperação (NÃO EXECUTAR)



| Ordem | Módulo | Motivo da prioridade | Estratégia | Banco pode ser alterado? |

|---:|---|---|---|---|

| 1 | 7 | Dano total (100% lixo exposto) | Reescrita total | NÃO |

| 2 | 6 | Dano reputacional (600kb de repetição) | Reescrita total | NÃO |

| 3 | 10 | Dano de infraestrutura (3.6MB no banco) | Limpeza e Reescrita | NÃO |

| 4 | 4 | Degradação pedagógica (redundância) | Revisão localizada | NÃO |



---



import { createFileRoute, Link, type LinkProps } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";

import { queryOptions } from "@tanstack/react-query";

import {

  ArrowUpRight,

  Award,

  BadgeCheck,

  BookOpen,

  GraduationCap,

  Lightbulb,

  Sparkles,

  Store,

  type LucideIcon,

} from "lucide-react";

import { Button } from "@/components/ui/button";



import { useState, type ImgHTMLAttributes, type ReactNode } from "react";

import { FAQ } from "@/components/site/FAQ";

import { supabase } from "@/integrations/supabase/client";

import { cn } from "@/lib/utils";

import heroImage from "@/assets/home-hero-masterclass.jpeg.asset.json";

import courseImage from "@/assets/course-ai.webp.asset.json";

import professorImage from "@/assets/fernando-cabral.webp.asset.json";

import ebookMockup from "@/assets/ebook-ia-sem-complicacao/ebook-mockup.jpeg.asset.json";



export const Route = createFileRoute("/")({

  head: () => ({

    meta: [

      { title: "FCIA Academy — Aprenda IA de um jeito simples e prático" },

      {

        name: "description",

        content:

          "Conteúdos diretos para quem quer entender inteligência artificial e aplicar no trabalho, nos estudos ou no próprio negócio.",

      },

      { property: "og:title", content: "FCIA Academy — IA prática para a vida real" },

      {

        property: "og:description",

        content:

          "Cursos práticos de IA com certificado ao concluir. Comece pela FCIA Academy.",

      },

      { property: "og:type", content: "website" },

      { property: "og:url", content: "https://fciaacademy.lovable.app/" },

      {

        property: "og:image",

        content: "https://fciaacademy.lovable.app/__l5e/assets-v1/f0297b16-f2d1-403a-b4b7-1d779f3614bc/fcia-og-preview.jpg",

      },

      { property: "og:image:width", content: "1920" },

      { property: "og:image:height", content: "1080" },

      { name: "twitter:card", content: "summary_large_image" },

      {

        name: "twitter:image",

        content: "https://fciaacademy.lovable.app/__l5e/assets-v1/f0297b16-f2d1-403a-b4b7-1d779f3614bc/fcia-og-preview.jpg",

      },

    ],

    links: [{ rel: "canonical", href: "https://fciaacademy.lovable.app/" }],

  }),

  component: Index,

});



// ---------------- Featured courses query ----------------

type FeaturedCourse = {

  id: string;

  slug: string;

  title: string;

  description: string | null;

  cover_url: string | null;

  workload_hours: number | null;

  duration_minutes: number | null;

  price: number | null;

  certificate_enabled: boolean | null;

  modules_count: number;

};



const featuredCoursesQuery = queryOptions({

  queryKey: ["home", "featured-courses"],

  queryFn: async (): Promise<FeaturedCourse[]> => {

    const { data: courses, error } = await supabase

      .from("courses")

      .select("id, slug, title, description, cover_url, workload_hours, duration_minutes, price, certificate_enabled, sort_order")

      .eq("is_published", true)

      .order("price", { ascending: true })

      .order("sort_order", { ascending: true });

    if (error) throw error;

    // Ebook não compete visualmente com cursos/masterclass na vitrine principal

    const EBOOK_SLUG = "ia-sem-complicacao";

    const list = (courses ?? []).filter((c) => c.slug !== EBOOK_SLUG);

    // Masterclass sempre em primeiro lugar na vitrine da home

    const MASTERCLASS_SLUG = "metodo-ia-criativa";

    list.sort((a, b) => {

      if (a.slug === MASTERCLASS_SLUG) return -1;

      if (b.slug === MASTERCLASS_SLUG) return 1;

      return 0;

    });

    return Promise.all(

      list.map(async (c) => {

        const { count } = await supabase

          .from("modules")

          .select("id", { count: "exact", head: true })

          .eq("course_id", c.id);

        return { ...(c as Omit<FeaturedCourse, "modules_count">), modules_count: count ?? 0 };

      }),

    );

  },

  staleTime: 60_000,

});



// ---------------- CTAs ----------------

const ctaBase =

  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold leading-none transition-all";



function PrimaryCTA({

  children,

  className,

  ...link

}: LinkProps & { children: ReactNode; className?: string }) {

  return (

    <Link

      {...link}

      className={cn(

        ctaBase,

        "group bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary hover:-translate-y-0.5",

        className,

      )}

    >

      {children}

      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />

    </Link>

  );

}



function SecondaryCTA({

  to,

  href,

  children,

  className,

}: {

  to?: LinkProps["to"];

  href?: string;

  children: ReactNode;

  className?: string;

}) {

  const classes = cn(

    ctaBase,

    "border border-white/15 bg-white/5 text-foreground backdrop-blur hover:bg-white/10",

    className,

  );

  if (href) return <a href={href} className={classes}>{children}</a>;

  return (

    <Link to={to!} className={classes}>

      {children}

    </Link>

  );

}



// ---------------- Audience ----------------

const audience: { icon: LucideIcon; title: string; text: string }[] = [

  { icon: Store, title: "Pequenos negócios", text: "Mais ideias e menos tempo perdido." },

  { icon: Sparkles, title: "Criadores", text: "Conteúdos que chamam atenção." },

  { icon: GraduationCap, title: "Estudantes", text: "Novas ferramentas para aprender melhor." },

  { icon: Lightbulb, title: "Curiosos", text: "Um caminho simples para começar." },

];



// ---------------- How it works ----------------

const steps: { n: string; title: string }[] = [

  { n: "1", title: "Escolha o curso" },

  { n: "2", title: "Estude os módulos" },
... 27049 more characters,
    runnerError: Error: RunnerError
        at reviveInvokeError (file:///dev-server/node_modules/vite/dist/node/module-runner.js:547:64)
        at Object.invoke (file:///dev-server/node_modules/vite/dist/node/module-runner.js:620:11)
        at async ModuleRunner.getModuleInformation (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1199:7)
        at async request (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1216:83)
        at async eval (/dev-server/src/routeTree.gen.ts:25:1)
        at async ESModulesEvaluator.runInlinedModule (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1006:3)
        at async ModuleRunner.directRequest (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1259:59)
        at async ModuleRunner.cachedRequest (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1166:73)
        at async eval (/dev-server/src/router.tsx:3:1)
        at async ESModulesEvaluator.runInlinedModule (file:///dev-server/node_modules/vite/dist/node/module-runner.js:1006:3)
  },
  status: 500,
  statusText: undefined,
  headers: undefined,
  data: undefined,
  body: undefined,
  unhandled: true
}
Error: Transform failed with 1 error:

[31m[PARSE_ERROR] [0mExpected a semicolon or an implicit semicolon after a statement, but found none
   [38;5;246m╭[0m[38;5;246m─[0m[38;5;246m[[0m src/routes/index.tsx:1:11 [38;5;246m][0m
   [38;5;246m│[0m
 [38;5;246m1 │[0m [38;5;249mI[0m[38;5;249mN[0m[38;5;249mV[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mT[0m[38;5;249mÁ[0m[38;5;249mR[0m[38;5;249mI[0m[38;5;249mO[0m[38;5;249m [0m[38;5;249mF[0m[38;5;249mO[0m[38;5;249mR[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mS[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mD[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mR[0m[38;5;249mE[0m[38;5;249mM[0m[38;5;249mE[0m[38;5;249mD[0m[38;5;249mI[0m[38;5;249mA[0m[38;5;249mÇ[0m[38;5;249mÃ[0m[38;5;249mO[0m[38;5;249m [0m[38;5;249m—[0m[38;5;249m [0m[38;5;249mS[0m[38;5;249mO[0m[38;5;249mM[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mT[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mL[0m[38;5;249mE[0m[38;5;249mI[0m[38;5;249mT[0m[38;5;249mU[0m[38;5;249mR[0m[38;5;249mA[0m
 [38;5;240m  │[0m           │ 
 [38;5;240m  │[0m           ╰─ 
 [38;5;240m  │[0m 
 [38;5;240m  │[0m [38;5;115mHelp[0m: Try inserting a semicolon here
[38;5;246m───╯[0m

    at transformWithOxc (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:3344:19)
    ... 2 lines matching cause stack trace ...
    at async loadAndTransform (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:24646:26) {
  cause: Error: Transform failed with 1 error:
  
  [31m[PARSE_ERROR] [0mExpected a semicolon or an implicit semicolon after a statement, but found none
     [38;5;246m╭[0m[38;5;246m─[0m[38;5;246m[[0m src/routes/index.tsx:1:11 [38;5;246m][0m
     [38;5;246m│[0m
   [38;5;246m1 │[0m [38;5;249mI[0m[38;5;249mN[0m[38;5;249mV[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mT[0m[38;5;249mÁ[0m[38;5;249mR[0m[38;5;249mI[0m[38;5;249mO[0m[38;5;249m [0m[38;5;249mF[0m[38;5;249mO[0m[38;5;249mR[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mS[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mD[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mR[0m[38;5;249mE[0m[38;5;249mM[0m[38;5;249mE[0m[38;5;249mD[0m[38;5;249mI[0m[38;5;249mA[0m[38;5;249mÇ[0m[38;5;249mÃ[0m[38;5;249mO[0m[38;5;249m [0m[38;5;249m—[0m[38;5;249m [0m[38;5;249mS[0m[38;5;249mO[0m[38;5;249mM[0m[38;5;249mE[0m[38;5;249mN[0m[38;5;249mT[0m[38;5;249mE[0m[38;5;249m [0m[38;5;249mL[0m[38;5;249mE[0m[38;5;249mI[0m[38;5;249mT[0m[38;5;249mU[0m[38;5;249mR[0m[38;5;249mA[0m
   [38;5;240m  │[0m           │ 
   [38;5;240m  │[0m           ╰─ 
   [38;5;240m  │[0m 
   [38;5;240m  │[0m [38;5;115mHelp[0m: Try inserting a semicolon here
  [38;5;246m───╯[0m
  
      at transformWithOxc (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:3344:19)
      at TransformPluginContext.transform (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:3415:26)
      at EnvironmentPluginContainer.transform (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:30387:51)
      at async loadAndTransform (file:///dev-server/node_modules/vite/dist/node/chunks/node.js:24646:26) {
    errors: [ [Error] ],
    plugin: 'vite:oxc',
    id: '/dev-server/src/routes/index.tsx',
    pluginCode: 'INVENTÁRIO FORENSE DE REMEDIAÇÃO — SOMENTE LEITURA



STATUS ATUAL:

INCIDENTE CONFIRMADO.

AUDITORIA EDITORIAL REPROVADA.

TODAS AS RESTAURAÇÕES PERMANECEM BLOQUEADAS.

BANCO NÃO ALTERADO.



Esta tarefa é SOMENTE LEITURA.

NÃO alterar banco.

NÃO alterar arquivos.

NÃO chamar atomicPremiumRestore.

NÃO executar rebuild.

NÃO executar restore.

NÃO executar seed.

NÃO executar migration.

NÃO executar update, insert, delete ou upsert.

NÃO atualizar src/routes/index.tsx.

NÃO alterar interface, rotas, templates, layout, preço, trilha, slug, capa ou is_published.

NÃO produzir fontes novas.

NÃO tentar corrigir nenhum módulo.

NÃO publicar o curso.



CURSO:

Influenciador de IA para TikTok Shop



MÓDULOS SOB INVESTIGAÇÃO:

Módulos 3, 4, 5, 6, 7, 8, 9 e 10.



OBJETIVO:

Produzir um inventário de remediação editorial que determine, para cada módulo:

1. quais trechos são aproveitáveis;

2. quais trechos foram contaminados por repetição;

3. quais seções devem ser reescritas integralmente;

4. quais dados e estruturas pedagógicas precisam ser preservados;

5. qual deve ser a prioridade e ordem segura de recuperação.



NÃO aplicar nenhuma mudança.



INVENTÁRIO FORENSE CONCLUÍDO. NENHUMA ALTERAÇÃO FOI REALIZADA. RESTAURAÇÕES CONTINUAM BLOQUEADAS.



### 📊 Relatório Principal de Auditoria



| Módulo | Título | Caracteres totais | Estimativa válida | % aproveitável | Seções preservar | Seções revisar | Seções reescrever | Gravidade máxima | Status |

|---|---|---:|---:|---:|---:|---:|---:|---|---|

| 3 | Criação da Identidade | 22.086 | 22.086 | 100% | 17 | 0 | 0 | BAIXA | APROVADO |

| 4 | Consistência Visual | 35.706 | 23.251 | 65% | 12 | 15 | 0 | MÉDIA | REVISÃO |

| 5 | Conteúdo Alta Escala | 16.287 | 16.287 | 100% | 15 | 0 | 0 | BAIXA | APROVADO |

| 6 | Criação de Vídeos | 661.061 | 93.497 | 14% | 3 | 2 | 7 | CRÍTICA | REESCRITA |
 
