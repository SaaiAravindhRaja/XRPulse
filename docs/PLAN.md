# XRPulse Implementation Strategy

**Objective:** Build "XRPulse," a high-frequency, fractionalized medical asset marketplace on the XRPL Testnet.
**Vibe:** Institutional, Trustworthy, "Pulse" (Life/Health), High-Tech.

---

## Phase 0: Foundation (Completed)
- [x] **Scaffold:** Next.js 14, Tailwind, Shadcn.
- [x] **Config:** Typescript, ESLint, Environment Variables.
- [x] **Core Libs:** `xrpl`, `@supabase/supabase-js`, `framer-motion`, `lucide-react`.

## Phase 1: The Pulse Core (Completed)
- [x] **Supabase Setup:** Schema for Profiles, Assets, Investments.
- [x] **XRPL Client:** Singleton for Testnet listening.
- [x] **Wallet Provider:** simple Context for managing connection.
- [x] **Mock Data:** Seeded RLUSD Issuer + 3 Assets (X-Ray, CT, Mobile).

## Phase 2: Slice A - Identity (Completed)
- [x] **Onboarding Flow:** Connect Wallet -> Role Selection.
- [x] **Dashboard Shells:** Clinic & Investor views routed correctly.

---

## Phase 3: Clinic - The Asset Studio (UI)
**Goal:** Create a beautiful, form-based interface for Clinics to list equipment.
- [ ] **Upload Form:** Form for Title, Description, Cost, ROI, Image URL.
- [ ] **Design:** Shadcn Cards, Input fields with "Medical" styling (clean, sterile, precise).

## Phase 4: Clinic - The Tokenization Engine (XRPL)
**Goal:** Connect the form to the XRP Ledger.
- [ ] **Mint Logic (`lib/actions/mint.ts`):** 
    - `NFTokenMint` (The Machine).
    - `AccountSet` (Configure Issuer).
    - `Payment` (Issue fractional `PULSE` tokens to self).
- [ ] **Saving:** Store the `TokenID` and `CurrencyCode` in Supabase.

## Phase 5: Investor - The Marketplace (UI)
**Goal:** A high-trust browsing experience for Investors.
- [ ] **Asset Grid:** Cards showing "Funding Progress", "APY", and "Impact".
- [ ] **Details View:** A deep dive modal showing the machine's specs and financial breakdown.

## Phase 6: Investor - Check Writing (XRPL)
**Goal:** The moment of funding.
- [ ] **Trustline Button:** "Enable Trading for PULSE-XRAY".
- [ ] **Invest Action:** 
    - Sending `RLUSD` to the Clinic.
    - Clinic sends `PULSE` tokens back (Simplified Swap).
    - *Note:* We will use direct payments for the MVP speed.

## Phase 7: The Pulse (Yield & Viz)
**Goal:** Visualize the impact.
- [ ] **Yield Script:** One-click button to distribute RLUSD dividends to all holders.
- [ ] **Heartbeat Visualizer:** A component that beats with every ledger close.