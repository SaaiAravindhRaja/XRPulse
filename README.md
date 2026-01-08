# XRPulse

<div align="center">
  <img src="./XRPulse.png" width="40%" alt="XRPulse Banner" />
</div>

### The Heartbeat of Medical Finance 🏥⚡️

**XRPulse** is a decentralized marketplace for fractionalizing high-value medical infrastructure on the **XRPL (XRP Ledger)**. It mimics the tokenization of Real-World Assets (RWAs), allowing clinics to raise capital for expensive equipment (like MRI scanners) and investors to earn fractional yields.

---

## 🚀 Key Features

- **Clinic Dashboard**: List physical assets (MRI, X-Rays) as digital twins (NFTs) on XRPL.
- **Investor Marketplace**: Browse and fund medical equipment with instant settlements.
- **Fractional Ownership**: (Simulation) Purchase shares of high-value assets using RLUSD stablecoin.
- **Transparency**: All funding progress and asset metadata are secured on-chain.
- **Glassmorphism UI**: High-end, futuristic aesthetic built with Tailwind CSS & Shadcn UI.

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Realtime)
- **Blockchain**: XRPL (xrpl.js) - Testnet
- **Styling**: Tailwind CSS, Shadcn UI, Lucide Icons
- **State**: React Context (Wallet), LocalStorage (Role persistence)

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- Supabase Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SaaiAravindhRaja/XRPulse.git
   cd XRPulse/xrpulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

4. **Run the App**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🧪 Testing the Flow

1. **Connect Wallet**: It will auto-generate a funded Testnet wallet for you.
2. **Select Role**: Choose **Clinic** to list an asset.
3. **List Asset**: Fill in the form. This mints a URIToken on XRPL.
4. **Switch Role**: Disconnect, then connect again and choose **Investor**.
5. **Invest**: Go to the Marketplace and fund the asset derived from the Clinic.
