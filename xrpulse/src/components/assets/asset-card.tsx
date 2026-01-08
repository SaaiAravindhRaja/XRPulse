
"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { HeartPulse, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface AssetCardProps {
    title: string
    description: string
    imageUrl: string
    fundingGoal: number
    currentFunding?: number
    roi: number
    sharePrice?: number
    status?: 'draft' | 'funding' | 'funded' | 'active'
    onAction?: () => void
    actionLabel?: string
    className?: string
}

export function AssetCard({
    title,
    description,
    imageUrl,
    fundingGoal,
    currentFunding = 0,
    roi,
    sharePrice = 100,
    status = 'draft',
    onAction,
    actionLabel = "View Details",
    className
}: AssetCardProps) {
    const progress = (currentFunding / fundingGoal) * 100

    return (
        <Card className={cn("glass-card overflow-hidden group border-slate-800", className)}>
            <div className="relative h-48 w-full overflow-hidden">
                {/* Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${imageUrl || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

                {/* ROI Badge */}
                <Badge className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-300 backdrop-blur-md border border-emerald-500/30 font-bold shadow-sm">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {roi}% APY
                </Badge>

                {/* Status Badge */}
                <Badge className={cn(
                    "absolute top-4 left-4 font-mono text-xs border border-white/10 backdrop-blur-md",
                    status === 'draft' && "bg-slate-800/80 text-slate-300",
                    status === 'funding' && "bg-blue-600/80 text-white animate-pulse shadow-lg shadow-blue-500/20",
                    status === 'active' && "bg-emerald-600/80 text-white shadow-lg shadow-emerald-500/20"
                )}>
                    {status.toUpperCase()}
                </Badge>

                <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h3 className="font-bold text-lg leading-tight mb-1 text-white">{title || "Untitled Asset"}</h3>
                    <p className="text-xs text-slate-300 line-clamp-1">{description || "No description provided."}</p>
                </div>
            </div>

            <CardContent className="p-5 space-y-5">
                {/* Funding Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-400">
                        <span className="text-emerald-400">{progress.toFixed(1)}% Funded</span>
                        <span>{currentFunding.toLocaleString()} / {fundingGoal.toLocaleString()} RLUSD</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-800" indicatorClassName="bg-gradient-to-r from-emerald-500 to-teal-400" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-900/50 p-3 rounded-lg text-center border border-slate-800">
                        <div className="text-xs text-slate-500 mb-1">Share Price</div>
                        <div className="font-mono font-bold text-slate-200">{sharePrice} RLUSD</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg text-center border border-slate-800 transition-colors hover:border-blue-500/30">
                        <div className="text-xs text-slate-500 mb-1">Impact</div>
                        <div className="font-mono font-bold text-blue-400 flex items-center justify-center gap-1">
                            <HeartPulse className="w-3 h-3" /> High
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0">
                <Button
                    onClick={onAction}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/20 border border-emerald-500/50"
                    disabled={!onAction}
                >
                    {actionLabel}
                </Button>
            </CardFooter>
        </Card>
    )
}
