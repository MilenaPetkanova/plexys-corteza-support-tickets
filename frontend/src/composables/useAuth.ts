import { computed, ref } from 'vue'

// Config comes from the dedicated Corteza Auth Client (System > Auth clients).
// See frontend/.env.example.
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL as string
const CLIENT_ID = import.meta.env.VITE_AUTH_CLIENT_ID as string
const CLIENT_SECRET = import.meta.env.VITE_AUTH_CLIENT_SECRET as string
const REDIRECT_URI = import.meta.env.VITE_AUTH_REDIRECT_URI as string

// Corteza 2024.9 has no PKCE support; every Auth Client requires a secret,
// so the code exchange below must send it. This is a documented limitation
// of running a backend-less SPA against Corteza (see docs/limitations).
const SCOPE = 'profile api'

const OAUTH_STATE_KEY = 'corteza.auth.state'
const REFRESH_TOKEN_KEY = 'corteza.auth.refreshToken'

export interface CortezaUserInfo {
  sub: string
  name?: string
  preferred_username?: string
}

// Access token lives in memory only (never persisted); refresh token in
// sessionStorage. Module-level state -> useAuth() is a singleton composable.
const accessToken = ref<string | null>(null)
const user = ref<CortezaUserInfo | null>(null)
const isAuthenticated = computed(() => accessToken.value !== null)

let refreshTimer: ReturnType<typeof setTimeout> | undefined

function login(): void {
  const state = crypto.randomUUID()
  sessionStorage.setItem(OAUTH_STATE_KEY, state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    state,
  })

  window.location.assign(`${AUTH_BASE_URL}/oauth2/authorize?${params.toString()}`)
}

function logout(): void {
  accessToken.value = null
  user.value = null
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  if (refreshTimer) clearTimeout(refreshTimer)
}

// Reads ?code&state from the current URL after Corteza redirects back.
// Returns true if a code was found and successfully exchanged.
async function handleRedirectCallback(): Promise<boolean> {
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const oauthError = url.searchParams.get('error')

  if (oauthError) {
    throw new Error(url.searchParams.get('error_description') ?? oauthError)
  }

  if (!code) {
    return false
  }

  const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY)
  sessionStorage.removeItem(OAUTH_STATE_KEY)

  if (!state || state !== expectedState) {
    throw new Error('OAuth2 state mismatch; possible CSRF, aborting login')
  }

  await requestToken(
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  )

  window.history.replaceState({}, '', '/')
  return true
}

// Restores a session on page load/reload using the stored refresh token.
async function tryRestoreSession(): Promise<void> {
  const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) return

  try {
    await requestToken(
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    )
  } catch {
    logout()
  }
}

async function requestToken(body: URLSearchParams): Promise<void> {
  const res = await fetch(`${AUTH_BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
    },
    body,
  })

  const data = await res.json()

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? data.error ?? 'OAuth2 token request failed')
  }

  accessToken.value = data.access_token
  if (data.refresh_token) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token)
  }

  scheduleRefresh(data.expires_in)
  await fetchUserInfo()
}

function scheduleRefresh(expiresInSeconds: number): void {
  if (refreshTimer) clearTimeout(refreshTimer)
  // refresh a minute before expiry, never sooner than 5s out
  const delay = Math.max((expiresInSeconds - 60) * 1000, 5000)
  refreshTimer = setTimeout(() => {
    tryRestoreSession()
  }, delay)
}

async function fetchUserInfo(): Promise<void> {
  if (!accessToken.value) return

  const res = await fetch(`${AUTH_BASE_URL}/oauth2/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken.value}` },
  })

  if (res.ok) {
    user.value = await res.json()
  }
}

// Passed to corteza-js API clients so every request carries the signed-in
// user's own bearer token (not an impersonated/service token).
// Sync, per corteza-js's Ctor.accessTokenFn: () => string | undefined.
function accessTokenFn(): string | undefined {
  return accessToken.value ?? undefined
}

export function useAuth() {
  return {
    isAuthenticated,
    user,
    login,
    logout,
    handleRedirectCallback,
    tryRestoreSession,
    accessTokenFn,
  }
}
