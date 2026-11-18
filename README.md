# LAZER DOWNLOADS

**Empresa:** LAZER EMPRESAS  
**Slogan:** Tudo o que procuras, pronto para baixar!

Plataforma moderna e segura de distribuição e descoberta de ficheiros digitais, aplicações, programas, jogos, músicas, vídeos, documentos e ferramentas, desenvolvida com **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** e **Supabase**.

---

## Tecnologias

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide React
- **Backend:** Next.js API Routes & Middleware SSR (`@supabase/ssr`)
- **Base de dados e Autenticação:** Supabase PostgreSQL + RLS + Supabase Auth
- **Armazenamento:** Supabase Storage (`downloads`, `covers`, `screenshots`, `branding`)
- **Hospedagem:** Vercel

---

## Configuração Local & Supabase

1. Cria um projeto no [Supabase](https://supabase.com).
2. No **SQL Editor** do Supabase, executa o ficheiro completo `supabase/schema.sql`. Este script cria:
   - Todas as tabelas (`categories`, `downloads`, `download_events`, `profiles`, `site_settings`, `advertisements`, `reports`, `favorites`, `contact_messages`)
   - Índices, chaves estrangeiras, triggers e a função RPC `record_download_and_increment`
   - Políticas de **Row Level Security (RLS)**
   - Buckets de Storage (`downloads`, `covers`, `screenshots`, `branding`) e políticas de acesso
   - As 10 categorias iniciais e configurações padrão
3. Copia `.env.example` para `.env.local` e preenche:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_GA_ID=
   ```
   > **Segurança:** Nunca exponhas `SUPABASE_SERVICE_ROLE_KEY` no frontend nem faças commit do `.env.local`.

4. Cria a tua primeira conta através de `/login` (Criar conta) e promove-a a administrador no **SQL Editor** do Supabase:
   ```sql
   update public.profiles
   set role = 'admin'
   where id = '<UUID_DO_UTILIZADOR>';
   ```
5. Opcionalmente, ativa o fornecedor **Google** em *Authentication → Providers → Google* no painel do Supabase e define o URL de callback `<SITE_URL>/auth/callback`.

6. Instala dependências e inicia o servidor:
   ```bash
   npm install
   npm run dev
   ```

---

## Deploy na Vercel

1. Liga o repositório GitHub (`LarsonLazer/Lazer-Downloads`) à [Vercel](https://vercel.com).
2. Configura as variáveis de ambiente na Vercel (*Project Settings → Environment Variables*) para **Production** e **Preview**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (URL de produção, ex: `https://downloads.lazerempresas.com`)
   - `NEXT_PUBLIC_GA_ID` (opcional)
3. Cada push para `main` gera deploy automático de produção; branches e Pull Requests geram **Preview Deployments**.
4. Para domínio personalizado, adiciona o domínio em *Vercel → Settings → Domains*, configura o registo DNS (`A` / `CNAME`) indicado pela Vercel e atualiza `NEXT_PUBLIC_SITE_URL` e os *Redirect URLs* no Supabase Auth.