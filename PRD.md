# PRD: VitalShare XRPL
**Fractionalized Medical Infrastructure Marketplace**

> **Hackathon:** NUS FinTech Summit 2026  
> **Network:** XRP Ledger (Testnet)  
> **Team Strategy:** Vibecoding / Vertical Slices

## 1. Product Vision
**VitalShare** is a decentralized marketplace where rural clinics can list high-cost medical equipment (MRIs, CT Scanners) for funding. Investors fund these using **RLUSD**, receiving fractional ownership tokens (RWAs) that yield returns from the clinic's lease payments.

## 2. Strategic Alignment
*   **Ripple Challenge:** Uses **RWA Tokenization** (Assets), **RLUSD** (Payments), and **Escrows** (Trust).
*   **BGA Bounty:** Addresses **SDG 3** (Health) and **SDG 10** (Inequality).

## 3. Core Features (The Vertical Slices)

### Slice A: Identity & Onboarding (DID)
*   **User Flow:** User lands on page -> Connects Wallet -> Selects Role (Clinic or Investor).
*   **XRPL Tech:** Wallet Generation/Connection.
*   **Off-chain:** Supabase Auth for linking Wallet Address to "Clinic Profile" (Name, Location, License).

### Slice B: The Asset Factory (RWA)
*   **User Flow:** Clinic clicks "List Equipment" -> Uploads photo/specs -> Sets Funding Goal ($500k).
*   **XRPL Tech:** 
    1.  **Mint NFT:** Represents the physical machine (Metadata points to Supabase).
    2.  **Issue Currency:** Create `VITAL-MRI-001` tokens (Fractional shares).
    3.  **Escrow:** Create an Escrow condition for incoming funds.

### Slice C: The Marketplace (RLUSD)
*   **User Flow:** Investor views dashboard -> Sees "MRI Machine" -> Inputs Investment Amount -> Confirms.
*   **XRPL Tech:** 
    1.  **Trustline:** Investor wallet sets trustline for `VITAL-MRI-001`.
    2.  **Payment:** Investor sends `RLUSD` (Testnet token) to Clinic's Escrow.
    3.  **Swap:** Clinic sends `VITAL-MRI-001` to Investor.

### Slice D: Yield Distribution (Impact)
*   **User Flow:** "Simulate Month End" button on Admin Dashboard.
*   **XRPL Tech:** Clinic wallet sends `RLUSD` payment to all holders of `VITAL-MRI-001` based on balance.

## 4. UI/UX Vibe
*   **Theme:** "Institutional Trust." Deep Navy Blues, Whites, and Emerald Greens.
*   **Components:** Shadcn/UI Cards, Tables, and Dialogs.
*   **Crucial:** All success toasts must show the **XRPL Transaction Hash**.


