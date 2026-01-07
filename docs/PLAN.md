# Implementation Plan: VitalShare XRPL

**Strategy:** Vertical Slice. We build full features one by one.

## Phase 0: Project Initialization
- [ ] **Scaffold:** Initialize Next.js + Tailwind + Shadcn.
- [ ] **Dependencies:** Install `xrpl`, `@supabase/supabase-js`, `framer-motion`, `lucide-react`.
- [ ] **Env Setup:** Configure `.env.local` (XRPL Testnet WSS, Supabase Keys).
- [ ] **DB Setup:** Run Supabase SQL for `profiles` and `equipment` tables.

## Phase 1: Infrastructure & Mock Data
- [ ] **XRPL Utils:** Create `lib/xrpl-client.ts` to handle connections.
- [ ] **Mock RLUSD:** Create a script to fund a "Bank Wallet" and issue custom "RLUSD" tokens on Testnet to our test users.
- [ ] **Wallet Context:** Create React Context to manage connected wallet state.

## Phase 2: Slice A - Identity
- [ ] **Auth UI:** Simple "Connect Wallet" button.
- [ ] **Profile Page:** Form for Clinics to enter details (Name, License).
- [ ] **DB Sync:** Save Profile data to Supabase linked to Wallet Address.

## Phase 3: Slice B - Asset Creation (Clinic)
- [ ] **Listing Form:** UI to upload MRI image and set price.
- [ ] **Mint Logic:** `mint_nft` and `account_set` logic in XRPL.
- [ ] **Token Logic:** Issue the fractional tokens (`MRI-001`) to the Clinic's wallet.

## Phase 4: Slice C - Investing (Investor)
- [ ] **Marketplace UI:** Grid view of listed assets.
- [ ] **Invest Logic:** 
    1. Investor sets Trustline for `MRI-001`.
    2. Investor sends `RLUSD`.
    3. Clinic sends `MRI-001`.
- [ ] **Transaction Toast:** Display TX Hash on success.

## Phase 5: Demo Polish
- [ ] **Yield Button:** Script to distribute RLUSD dividends to token holders.
- [ ] **Landing Page:** High-impact hero section with Framer Motion.
- [ ] **Video:** Record the 3-minute demo.