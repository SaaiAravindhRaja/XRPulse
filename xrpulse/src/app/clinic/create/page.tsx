
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useWallet } from "@/context/wallet-context"
import { Loader2, UploadCloud, Stethoscope } from "lucide-react"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function CreateAssetPage() {
    const { walletAddress, isConnected } = useWallet()
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
        if (!walletAddress) return

        setIsLoading(true)
        try {
            // 1. Save Draft to Supabase
            const { error } = await supabase.from('assets').insert({
                clinic_wallet: walletAddress,
                title: formData.title,
                description: formData.description + ` (ROI: ${formData.roi}%)`,
                funding_goal_rlusd: parseFloat(formData.fundingGoal),
                share_price_rlusd: 100, // Fixed for demo
                total_shares: Math.floor(parseFloat(formData.fundingGoal) / 100),
                image_url: formData.imageUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514', // Default fallback
                status: 'draft'
            })

            if (error) throw error

            // 2. Redirect to Minting Flow (Phase 4)
            // For now, back to dashboard
            router.push('/clinic/dashboard')

        } catch (error) {
            console.error("Failed to create draft", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
            <Card className="w-full max-w-2xl shadow-lg border-t-4 border-t-emerald-500">
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
        </div>
    )
}
