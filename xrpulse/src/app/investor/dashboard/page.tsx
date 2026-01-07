
"use client"

import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { ConnectWalletButton } from "@/components/auth/connect-wallet-button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { AssetCard } from "@/components/assets/asset-card"
import { Loader2 } from "lucide-react"
import { TrustLineModal } from "@/components/invest/trustline-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InvestorDashboard() {
    const { profile, isConnected, walletAddress } = useWallet()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [assets, setAssets] = useState<any[]>([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [portfolio, setPortfolio] = useState<any[]>([])

    const [isLoading, setIsLoading] = useState(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedAsset, setSelectedAsset] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchMarketplace()
        if (walletAddress) fetchPortfolio()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletAddress])

    async function fetchMarketplace() {
        try {
            const { data, error } = await supabase
                .from('assets')
                .select('*')
                .eq('status', 'funding')
                .order('created_at', { ascending: false })

            if (error) throw error
            setAssets(data || [])
        } catch (e) {
            console.error("Failed to fetch marketplace", e)
        } finally {
            setIsLoading(false)
        }
    }

    async function fetchPortfolio() {
        if (!walletAddress) return
        try {
            // Join investments with assets
            const { data, error } = await supabase
                .from('investments')
                .select(`
                    *,
                    asset:assets(*)
                `)
                .eq('investor_wallet', walletAddress)

            if (error) throw error

            // Map to flat structure for AssetCard, using the joined 'asset' data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const myAssets = data?.map((inv: any) => ({
                ...inv.asset,
                my_shares: inv.tokens_received,
                my_invested: inv.amount_invested
            })) || []

            setPortfolio(myAssets)
        } catch (e) {
            console.error("Failed to fetch portfolio", e)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="px-8 py-6 flex justify-between items-center border-b bg-white sticky top-0 z-10 w-full backdrop-blur-md bg-white/80">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        XRPulse Marketplace
                    </h1>
                </div>
                <ConnectWalletButton />
            </header>

            <main className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">
                        Welcome, {isConnected ? (profile?.name || 'Investor') : 'Guest'}
                    </h2>
                    <p className="text-slate-600 mt-2 text-lg">
                        Discover and fund high-yield medical infrastructure assets powered by XRPL.
                    </p>
                </div>

                <Tabs defaultValue="marketplace" className="w-full space-y-8">
                    <TabsList className="bg-white p-1 h-auto border">
                        <TabsTrigger value="marketplace" className="px-6 py-2">Marketplace</TabsTrigger>
                        <TabsTrigger value="portfolio" className="px-6 py-2">My Portfolio</TabsTrigger>
                    </TabsList>

                    <TabsContent value="marketplace" className="space-y-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : assets.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                                <h3 className="text-xl font-medium text-slate-500">No active assets found</h3>
                                <p className="text-slate-400">Check back later for new listings.</p>
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
                                        currentFunding={asset.current_funding_rlusd || 0}
                                        roi={8.5}
                                        sharePrice={asset.share_price_rlusd || 100}
                                        status={asset.status}
                                        actionLabel="Invest Now"
                                        onAction={() => {
                                            setSelectedAsset(asset)
                                            setIsModalOpen(true)
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="portfolio">
                        {portfolio.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                                <h3 className="text-xl font-medium text-slate-500">Your portfolio is empty</h3>
                                <p className="text-slate-400 mb-4">You haven&apos;t invested in any assets yet.</p>
                                <Button variant="outline" onClick={() => (document.querySelector('[value="marketplace"]') as HTMLElement)?.click()}>
                                    Browse Marketplace
                                </Button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {portfolio.map((asset) => (
                                    <AssetCard
                                        key={asset.id}
                                        title={asset.title}
                                        description={asset.description}
                                        imageUrl={asset.image_url}
                                        fundingGoal={asset.funding_goal_rlusd}
                                        currentFunding={asset.current_funding_rlusd || 0}
                                        roi={8.5}
                                        sharePrice={asset.share_price_rlusd || 100}
                                        status="active" // Mark as active for portfolio
                                        actionLabel={`My Equity: ${asset.my_shares} Shares`}
                                        className="ring-2 ring-emerald-500/20"
                                        onAction={() => { }} // No action for now
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>

            <TrustLineModal
                asset={selectedAsset}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </div>
    )
}
