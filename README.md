# plexys-corteza-support-tickets

A Vue 3 single-page application that manages Corteza `Support Ticket` records — built for the
Plexys front-end/full-stack homework. See [docs/documentation.md](docs/documentation.md) for the
full architecture, design decisions, user guide and admin guide (source for the submitted PDF).

> **Live demo (temporary):** https://backspin-cheese-salute.ngrok-free.dev — a free ngrok tunnel to
> the developer's local machine and Corteza instance. Only reachable while that machine, Docker,
> the dev server and the tunnel are all running; not a persistent deployment. On first visit,
> ngrok's free tier shows a one-time "visit site" warning page — click through to reach the app.
> If the link is down, use the local setup below instead.

## Stack

- Corteza `2024.9` (Docker: server + PostgreSQL 15)
- Vue 3, Composition API, TypeScript, Vite
- PrimeVue 5 (Aura theme)
- `@cortezaproject/corteza-js` (official REST client)
- OAuth2 `authorization_code` (hand-rolled composable, no PKCE support in Corteza 2024.9)

## Prerequisites

- Docker Desktop
- Node.js 20+ and npm

## Setup (clean clone)

### 1. Start Corteza

```powershell
cd corteza
copy .env.example .env
docker compose up -d
```

Open `http://localhost:18080` and complete the sign-up wizard. **The first account created is
automatically the instance super-admin** — this is your admin login.

### 2. Create a dedicated Auth Client

In Corteza Admin → **System → Auth clients → New**:

| Field | Value |
|---|---|
| Grant type | `authorization_code` |
| Redirect URI | `http://localhost:5173/callback` (must match exactly) |
| Scope | `profile api` |
| Trusted | off |

Save, then copy the generated **Client ID** and **Client secret** — you'll need them in step 4.

### 3. Create the namespace and module

In Corteza Admin's Compose builder (no code):

- Namespace slug: `plexys-homework`
- Module handle: `support-ticket`, with fields `Subject` (string, required), `Description`
  (string/multiline), `Status` (select: New, In Progress, Resolved, Closed — required), `Priority`
  (select: Low, Medium, High, Urgent — required), `DueDate` (date/time).
- Create 1–2 demo records to confirm the module works.

Full field/type table: [docs/documentation.md](docs/documentation.md#page-2--corteza-setup--data-model).

### 4. Run the frontend

```powershell
cd frontend
npm install
copy .env.example .env
```

Edit `frontend/.env` and fill in:

- `VITE_AUTH_CLIENT_ID` / `VITE_AUTH_CLIENT_SECRET` — from step 2.
- `VITE_PRIMEVUE_LICENSE_KEY` — PrimeVue 5 requires a personal, free Community-tier key even to
  run (individuals/small orgs/OSS all qualify). Get one at
  [primeui.dev/licenses/community](https://primeui.dev/licenses/community).

```powershell
npm run dev
```

Open `http://localhost:5173` and sign in with the Corteza account from step 1.

## Repository structure

```text
plexys-corteza-support-tickets/
├── corteza/          # Docker Compose setup for the Corteza instance
├── frontend/         # Vue 3 SPA
├── docs/             # Documentation source (architecture, decisions, guides)
└── README.md
```

## Known limitations

See [docs/documentation.md](docs/documentation.md#known-limitations) — notably: no PKCE in
Corteza 2024.9 (the Auth Client secret is unavoidably present in the compiled frontend bundle for
a backend-less SPA), and the PrimeVue 5 license-key requirement above.
