# Event Photos

App de fotos de festa — Next.js + Supabase + Tailwind.

## Stack

- **Next.js 15** (App Router)
- **Supabase** — banco de dados (PostgreSQL) + armazenamento de fotos
- **Tailwind CSS** — estilização com tokens do design Polaroid/Analog

## Fluxo

1. Admin acessa `/admin`, faz login com as credenciais do `.env`
2. Cria um evento (nome, slug, data)
3. O sistema gera um **QR Code** com um token único embutido na URL
4. Convidados escaneiam o QR → são autenticados automaticamente via cookie
5. Sem o QR = tela de bloqueio ("peça o QR pro organizador")

## Setup

### 1. Supabase

- Crie um projeto em [supabase.com](https://supabase.com)
- No **SQL Editor**, rode o conteúdo de `supabase/schema.sql`
- Em **Storage**, crie um bucket chamado `photos` com **Public bucket = true**
- Copie a **Project URL**, **anon key** e **service_role key**

### 2. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha o `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

ADMIN_USER=admin
ADMIN_PASSWORD=sua_senha_aqui
```

### 3. Rodar localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) — redireciona para `/admin`.

## Deploy (Vercel)

1. Conecte o repositório na Vercel
2. Configure as mesmas variáveis de ambiente no painel da Vercel
3. Deploy automático a cada push

## Estrutura

```
src/
  app/
    admin/              → Painel admin (login + criar evento + QR)
    e/[slug]/           → App da festa (câmera + galeria)
      page.tsx          → Validação de sessão server-side
      TokenGatePage.tsx → Tela de bloqueio / validação de token
      PartyApp.tsx      → Shell da festa (tabs câmera/galeria)
      CameraScreen.tsx  → Câmera + captura + upload
      GalleryScreen.tsx → 4 layouts de galeria + lightbox
    api/
      admin/login       → POST /api/admin/login
      admin/events      → GET/POST /api/admin/events
      auth/validate     → POST /api/auth/validate (valida token do QR)
      photos            → GET/POST/DELETE /api/photos
  lib/
    supabase/           → Client, server e tipos
    auth.ts             → Cookies de sessão (admin + evento)
  supabase/
    schema.sql          → Schema do banco de dados
```
