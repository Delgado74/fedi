We have verified that when using a direct federation invite link or QR code, **VPN is NOT required** to join a federation. The VPN dependency only affects the **federation discovery** process (when browsing the list of public federations via the API).

### Summary of VPN Requirement:

| Action | VPN Required? | Reason |
|--------|---------------|--------|
| Joining via invite link/QR | **No** | Direct connection to federation, bypasses app.fedi.xyz API |
| Discovering federations in-app | **Yes** | Depends on centralized API (app.fedi.xyz/api/federations) which is blocked in some regions |
| Joining from discovered list | **Yes** | Same as above - requires VPN to access the federation list first |

### Implication:
The proposed solution (implementing Nostr for federation discovery, similar to ecash-app) would only need to cover the **discovery** use case. The **joining** flow via direct links/QR codes already works without VPN.

This means the Nostr implementation could be prioritized as a fallback for discovery only, since the core joining mechanism is already resilient to network restrictions.
