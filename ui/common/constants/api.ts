import { isDevOrExperimental, isLocal } from '../utils/environment'

export const WEB_APP_URL = 'https://app.fedi.xyz'
export const WEB_APP_URL_STAGING = 'https://fedi-ashen.vercel.app'
// Local web can serve from a non-default port (e.g. isolated e2e runs).
export const WEB_APP_URL_LOCAL =
    (typeof window !== 'undefined' && window.location?.origin) ||
    'http://localhost:3000'

// Checking isLocal allows web to hit localhost endpoints and avoid CORS issues
export const API_ORIGIN = isLocal()
    ? WEB_APP_URL_LOCAL
    : isDevOrExperimental
      ? WEB_APP_URL_STAGING
      : WEB_APP_URL

// TODO: move these to URLs hosted on app.fedi.xyz
export const FEDIBTC_META_JSON_URL = 'https://meta.dev.fedibtc.com/meta.json'
export const PUBLIC_COMMUNITIES_META_JSON_URL = isDevOrExperimental
    ? `${API_ORIGIN}/meta-communities-nightly.json`
    : 'https://meta.dev.fedibtc.com/meta-communities.json'

export const PUBLIC_FEDERATIONS_API_URL = `${API_ORIGIN}/api/federations`
export const AUTOSELECT_FEDERATIONS_API_URL = `${API_ORIGIN}/api/autoselect-federations`

// Federation discovery timeouts. The centralized API is blocked in some
// regions (e.g. Cuba), so `auto` bounds the API attempt and falls back to
// Nostr. Tune these to trade responsiveness against reliability: spending
// too little time on Nostr can miss slow relays, too much delays the user.
export const API_DISCOVERY_TIMEOUT_MS = 10_000
export const NOSTR_DISCOVERY_TIMEOUT_MS = 15_000
