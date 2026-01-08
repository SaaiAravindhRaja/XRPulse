"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, TrendingUp, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoleSelectorProps {
    onSelect: (role: 'clinic' | 'investor') => void
}

export function RoleSelector({ onSelect }: RoleSelectorProps) {
    return (
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
            <RoleCard
                icon={<Building2 className="w-8 h-8 text-blue-500" />}
                title="Medical Clinic"
                description="I want to list medical machines for funding."
                onClick={() => onSelect('clinic')}
                color="blue"
            />

            <RoleCard
                icon={<TrendingUp className="w-8 h-8 text-emerald-500" />}
                title="Liquidity Provider"
                description="I want to fund equipment and earn yield."
                onClick={() => onSelect('investor')}
                color="emerald"
            />
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RoleCard({ icon, title, description, onClick, color }: any) {
    return (
        <Card
            onClick={onClick}
            className={cn(
                "cursor-pointer transition-all duration-300 hover:scale-[1.02] border border-slate-700 bg-slate-900/50 backdrop-blur-md",
                color === "blue" ? "hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10" : "hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
            )}
        >
            <CardHeader>
                <div className={cn("mb-4 p-3 w-fit rounded-xl backdrop-blur-sm border",
                    color === "blue" ? "bg-blue-500/10 border-blue-500/20" : "bg-emerald-500/10 border-emerald-500/20"
                )}>
                    {icon}
                </div>
                <CardTitle className="text-xl text-white">{title}</CardTitle>
                <CardDescription className="text-slate-400">{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className={cn("flex items-center text-sm font-medium group",
                    color === "blue" ? "text-blue-400" : "text-emerald-400"
                )}>
                    Get Started <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </div>
            </CardContent>
        </Card>
    )
}
