# Issue: VPN Dependency for Federation Discovery

## Status: Closed (2026-10-06)

After implementing and testing a decentralized (Nostr-based) fallback for
federation discovery, we decided to **keep the existing centralized Fedi service
as the only discovery mechanism** and close this issue.

### Why it is closed

1. **Privacy and security are better served by the centralized catalog.**
   Discovery through public Nostr relays would expose users' IPs and queries to
   third-party relay operators we do not control, and would allow those relays to
   inject unvalidated announcements (a phishing/join-by-mistake risk). The
   centralized API is a single, vetted, controlled source.

2. **The decentralized fallback did not work in the blocked region during
   testing.** The Nostr fallback (kind 38000, pooling each community's relays)
   was implemented and tested without VPN on a device. The community relays
   remained unreachable (geo-blocked), so no federations were discovered.
   Adding more public relays does not guarantee a bypass for network-level
   blocks, and only makes sense if the announcements are actually published to
   them.

3. **There is a supported, VPN-free way to join federations: invitation links
   and QR codes.** A member simply shares the federation's invite link or QR,
   and any user can join without VPN. This is the recommended workflow in
   geo-blocked locations.

### What was done

- Implemented an API-first discovery with Nostr fallback and a user-facing
  method selector (Settings → General → Federation discovery method).
- Tested without VPN on a physical device: the centralized API was
  unreachable and the Nostr fallback returned no federations.
- The parked implementation lives in branch `dev/fedi-cuba` for future
  reference if relay reachability or the privacy/trust tradeoffs change.

---

## Historical Problem (context)

Users of the Fedi Android app (especially in Cuba) needed a VPN to discover and
join federations, because the implementation depended on a centralized API that
was not reachable from certain locations due to network limitations and blocks.

1. Discover available public federations
2. Join a federation from the application

---

## Technical Analysis

### Fedi: centralized API

Uses a centralized endpoint:

```typescript
// ui/common/constants/api.ts
export const PUBLIC_FEDERATIONS_API_URL = `${API_ORIGIN}/api/federations`
// API_ORIGIN = 'https://app.fedi.xyz' (or staging)
```

**Flow:**
```
App Fedi → https://app.fedi.xyz/api/federations → available federations
```

### Proposed alternative: Nostr discovery (evaluated)

Other open-source wallets discover federations over public Nostr relays instead
of a centralized API. The flow is:

```
App → Nostr Public Relays → Public Federations List
```

The Federated Nostr announcement spec is tracked in fedimint PR #4636
(kind 38000). The nostril crate (in this repo) already implements publishing
and fetching kind-38000 announcements per that spec.

---

## Comparison (as evaluated)

| Feature | Fedi (centralized) | Nostr public relays |
|---------|--------------------|---------------------|
| Discovery method | Centralized API (app.fedi.xyz) | Decentralized relays |
| VPN required in blocked regions | Yes | Not guaranteed |
| External dependency | Own backend on app.fedi.xyz | Public Nostr relays |
| Censorship resistance | Low | High (in principle) |
| Privacy/trust | Single controlled source | IP + queries exposed to third-party operators |
| Data integrity | Vetted announcements | Relay can inject unvalidated announcements |
| Fallback | None (invite links are the supported join path) | — |

---

## Final Recommendation

- Keep federation **discovery** on the centralized Fedi service.
- Promote **invitation links / QR codes** as the supported join path in
  geo-blocked locations (works without VPN).
- Park the Nostr fallback implementation (branch `dev/fedi-cuba`) and revisit
  only if a relay topology/announcement set becomes reachable in blocked
  regions without sacrificing the privacy and integrity properties above.

---

## References

- Nostr federation announcement spec: [fedimint/fedimint PR #4636](https://github.com/fedimint/fedimint/pull/4636)
- Parked implementation (API-first + Nostr fallback + method selector): branch `dev/fedi-cuba`