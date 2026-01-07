# XRPulse Implementation Strategy

**Objective:** Build "XRPulse," a high-frequency, fractionalized medical asset marketplace on the XRPL Testnet.
**Vibe:** Institutional, Trustworthy, "Pulse" (Life/Health), High-Tech.

---

## Phase 0: Foundation (Completed)
- [x] **Scaffold:** Next.js 14, Tailwind, Shadcn.
- [x] **Config:** Typescript, ESLint, Environment Variables.
- [x] **Core Libs:** `xrpl`, `@supabase/supabase-js`, `framer-motion`, `lucide-react`.

## Phase 1: The Pulse Core (Infrastructure)
Establish the heartbeat of the application: Connection to XRPL and Data Sync.

- [ ] **Supabase Setup:**
    - `profiles`: Links Wallet Address to User Metadata (Role, Name, Clinic ID).
    - `assets`: Stores off-chain metadata (MRI Specs, Photos, Location).
    - `investments`: Tracks off-chain history for quick UI (Synced with on-chain).
- [ ] **XRPL Client (`lib/xrpl.ts`):** 
    - Robust Singleton for connecting to Testnet.
    - Helper functions for `submitTransaction` and `subscribe`.
- [ ] **Wallet Provider (`context/wallet-context.tsx`):**
    - Manage Connected State.
    - Handle Signing (using `xrpl.Wallet` for local dev speed, or extension if needed).
    - **Mock Mode:** Pre-funded wallets for easy demoing.

## Phase 2: Slice A - Identity (The User Pulse)
- [ ] **Onboarding Flow:**
    - Landing Page: "Pulse of Healthcare Finance".
    - Login: Connect Wallet.
    - Profile Creation: "Are you identifying as a Clinic or an Liquidity Provider?"
- [ ] **Dashboard Shells:**
    - **Clinic View:** Asset Management.
    - **Investor View:** Portfolio Performance.

## Phase 3: Slice B - Asset Tokenization (The Creation)
The "Clinic" creates a Pulse (Asset).

- [ ] **Asset Studio UI:**
    - Form to upload Asset Image (Supabase Storage).
    - Set Funding Goal (e.g., 500k RLUSD).
    - Set Fractional Supply (e.g., 1000 Tokens).
- [ ] **On-Chain Logic (`lib/actions/tokenize.ts`):**
    - **Step 1:** Mint NFT (URIToken) representing the physical validator.
    - **Step 2:** AccountSet (Configure Issuer).
    - **Step 3:** Payment (Issue the Fractional Tokens to self).
    - **Step 4:** Create Offer / Setup Automated Market Maker (AMM) or simple Sell Offer.

## Phase 4: Slice C - Liquidity Injection (The Flow)
The "Investor" injects capital (RLUSD).

- [ ] **Marketplace UI:**
    - "Live Pulses" Grid.
    - Real-time funding progress bars.
- [ ] **Investment Logic:**
    - **Trustline:** Investor adds Trustline for Asset Token.
    - **Swap/Payment:** Investor sends RLUSD -> Clinic.
    - **Receive:** Clinic sends Asset Token -> Investor.
    - *Note:* We will use a simplified Direct Offer model for the MVP.

## Phase 5: The Heartbeat (Visualization & Yield)
- [ ] **Yield Distribution Script:**
    - "Simulate Monthly Revenue": Clinic pays 5% yield in RLUSD to all Asset Token Holders.
- [ ] **The "Pulse" Visualizer:**
    - Homepage component showing real-time ledger transactions as "heartbeats".
    - Use `xrpl` stream to listen for account activity.

## Phase 6: Final Polish
- [ ] **Design System:** Deep Navy Backgrounds, Neon Green/Blue Accents ("Medical Tech").
- [ ] **Error Handling:** Graceful failures with Toast notifications (Show Tx Hash!).
- [ ] **Demo Prep:** Scripted walk-through.