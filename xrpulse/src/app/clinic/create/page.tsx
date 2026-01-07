"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useWallet } from "@/context/wallet-context"
import { Loader2, UploadCloud, Stethoscope, Eye } from "lucide-react"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { AssetCard } from "@/components/assets/asset-card"

// Buffer polyfill for browser if needed
export default function CreateAssetPage() {
    const { walletAddress, isConnected, wallet, connectWallet } = useWallet()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        fundingGoal: '',
        roi: '',
        imageUrl: ''
    })

    // Handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!walletAddress || !wallet) return

        setIsLoading(true)
        try {
            const { convertStringToHex } = require('xrpl')
            const hexURI = Buffer.from(formData.imageUrl || 'xrpulse-asset').toString('hex')

            // AUTO-FILL & SIGN Setup
            const { xrplClient } = await import('@/lib/xrpl')
            const client = xrplClient.client
            if (!client.isConnected()) await client.connect()


            // 1. XRPL: Configure Account as Issuer (Enable DefaultRipple)
            // ----------------------------------------------------------------
            // REQUIRED for Token Issuance
            const accountSetTx = {
                TransactionType: "AccountSet",
                Account: wallet.address,
                SetFlag: 8, // tfDefaultRipple
            }
            const preparedAccountSet = await client.autofill(accountSetTx)
            const signedAccountSet = wallet.sign(preparedAccountSet)
            await client.submitAndWait(signedAccountSet.tx_blob)


            // 2. XRPL: Mint the NFT (The Physical Asset)
            // ----------------------------------------------------------------
            const mintTx = {
                TransactionType: "NFTokenMint",
                Account: wallet.address,
                URI: hexURI,
                Flags: 8,
                NFTokenTaxon: 0,
            }

            const prepared = await client.autofill(mintTx)
            const signed = wallet.sign(prepared)
            const result = await client.submitAndWait(signed.tx_blob)

            if (result.result.meta.TransactionResult !== "tesSUCCESS") {
                throw new Error(`XRPL Mint Failed: ${result.result.meta.TransactionResult}`)
            }

            // Extract NFTokenID
            const dummyTokenID = "00080000" + signed.hash.slice(0, 56)


            // 3. XRPL: Define Fractional Token
            // ----------------------------------------------------------------
            const currencyCode = "PLS"


            // 4. Supabase: Save the Asset
            // ----------------------------------------------------------------
            // Hack: We append the Currency Code to the description since we can't alter the DB schema right now.
            const { error: dbError } = await supabase.from('assets').insert({
                clinic_wallet: walletAddress,
                title: formData.title,
                description: formData.description + ` (ROI: ${formData.roi}%) [Ticker: ${currencyCode}]`,
                funding_goal_rlusd: parseFloat(formData.fundingGoal),

                // Token Economics
                // currency_code: currencyCode, // Commented out until DB Migration
                share_price_rlusd: parseFloat(formData.fundingGoal) / 1000,
                total_shares: 1000,

                image_url: formData.imageUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514',
                status: 'funding',
                token_id: dummyTokenID,
                escrow_sequence: result.result.Sequence
            })

            if (dbError) throw dbError

            // 5. Success!
            router.push('/clinic/dashboard')

        } catch (error) {
            console.error("Minting Failed", error)
            alert("Minting Failed! See console.")
        } finally {
            setIsLoading(false)
        }
    }

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
                <Card className="w-full max-w-md shadow-lg text-center p-6">
                    <CardHeader>
                        <CardTitle>Wallet Disconnected</CardTitle>
                        <CardDescription>You must connect your wallet to mint assets on XRPL.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={connectWallet} className="w-full">
                            Connect Wallet
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
            <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-start">

                {/* Left: The Form */}
                <Card className="shadow-lg border-t-4 border-t-emerald-500">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                            <Stethoscope className="w-6 h-6" />
                            <span className="font-bold tracking-tight">XRPulse Asset Studio</span>
                        </div>
                        <CardTitle className="text-2xl">List New Medical Equipment</CardTitle>
                        <CardDescription>
                            create a digital twin (RWA) of your machine to raise capital in RLUSD.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Image URL (Mock Upload) */}
                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">Equipment Image URL</Label>
                                <div className="relative">
                                    <Input
                                        id="imageUrl"
                                        name="imageUrl"
                                        placeholder="https://..."
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        className="pl-10"
                                    />
                                    <UploadCloud className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                </div>
                                <p className="text-xs text-slate-500">Paste a direct link to an image (Unsplash, Supabase Storage, etc).</p>
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Equipment Name</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="e.g. Siemens Magnetom MRI"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fundingGoal">Funding Goal (RLUSD)</Label>
                                    <Input
                                        id="fundingGoal"
                                        name="fundingGoal"
                                        type="number"
                                        placeholder="500000"
                                        required
                                        value={formData.fundingGoal}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Clinical Description & Impact</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe the medical capability and patient impact..."
                                    className="h-24"
                                    required
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="roi">Estimated Annual Yield (%)</Label>
                                <Input
                                    id="roi"
                                    name="roi"
                                    type="number"
                                    placeholder="8.5"
                                    step="0.1"
                                    required
                                    value={formData.roi}
                                    onChange={handleChange}
                                />
                                <p className="text-xs text-slate-500">Based on projected lease payments from the clinic.</p>
                            </div>

                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-11" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Create & Mint Asset
                            </Button>

                        </form>
                    </CardContent>
                </Card>

                {/* Right: The Preview */}
                <div className="space-y-4 lg:sticky lg:top-8">
                    <div className="flex items-center gap-2 text-slate-500 px-1">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium uppercase tracking-wider">Live Preview</span>
                    </div>

                    <AssetCard
                        title={formData.title || "Siemens Magnetom MRI"}
                        description={formData.description || "High-field 1.5T MRI scanner for advanced neurological and orthopedic imaging."}
                        imageUrl={formData.imageUrl}
                        fundingGoal={parseFloat(formData.fundingGoal) || 500000}
                        currentFunding={0}
                        roi={parseFloat(formData.roi) || 8.5}
                        status="draft"
                        actionLabel="Minting (Preview)"
                        className="shadow-2xl ring-1 ring-slate-900/5"
                    />

                    <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100">
                        <p className="font-semibold mb-1">What happens next?</p>
                        <ul className="list-disc list-inside space-y-1 opacity-90">
                            <li>This Asset draft will be saved to Supabase.</li>
                            <li><span className="font-mono text-xs bg-blue-100 px-1 rounded">Phase 4</span> Logic will trigger.</li>
                            <li>We will mint a <strong>URIToken</strong> on XRPL.</li>
                            <li>We will issue <strong>Fractional Tokens</strong>.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
