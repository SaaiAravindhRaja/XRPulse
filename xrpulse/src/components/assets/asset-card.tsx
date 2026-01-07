
"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { HeartPulse, TrendingUp, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface AssetCardProps {
    title: string
    description: string
    imageUrl: string
    fundingGoal: number
    currentFunding?: number
    roi: number
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
    status = 'draft',
    onAction,
    actionLabel = "View Details",
    className
}: AssetCardProps) {
    const progress = (currentFunding / fundingGoal) * 100

    return (
        <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300 group border-slate-200", className)}>
            <div className="relative h-48 w-full overflow-hidden">
                {/* Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${imageUrl || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

                {/* ROI Badge */}
                <Badge className="absolute top-4 right-4 bg-white/90 text-emerald-700 font-bold shadow-sm backdrop-blur-sm border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {roi}% APY
                </Badge>

                {/* Status Badge */}
                <Badge className={cn(
                    "absolute top-4 left-4 font-mono text-xs border-0",
                    status === 'draft' && "bg-slate-500/90 text-white",
                    status === 'funding' && "bg-blue-500/90 text-white animate-pulse",
                    status === 'active' && "bg-emerald-500/90 text-white"
                )}>
                    {status.toUpperCase()}
                </Badge>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-lg leading-tight mb-1">{title || "Untitled Asset"}</h3>
                    <p className="text-xs text-slate-200 line-clamp-1">{description || "No description provided."}</p>
                </div>
            </div>

            <CardContent className="p-4 space-y-4">
                {/* Funding Progress */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                        <span>{progress.toFixed(1)}% Funded</span>
                        <span>{currentFunding.toLocaleString()} / {fundingGoal.toLocaleString()} RLUSD</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-100" indicatorClassName="bg-emerald-500" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                        <div className="text-xs text-slate-500 mb-0.5">Share Price</div>
                        <div className="font-mono font-bold text-slate-700">100 RLUSD</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                        <div className="text-xs text-slate-500 mb-0.5">Impact</div>
                        <div className="font-mono font-bold text-blue-600 flex items-center justify-center gap-1">
                            <HeartPulse className="w-3 h-3" /> High
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button
                    onClick={onAction}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                    disabled={!onAction}
                >
                    {actionLabel}
                </Button>
            </CardFooter>
        </Card>
    )
}
