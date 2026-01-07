
"use client"

import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { ConnectWalletButton } from "@/components/auth/connect-wallet-button"

export default function InvestorDashboard() {
    const { profile } = useWallet()

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="px-8 py-6 flex justify-between items-center border-b bg-white">
                <h1 className="text-2xl font-bold">Investor Dashboard</h1>
                <ConnectWalletButton />
            </header>
            <main className="p-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-semibold mb-2">Welcome, {profile?.name || 'Investor'}</h2>
                    <p className="text-slate-600 mb-6">Explore high-yield medical infrastructure investments.</p>
                    <Button variant="secondary">Browse Marketplace</Button>
                </div>
            </main>
        </div>
    )
}
