_Please fill in as many fields as you can so we can swiftly investigate_

#### Detailed Description:
The CUP/USD exchange rate displayed in the Fedi app is incorrect. Fedi's internal price feed service (`price-feed.dev.fedibtc.com/latest`) returns a value implying **24 CUP = 1 USD**, but the actual market rate (verified directly on Yadio.io) is **~350-531 CUP = 1 USD**.

**Evidence:**
1. **Fedi Price Feed Query**:
   ```bash
   curl -s "https://price-feed.dev.fedibtc.com/latest" | grep "CUP/USD"
   # Result: "CUP/USD":{"rate":0.041666666666666664}
   # 0.041666 equals 1/24 → 24 CUP per USD
   ```

2. **Direct Yadio.io Query** (the source Fedi uses for other rates):
   ```bash
   curl -s "https://api.yadio.io/convert/1/USD/CUP"
   # Result: {"result":531,"rate":531}
   # 531 CUP per USD (real market rate)
   ```

3. **Related Code**:
   - Fedi fetches the price feed in `ui/common/redux/currency.ts:218`:
     ```typescript
     const response = await fetch('https://price-feed.dev.fedibtc.com/latest')
     ```
   - For BTC/USD, Fedi queries Yadio.io directly in `modules/stability-pool/server/src/oracle.rs:97`:
     ```rust
     "https://api.yadio.io/convert/1/BTC/USD"
     ```

**Root Cause:**
Fedi does not query Yadio.io directly for fiat currency rates (like CUP). Instead, it uses an intermediary service (`price-feed.dev.fedibtc.com`) which is serving outdated data for CUP. The value of 24 CUP/USD corresponds to Cuba's historical official rate, not the current market rate that Yadio.io correctly returns when queried directly.

#### Context
_Federation_: Victoria BTC and Tomyncal
_Fedi app version_: 26.4.4
_Phone OS_: Android 10 MIUI 12
_User Name_: 

#### How to reproduce:
1. Open the Fedi application
2. Change the preferred currency to **CUP** (Cuban Peso)
3. Go to *Settings > Developer Settings*
4. Check the value of `CUP/USD (API)`

#### Expected Behavior:
The `CUP/USD (API)` rate should display approximately `0.001883` (equivalent to ~531 CUP/USD, matching Yadio.io's actual market rate).

#### Actual Behavior: 
The `CUP/USD (API)` displays `0.041666` (equivalent to 24 CUP/USD), which is incorrect and corresponds to an outdated official rate.

#### Logs:
N/A (this is a data issue, not a crash)

#### Screenshots/Videos:
N/A
