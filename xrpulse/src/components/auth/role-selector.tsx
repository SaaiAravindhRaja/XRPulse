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
                "cursor-pointer transition-all hover:scale-[1.02] border-2 border-transparent hover:border-primary/20",
                color === "blue" ? "hover:shadow-blue-500/10" : "hover:shadow-emerald-500/10"
            )}
        >
            <CardHeader>
                <div className="mb-4 p-3 bg-slate-50 w-fit rounded-xl">{icon}</div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm font-medium text-slate-600 group">
                    Get Started <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </div>
            </CardContent>
        </Card>
    )
}
