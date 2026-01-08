
"use client"

import { ConnectWalletButton } from "@/components/auth/connect-wallet-button"
import { RoleSelector } from "@/components/auth/role-selector"
import { useWallet } from "@/context/wallet-context"
import { Activity, Globe2, PieChart } from "lucide-react"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Home() {
  const { isConnected, walletAddress } = useWallet()
  const router = useRouter()

  useEffect(() => {
    // If connected, check if profile exists in DB
    const checkProfile = async () => {
      if (!walletAddress) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle()



      if (data?.role) {
        localStorage.setItem('xrpulse_role', data.role)
        if (data.role === 'clinic') {
          router.push('/clinic/dashboard')
        } else if (data.role === 'investor') {
          router.push('/investor/dashboard')
        }
      }
    }

    if (isConnected) {
      checkProfile()
    }
  }, [isConnected, walletAddress, router])

  const handleRoleSelect = async (role: 'clinic' | 'investor') => {
    if (!walletAddress) return

    // Create Profile in Supabase
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

    // Redirect
    if (role === 'clinic') router.push('/clinic/dashboard')
    else router.push('/investor/dashboard')
  }

  return (
    <main className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">
            <Activity className="text-emerald-400 w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">XRPulse</span>
        </div>
        <ConnectWalletButton />
      </header>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000 slide-in-from-bottom-5">

        {!isConnected ? (
          <div className="max-w-3xl space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-sm font-medium mb-4">
                The Future of Medical Financing
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
                The Heartbeat of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Medical Finance</span>.
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                A decentralized marketplace for fractionalizing high-value medical infrastructure on the XRPL. Invest in real-world assets with real-world impact.
              </p>
            </div>
            <div className="pt-8 flex justify-center gap-4">
              <ConnectWalletButton />
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-6 mt-16 text-left">
              <div className="glass-panel p-6 rounded-2xl border-slate-800/50 hover:border-emerald-500/30 transition-colors group">
                <div className="p-3 bg-emerald-500/10 w-fit rounded-lg mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Transparency</h3>
                <p className="text-slate-400 text-sm">
                  Real-time tracking of funds and asset performance on the XRPL ledger.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border-slate-800/50 hover:border-blue-500/30 transition-colors group">
                <div className="p-3 bg-blue-500/10 w-fit rounded-lg mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Globe2 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Global Access</h3>
                <p className="text-slate-400 text-sm">
                  Seamless cross-border investment opportunities without traditional barriers.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border-slate-800/50 hover:border-purple-500/30 transition-colors group">
                <div className="p-3 bg-purple-500/10 w-fit rounded-lg mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <PieChart className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Fractional Investing</h3>
                <p className="text-slate-400 text-sm">
                  Invest in high-value medical equipment with accessible entry points.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white tracking-tight">Welcome to XRPulse</h2>
              <p className="text-slate-400 text-lg">Select your role to continue onboarding into the ecosystem.</p>
            </div>

            <RoleSelector onSelect={handleRoleSelect} />
          </div>
        )}

      </div>
    </main>
  );
}
