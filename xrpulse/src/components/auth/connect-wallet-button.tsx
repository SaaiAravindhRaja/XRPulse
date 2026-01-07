
"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/context/wallet-context"
import { Loader2, Wallet } from "lucide-react"

export function ConnectWalletButton() {
    const { isConnected, connectWallet, walletAddress, isLoading, disconnectWallet } = useWallet()

    if (isConnected && walletAddress) {
        return (
            <Button
                variant="outline"
                onClick={disconnectWallet}
                className="font-mono text-xs border-emerald-500/20 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10"
            >
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </Button>
        )
    }

    return (
        <Button
            onClick={connectWallet}
            disabled={isLoading}
            className="bg-slate-900 text-white hover:bg-slate-800"
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
                <Wallet className="w-4 h-4 mr-2" />
            )}
            Connect Wallet
        </Button>
    )
}
