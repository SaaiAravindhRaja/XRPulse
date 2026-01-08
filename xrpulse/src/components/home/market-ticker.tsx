"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const MOCK_TRADES = [
    { asset: "Siemens MRI", action: "BUY", amount: "$5,000", time: "2s ago" },
    { asset: "Philips X-Ray", action: "BUY", amount: "$1,200", time: "5s ago" },
    { asset: "Dialysis Unit #4", action: "LIST", amount: "$50k Cap", time: "12s ago" },
    { asset: "Siemens MRI", action: "BUY", amount: "$500", time: "15s ago" },
    { asset: "CT Scanner", action: "MINT", amount: "New Asset", time: "30s ago" },
]

export function MarketTicker() {
    return (
        <div className="w-full bg-slate-950 border-y border-slate-800 overflow-hidden py-2 flex relative z-20">
            <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-slate-950 to-transparent z-10" />
            <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-slate-950 to-transparent z-10" />

            <div className="flex animate-scroll whitespace-nowrap gap-12 px-4">
                {[...MOCK_TRADES, ...MOCK_TRADES, ...MOCK_TRADES].map((trade, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-slate-400">{trade.asset}</span>
                        <span className={cn(
                            "font-bold",
                            trade.action === 'BUY' ? "text-emerald-400" : "text-blue-400"
                        )}>{trade.action}</span>
                        <span className="text-slate-200">{trade.amount}</span>
                        <span className="text-slate-600">[{trade.time}]</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
