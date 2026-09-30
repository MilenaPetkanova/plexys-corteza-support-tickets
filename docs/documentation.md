# Plexys Homework — Support Ticket App

## Overview & Architecture

A Vue 3 single-page application for managing Corteza `Support Ticket` records as the signed-in user.

### Stack

| Layer | Choice | Why |
| -------------- | ------------------------------------------- | -------------------------------------------------------------------------- |
| Backend | Corteza `2024.9` + PostgreSQL `15` (Docker) | Matches the official 2024.9 DevOps guide and keeps the setup reproducible. |
| Frontend | Vue 3, Composition API, TypeScript, Vite | Vue 3 and Composition API match the brief; TypeScript provides type checking, and Vite handles development and builds. |
| UI | PrimeVue 5 (Aura) | Accessible, responsive components without hand-rolled widgets. |
| Corteza client | `@cortezaproject/corteza-js` | Official framework-agnostic client; `corteza-vue` targets Vue 2 in 2024.9. |
| Auth | `useAuth` composable | Isolates the OAuth2 flow and authentication state from the UI. |

### Architecture

```text
┌─────────────────┐       ┌──────────────────────────┐
│    Vue 3 SPA    │──────▶│      Corteza 2024.9      │
│                 │◀──────│                          │
│ PrimeVue        │       │ Auth / OAuth2            │
│ useAuth         │       │ Compose REST API         │
│ corteza-js      │       └────────────┬─────────────┘
└─────────────────┘                    │
                                       ▼
                              ┌─────────────────┐
                              │   PostgreSQL 15 │
                              └─────────────────┘
```

The SPA handles presentation and authentication state; Corteza remains responsible for authentication, authorization, record management and persistence. API requests use the signed-in user's Bearer token.

### Key decisions

* **Hosting: standalone SPA** — Corteza's native web-app serving was evaluated, but a standalone frontend was chosen to keep it independent of the Corteza container. A temporary ngrok tunnel exposes the local frontend server for demonstration.
* **Authentication: `authorization_code`** — chosen because the SPA must act as the signed-in Corteza user rather than as a fixed service account, preserving user-level permissions and audit fields.

---

## Corteza Setup & Data Model

* **Instance:** Deployed via Docker Compose using the official Corteza DevOps configuration.
* **Namespace:** `Plexys Homework` (`plexys-homework`).
* **Module:** `Support Ticket` (`support-ticket`), created through Compose Builder.

| Field | Handle | Type | Required |
| ----------- | ------------- | ------------------ | -------- |
| Subject | `Subject` | String | Yes |
| Description | `Description` | String, multi-line | No |
| Status | `Status` | Select | Yes |
| Priority | `Priority` | Select | Yes |
| Due Date | `DueDate` | Date/Time | No |

**Status:** New / In Progress / Resolved / Closed
**Priority:** Low / Medium / High / Urgent

Corteza automatically maintains the standard audit and ownership fields (`createdBy`, `createdAt`, `updatedBy`, `updatedAt`, `ownedBy`), using the authenticated user's identity where applicable. Two demo records were created through the Compose UI.

---

## Frontend

```text
frontend/src/
├── composables/  useAuth.ts, useTickets.ts
├── services/     compose.ts
├── utils/        ticket.ts
└── components/   AppHeader, TicketList, TicketFormDialog
```

### Authentication

A dedicated Corteza Auth Client uses the OAuth2 `authorization_code` flow. The authorization code is exchanged for an access token; the access token stays in memory and the refresh token in `sessionStorage`. `corteza-js` receives the current token through `accessTokenFn()`.

### CRUD & UI

* **List:** responsive cards/table toggle; Status and Priority use both colour and icons.
* **Create/Edit:** shared `TicketFormDialog` with labelled fields, validation and toast feedback.
* **Delete:** confirmation dialog before removal.
* **Accessibility:** semantic landmarks, skip link, labelled controls, keyboard-operable dialogs, focus trapping and Escape handling.

---

## User Guide

1. **Sign in** — choose **Sign in with Corteza**, complete Corteza login/consent, and return to the app.
2. **View tickets** — use the card/table toggle in the header.
3. **Create** — choose **New ticket**, complete the form and select **Save**.
4. **Edit** — choose **Edit**, update the pre-filled form and save.
5. **Delete** — choose **Delete** and confirm.
6. **Sign out** — use the button next to the signed-in user's name.

---

## Admin / Technical Guide

### Instance & module

Run Corteza with Docker Compose, then configure the `Plexys Homework` namespace and `Support Ticket` module through Compose Builder as described above. The first registered account becomes the instance super-admin.

### Authentication & configuration

Create a dedicated Auth Client under **System → Auth clients** using `authorization_code` and the exact SPA redirect URI. Instance-wide OAuth2/session settings remain at Corteza's documented defaults.

The repository provides `.env.example` files for both `corteza/` and `frontend/`. Full clean-clone setup is documented in `README.md`.

### Known limitations

* **Related module:** The bonus second module was not implemented.
* **Demo availability:** The current ngrok setup is intended for demonstration, not production availability.
* **Authentication security:** Corteza 2024.9 does not support PKCE; the authorization-code client requires a client secret, which cannot remain confidential in a browser-only SPA.
* **Authentication UI:** The Corteza login and consent pages are currently unstyled.

### Next steps

* **Related module:** Add a related `Customer` module and picker.
* **Authentication:** Discuss a thin BFF with the team as a proposed approach to production authentication security.
* **Forms:** Improve form validation and provide clear field-level feedback.
* **Ticket listing:** Improve filtering logic and add pagination and sorting.
