
"use client"

import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { ConnectWalletButton } from "@/components/auth/connect-wallet-button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { AssetCard } from "@/components/assets/asset-card"
import { Loader2, SearchX, PieChart } from "lucide-react"
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
            // 1. Fetch Assets
            const { data: assetsData, error: assetsError } = await supabase
                .from('assets')
                .select('*')
                .eq('status', 'funding')
                .order('created_at', { ascending: false })

            if (assetsError) throw assetsError

            // 2. Fetch All Investments (optimization: get all instead of N requests)
            const { data: investmentsData } = await supabase
                .from('investments')
                .select('asset_id, amount_invested')

            // 3. Merge
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const enrichedData = (assetsData || []).map((asset: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const assetInvestments = investmentsData?.filter((inv: any) => inv.asset_id === asset.id) || []
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const totalFunding = assetInvestments.reduce((sum: number, inv: any) => sum + inv.amount_invested, 0)
                return { ...asset, calculated_funding: totalFunding }
            })

            setAssets(enrichedData)
        } catch (e) {
            console.error("Failed to fetch marketplace", e)
        } finally {
            setIsLoading(false)
        }
    }

    async function fetchPortfolio() {
        if (!walletAddress) return
        try {
            // 1. Get My Investments (with Asset details)
            const { data: myInvestments, error } = await supabase
                .from('investments')
                .select(`
                    *,
                    asset:assets(*)
                `)
                .eq('investor_wallet', walletAddress)

            if (error) throw error

            // 2. Get Global Funding Layout (to show progress on card correctly)
            const { data: allInvestments } = await supabase
                .from('investments')
                .select('asset_id, amount_invested')

            // 3. Map
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const myAssets = myInvestments?.map((inv: any) => {
                // Calculate global funding for this asset
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const assetTotalFunding = allInvestments
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ?.filter((i: any) => i.asset_id === inv.asset.id)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ?.reduce((sum: number, i: any) => sum + i.amount_invested, 0) || 0

                return {
                    ...inv.asset,
                    calculated_funding: assetTotalFunding,
                    my_shares: inv.tokens_received,
                    my_invested: inv.amount_invested
                }
            }) || []

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
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                                <div className="bg-slate-50 p-4 rounded-full mb-4">
                                    <SearchX className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-medium text-slate-800">No active assets found</h3>
                                <p className="text-slate-500 max-w-sm text-center">There are currently no medical assets open for funding. Check back later.</p>
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
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                                <div className="bg-slate-50 p-4 rounded-full mb-4">
                                    <PieChart className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-medium text-slate-800">Your portfolio is empty</h3>
                                <p className="text-slate-500 mb-6 text-center max-w-sm">You haven&apos;t invested in any assets yet. Start building your medical real estate portfolio today.</p>
                                <Button onClick={() => (document.querySelector('[value="marketplace"]') as HTMLElement)?.click()}>
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
                                        currentFunding={asset.calculated_funding || 0}
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
