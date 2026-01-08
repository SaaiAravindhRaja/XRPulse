"use client"

import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { ConnectWalletButton } from "@/components/auth/connect-wallet-button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { AssetCard } from "@/components/assets/asset-card"
import { Loader2, PlusCircle, Activity, Globe2, PieChart } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
export default function ClinicDashboard() {
    const { walletAddress } = useWallet()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [assets, setAssets] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAssets = async () => {
            if (!walletAddress) {
                setAssets([])
                setIsLoading(false)
                return
            }

            // 1. Fetch assets
            const { data: assetsData, error: assetsError } = await supabase
                .from('assets')
                .select('*')
                .eq('clinic_wallet', walletAddress)
                .order('created_at', { ascending: false })

            if (assetsError) {
                console.error("Error fetching assets:", assetsError)
                setIsLoading(false)
                return
            }

            // 2. Fetch investments for these assets (Manually to avoid FK dependence)
            const enrichedData = await Promise.all((assetsData || []).map(async (asset) => {
                const { data: investments } = await supabase
                    .from('investments')
                    .select('amount_rlusd')
                    .eq('asset_id', asset.id)

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const totalFunding = investments?.reduce((sum, inv: any) => sum + inv.amount_rlusd, 0) || 0
                return { ...asset, calculated_funding: totalFunding }
            }))

            setAssets(enrichedData)
            setIsLoading(false)
        }

        fetchAssets()
    }, [walletAddress])

    const { toast } = useToast()

    const handleWithdraw = (amount: number) => {
        if (amount <= 0) {
            toast({
                title: "No Funds Available",
                description: "This asset has not received any funding yet.",
                variant: "destructive"
            })
            return
        }

        toast({
            title: "Withdrawal Initiated",
            description: `Requesting transfer of $${amount.toLocaleString()} RLUSD to linked bank account.`,
        })
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-100">
            {/* Header Removed (Handled by Sidebar) */}
            <div className="flex justify-end p-8 pb-0">
                <ConnectWalletButton />
            </div>

            <main className="p-8 max-w-7xl mx-auto space-y-10">
                {/* Header Action */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 glass-panel p-8 rounded-3xl">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Your Equipment</h2>
                        <p className="text-slate-400 mt-2 text-lg">Manage your tokenized real-world assets and liquidity.</p>
                    </div>
                    <Link href="/clinic/create">
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border border-emerald-500/50 h-12 px-6 text-base">
                            <PlusCircle className="w-5 h-5 mr-2" />
                            List New Asset
                        </Button>
                    </Link>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                    </div>
                ) : !walletAddress ? (
                    <div className="text-center py-24 glass-panel rounded-3xl border-dashed border-slate-700">
                        <h3 className="text-2xl font-medium text-slate-200">Wallet Not Connected</h3>
                        <p className="text-slate-500 mb-8 mt-2 max-w-md mx-auto">Connect your wallet to view your equipment and manage your assets.</p>
                        <ConnectWalletButton />
                    </div>
                ) : assets.length === 0 ? (
                    <div className="text-center py-24 glass-panel rounded-3xl border-dashed border-slate-700">
                        <p className="text-slate-400 mb-6 text-lg">No assets found for this wallet.</p>
                        <Link href="/clinic/create">
                            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Create your first Asset</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {assets.map((asset) => (
                            <AssetCard
                                key={asset.id}
                                title={asset.title}
                                description={asset.description}
                                imageUrl={asset.image_url}
                                fundingGoal={asset.funding_goal_rlusd}
                                currentFunding={asset.calculated_funding || 0}
                                roi={parseFloat(asset.description.match(/ROI: ([\d.]+)%/)?.[1] || '0')}
                                status={asset.status}
                                actionLabel={asset.calculated_funding > 0 ? "Withdraw Funds" : "Manage Asset"}
                                onAction={() => handleWithdraw(asset.calculated_funding || 0)}
                            />
                        ))}
                    </div>
                )}

                {/* Feature Highlights (Footer) */}
                <div className="pb-12 mt-12 grid md:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-5 h-5 text-emerald-500" />
                            <h4 className="font-bold text-slate-200">Transparency</h4>
                        </div>
                        <p className="text-xs text-slate-400">Real-time tracking of funds and asset performance on the ledger.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe2 className="w-5 h-5 text-blue-500" />
                            <h4 className="font-bold text-slate-200">Global Access</h4>
                        </div>
                        <p className="text-xs text-slate-400">Seamless cross-border investment opportunities without barriers.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                        <div className="flex items-center gap-2 mb-2">
                            <PieChart className="w-5 h-5 text-purple-500" />
                            <h4 className="font-bold text-slate-200">Fractional Investing</h4>
                        </div>
                        <p className="text-xs text-slate-400">Invest in high-value medical equipment with accessible entry points.</p>
                    </div>
                </div>
            </main>
        </div>
    )
}
