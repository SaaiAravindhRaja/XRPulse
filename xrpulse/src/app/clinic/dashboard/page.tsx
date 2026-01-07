"use client"

import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { ConnectWalletButton } from "@/components/auth/connect-wallet-button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { AssetCard } from "@/components/assets/asset-card"
import { Loader2, PlusCircle } from "lucide-react"
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
                    .select('amount_invested')
                    .eq('asset_id', asset.id)

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const totalFunding = investments?.reduce((sum, inv: any) => sum + inv.amount_invested, 0) || 0
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
        <div className="min-h-screen bg-slate-50">
            <header className="px-8 py-6 flex justify-between items-center border-b bg-white relative z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
                    <h1 className="text-xl font-bold tracking-tight">Clinic<span className="text-slate-400 font-normal">Console</span></h1>
                </div>
                <ConnectWalletButton />
            </header>

            <main className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header Action */}
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Your Equipment</h2>
                        <p className="text-slate-500 mt-1">Manage your tokenized real-world assets.</p>
                    </div>
                    <Link href="/clinic/create">
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            List New Asset
                        </Button>
                    </Link>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                ) : !walletAddress ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <h3 className="text-lg font-medium text-slate-800">Wallet Not Connected</h3>
                        <p className="text-slate-500 mb-6">Connect your wallet to view your equipment.</p>
                        <ConnectWalletButton />
                    </div>
                ) : assets.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <p className="text-slate-400 mb-4">No assets found for this wallet.</p>
                        <Link href="/clinic/create">
                            <Button variant="outline">Create your first Asset</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            </main>
        </div>
    )
}
