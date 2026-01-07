
"use client"

import { ConnectWalletButton } from "@/components/auth/connect-wallet-button"
import { RoleSelector } from "@/components/auth/role-selector"
import { useWallet } from "@/context/wallet-context"
import { Activity } from "lucide-react"
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
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center border-b bg-white">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 p-2 rounded-lg">
            <Activity className="text-emerald-400 w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">XRPulse</span>
        </div>
        <ConnectWalletButton />
      </header>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">

        {!isConnected ? (
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              The Heartbeat of <span className="text-emerald-600">Medical Finance</span>.
            </h1>
            <p className="text-xl text-slate-600">
              A decentralized marketplace for fractionalizing high-value medical infrastructure on the XRPL.
            </p>
            <div className="pt-4">
              <ConnectWalletButton />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Welcome to XRPulse</h2>
              <p className="text-slate-500">Select your role to continue onboarding.</p>
            </div>

            <RoleSelector onSelect={handleRoleSelect} />
          </div>
        )}

      </div>
    </main>
  );
}
