
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ArrowUp, DollarSign, Users, Zap } from "lucide-react"
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area } from "recharts"
import { supabase } from "@/lib/supabase"

// Simulated Heartbeat Data
const generateHeartbeat = () => {
    const data = []
    let base = 50
    for (let i = 0; i < 50; i++) {
        const random = Math.random()
        if (random > 0.9) base += 20 // Spike
        else if (random < 0.1) base -= 20 // Dip
        else base += (Math.random() - 0.5) * 5 // Noise

        // Return to baseline
        base = base * 0.9 + 50 * 0.1

        data.push({
            time: i,
            value: base,
            pulse: base + (Math.random() * 10)
        })
    }
    return data
}

// Simulated Transactions
const TransactionTicker = () => {
    const [txs, setTxs] = useState<any[]>([])

    useEffect(() => {
        const interval = setInterval(() => {
            const newTx = {
                id: Math.random().toString(36).substring(7),
                type: Math.random() > 0.7 ? "INVESTMENT" : (Math.random() > 0.5 ? "YIELD_PAYOUT" : "CHECK_CASHED"),
                amount: (Math.random() * 1000).toFixed(2),
                time: new Date().toLocaleTimeString()
            }
            setTxs(prev => [newTx, ...prev].slice(0, 8))
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="space-y-4">
            {txs.map((tx, i) => (
                <div key={tx.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${tx.type === 'INVESTMENT' ? 'bg-emerald-500/20 text-emerald-400' :
                                tx.type === 'YIELD_PAYOUT' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-amber-500/20 text-amber-400'
                            }`}>
                            {tx.type === 'INVESTMENT' ? <ArrowUp size={16} /> :
                                tx.type === 'YIELD_PAYOUT' ? <DollarSign size={16} /> :
                                    <Activity size={16} />}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-200">{tx.type}</p>
                            <p className="text-xs text-slate-500">{tx.time}</p>
                        </div>
                    </div>
                    <span className="font-mono text-emerald-400">+{tx.amount} RLUSD</span>
                </div>
            ))}
        </div>
    )
}

export default function PulsePage() {
    const [chartData, setChartData] = useState(generateHeartbeat())
    const [stats, setStats] = useState({
        tvl: 0,
        investors: 0,
        assets: 0
    })

    // Real-time Chart Update
    useEffect(() => {
        const interval = setInterval(() => {
            setChartData(prev => {
                const newData = [...prev.slice(1)]
                const lastVal = prev[prev.length - 1].value
                let nextVal = lastVal * 0.9 + 50 * 0.1 + (Math.random() - 0.5) * 20
                if (Math.random() > 0.95) nextVal += 40 // Heartbeat spike

                newData.push({
                    time: prev[prev.length - 1].time + 1,
                    value: nextVal,
                    pulse: nextVal
                })
                return newData
            })
        }, 200) // Fast update for heartbeat effect
        return () => clearInterval(interval)
    }, [])

    // Real Stats Fetch
    useEffect(() => {
        const fetchStats = async () => {
            const { count: investorCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'investor')
            const { count: assetCount } = await supabase.from('assets').select('*', { count: 'exact', head: true })
            const { data: investments } = await supabase.from('investments').select('amount_invested')

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const totalInvested = investments?.reduce((acc, curr: any) => acc + curr.amount_invested, 0) || 0

            setStats({
                tvl: totalInvested,
                investors: investorCount || 0,
                assets: assetCount || 0
            })
        }
        fetchStats()
        // Refresh stats occasionally
        const statInterval = setInterval(fetchStats, 10000)
        return () => clearInterval(statInterval)
    }, [])

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tighter">
                        THE PULSE
                    </h1>
                    <p className="text-slate-400 mt-2 text-xl font-light">
                        Live Ecosystem Metrics & On-Chain Activity
                    </p>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                    LIVE
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Value Locked</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">${stats.tvl.toLocaleString()}</div>
                        <p className="text-xs text-slate-500 font-mono">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Active Investors</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.investors}</div>
                        <p className="text-xs text-slate-500 font-mono">Growing ecosystem</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Tokenized Assets</CardTitle>
                        <Zap className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.assets}</div>
                        <p className="text-xs text-slate-500 font-mono">Clinics & Equipment</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Yield APY (Avg)</CardTitle>
                        <Activity className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">14.2%</div>
                        <p className="text-xs text-slate-500 font-mono">Cross-portfolio avg</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-2">
                    <Card className="bg-slate-900 border-slate-800 h-[500px]">
                        <CardHeader>
                            <CardTitle className="text-slate-200">Network Activity (RLUSD Volume)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[420px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" hide />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltiple contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#34d399"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Ledger Feed */}
                <div className="lg:col-span-1">
                    <Card className="bg-slate-900 border-slate-800 h-[500px] flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-slate-200">Live Ledger Stream</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden">
                            <TransactionTicker />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
