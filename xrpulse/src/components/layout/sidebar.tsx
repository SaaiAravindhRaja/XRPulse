"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, LayoutDashboard, Database, PieChart, LogOut, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWallet } from "@/context/wallet-context"

interface SidebarProps {
    role: 'clinic' | 'investor'
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname()
    const { disconnectWallet } = useWallet()

    const links = role === 'clinic' ? [
        { href: '/clinic/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/clinic/create', label: 'List Asset', icon: Database },
    ] : [
        { href: '/investor/dashboard', label: 'Marketplace', icon: LayoutDashboard },
        { href: '/investor/portfolio', label: 'Portfolio', icon: PieChart }, // Assuming we split this later
    ]

    return (
        <div className="w-64 border-r border-slate-800 bg-slate-950/50 flex flex-col h-screen sticky top-0">
            {/* Brand */}
            <Link href="/" className="p-6 border-b border-slate-800 flex items-center gap-2 hover:bg-slate-900/50 transition-colors">
                <Activity className="w-6 h-6 text-emerald-500" />
                <span className="font-bold text-lg tracking-tight text-white">XRPulse</span>
            </Link>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-slate-800 text-white border border-slate-700"
                                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isActive ? "text-emerald-400" : "text-slate-500")} />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 space-y-2">
                <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                    Settings
                </button>
                <button
                    onClick={disconnectWallet}
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                </button>
            </div>
        </div>
    )
}
