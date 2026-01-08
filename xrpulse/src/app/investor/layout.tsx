"use client"

import { Sidebar } from "@/components/layout/sidebar"

export default function InvestorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar role="investor" />
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    )
}
