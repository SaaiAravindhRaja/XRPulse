
"use client"

import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { ConnectWalletButton } from "@/components/auth/connect-wallet-button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { AssetCard } from "@/components/assets/asset-card"
import { Loader2, SearchX, PieChart, Activity, Globe2 } from "lucide-react"
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
                .select('asset_id, amount_rlusd')

            // 3. Merge
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const enrichedData = (assetsData || []).map((asset: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const assetInvestments = investmentsData?.filter((inv: any) => inv.asset_id === asset.id) || []
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const totalFunding = assetInvestments.reduce((sum: number, inv: any) => sum + inv.amount_rlusd, 0)
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
                .select('asset_id, amount_rlusd')

            // 3. Map
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const myAssets = myInvestments?.map((inv: any) => {
                // Calculate global funding for this asset
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const assetTotalFunding = allInvestments
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ?.filter((i: any) => i.asset_id === inv.asset.id)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ?.reduce((sum: number, i: any) => sum + i.amount_rlusd, 0) || 0

                return {
                    ...inv.asset,
                    calculated_funding: assetTotalFunding,
                    my_shares: inv.amount_tokens,
                    my_invested: inv.amount_rlusd
                }
            }) || []

            setPortfolio(myAssets)
        } catch (e) {
            console.error("Failed to fetch portfolio", e)
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-100">
            <header className="px-8 py-6 flex justify-between items-center border-b border-slate-800/50 sticky top-0 z-10 w-full backdrop-blur-md bg-slate-950/80">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                        XRPulse Marketplace
                    </h1>
                </div>
                <ConnectWalletButton />
            </header>

            <main className="p-8 max-w-7xl mx-auto">
                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-4xl font-bold text-white tracking-tight">
                        Welcome, <span className="text-emerald-400">{isConnected ? (profile?.name || 'Investor') : 'Guest'}</span>
                    </h2>
                    <p className="text-slate-400 mt-2 text-lg max-w-2xl">
                        Discover and fund high-yield medical infrastructure assets powered by XRPL.
                    </p>
                </div>

                <Tabs defaultValue="marketplace" className="w-full space-y-8">
                    <TabsList className="bg-slate-900/50 p-1 h-auto border border-slate-800 rounded-full">
                        <TabsTrigger
                            value="marketplace"
                            className="px-6 py-2 rounded-full data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 hover:text-slate-200"
                        >
                            Marketplace
                        </TabsTrigger>
                        <TabsTrigger
                            value="portfolio"
                            className="px-6 py-2 rounded-full data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 hover:text-slate-200"
                        >
                            My Portfolio
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="marketplace" className="space-y-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                            </div>
                        ) : assets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-slate-900/40 rounded-3xl border border-dashed border-slate-700">
                                <div className="bg-slate-800/50 p-6 rounded-full mb-6">
                                    <SearchX className="w-10 h-10 text-slate-500" />
                                </div>
                                <h3 className="text-2xl font-medium text-slate-200">No active assets found</h3>
                                <p className="text-slate-500 max-w-md text-center mt-2">There are currently no medical assets open for funding. Check back later.</p>
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
                            <div className="flex flex-col items-center justify-center py-24 bg-slate-900/40 rounded-3xl border border-dashed border-slate-700">
                                <div className="bg-slate-800/50 p-6 rounded-full mb-6">
                                    <PieChart className="w-10 h-10 text-slate-500" />
                                </div>
                                <h3 className="text-2xl font-medium text-slate-200">Your portfolio is empty</h3>
                                <p className="text-slate-500 mb-8 text-center max-w-md mt-2">You haven&apos;t invested in any assets yet. Start building your medical real estate portfolio today.</p>
                                <Button
                                    onClick={() => (document.querySelector('[value="marketplace"]') as HTMLElement)?.click()}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                >
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
                onSuccess={() => {
                    fetchPortfolio()
                    fetchMarketplace()
                    // Optional: Switch to portfolio tab to show the new item
                    const portfolioTab = document.querySelector('[value="portfolio"]') as HTMLElement
                    if (portfolioTab) portfolioTab.click()
                }}
            />

            {/* Feature Highlights (Footer) */}
            <div className="max-w-7xl mx-auto px-8 pb-12 mt-12 grid md:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
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
        </div>
    )
}
