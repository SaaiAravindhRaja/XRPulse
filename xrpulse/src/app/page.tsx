
"use client"

import { ConnectWalletButton } from "@/components/auth/connect-wallet-button"
import { RoleSelector } from "@/components/auth/role-selector"
import { useWallet } from "@/context/wallet-context"
import { Activity, ShieldCheck, Zap, ArrowRight, LayoutDashboard, Github } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { MarketTicker } from "@/components/home/market-ticker"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  const { isConnected, walletAddress } = useWallet()
  const router = useRouter()
  const [existingRole, setExistingRole] = useState<'clinic' | 'investor' | null>(null)

  useEffect(() => {
    const checkProfile = async () => {
      if (!walletAddress) return
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle()

      if (data?.role) {
        localStorage.setItem('xrpulse_role', data.role)
        setExistingRole(data.role)
      }
    }

    if (isConnected) checkProfile()
  }, [isConnected, walletAddress, router])

  const handleRoleSelect = async (role: 'clinic' | 'investor') => {
    if (!walletAddress) return
    const { error } = await supabase.from('profiles').upsert({
      wallet_address: walletAddress,
      role: role,
      name: role === 'clinic' ? 'New Clinic' : 'New Investor',
      created_at: new Date().toISOString()
    })

    if (error) {
      console.error("Failed to create profile", error)
      return
    }

    localStorage.setItem('xrpulse_role', role)
    if (role === 'clinic') router.push('/clinic/dashboard')
    else router.push('/investor/dashboard')
  }

  return (
    <main className="min-h-screen flex flex-col relative bg-slate-950 text-slate-50">

      {/* Ticker */}
      <MarketTicker />

      {/* Header */}
      <header className="px-8 py-4 flex justify-between items-center border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Activity className="text-emerald-500 w-6 h-6" />
          <span className="text-lg font-bold tracking-tight text-white">XRPulse</span>
        </Link>
        <ConnectWalletButton />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center animate-in fade-in duration-700">

        {!isConnected ? (
          <div className="max-w-4xl w-full space-y-12">

            {/* Hero Text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-mono uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live on XRPL Testnet
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight text-balance">
                Tokenized Medical Infrastructure.
              </h1>

              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                The first decentralized marketplace for fractional ownership of high-value healthcare assets.
                <span className="text-slate-300 font-medium"> Instant settlement. Auditable ROI.</span>
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <ConnectWalletButton />
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-11 px-8 gap-2"
                asChild
              >
                <Link href="https://github.com/SaaiAravindhRaja/XRPulse" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4" />
                  View GitHub
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid md:grid-cols-3 gap-8 pt-12 border-t border-slate-800/50 mt-12">
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-slate-600" />
                <h3 className="font-bold text-slate-300">Audited Security</h3>
                <p className="text-sm text-slate-500">Assets verified on-chain via XRPL URITokens.</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Zap className="w-8 h-8 text-slate-600" />
                <h3 className="font-bold text-slate-300">Instant Liquidity</h3>
                <p className="text-sm text-slate-500">Trade fractional shares 24/7 with RLUSD.</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Activity className="w-8 h-8 text-slate-600" />
                <h3 className="font-bold text-slate-300">Real Yield</h3>
                <p className="text-sm text-slate-500">Earn from actual medical equipment usage.</p>
              </div>
            </div>

          </div>
        ) : (
          <div className="w-full max-w-3xl space-y-8 glass-panel p-10 rounded-2xl border-slate-800">
            {existingRole ? (
              <div className="text-center space-y-6 animate-in slide-in-from-bottom-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <LayoutDashboard className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                  <p className="text-slate-400">
                    You are signed in as a <span className="text-emerald-400 capitalize">{existingRole}</span>.
                  </p>
                </div>

                <Button
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                  onClick={() => router.push(`/${existingRole}/dashboard`)}
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Button>

                <p className="text-xs text-slate-500 pt-4">
                  Want to switch roles? Disconnect your wallet first.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Identity Verified</h2>
                  <p className="text-slate-400">Select your ecosystem role.</p>
                </div>
                <RoleSelector onSelect={handleRoleSelect} />
              </>
            )}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        © 2026 XRPulse Decentralized Protocol. Built for NUS FinTech Summit.
      </footer>
    </main>
  );
}
