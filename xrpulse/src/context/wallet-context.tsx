
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { xrplClient } from '@/lib/xrpl'
import { Wallet } from 'xrpl'
import { useToast } from "@/hooks/use-toast"

// Basic User Profile Type
interface UserProfile {
    walletAddress: string
    role: 'clinic' | 'investor' | null
    name?: string
}

interface WalletContextType {
    isConnected: boolean
    walletAddress: string | null
    wallet: Wallet | null
    balance: string
    profile: UserProfile | null
    connectWallet: () => Promise<void>
    disconnectWallet: () => void
    isLoading: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signTransaction: (tx: any) => Promise<any>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [balance, setBalance] = useState<string>('0')
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    // Auto-connect if stored in localStorage
    useEffect(() => {
        const init = async () => {
            try {
                await xrplClient.connect()

                const savedSeed = localStorage.getItem('xrpulse_seed')
                if (savedSeed) {
                    const savedWallet = Wallet.fromSeed(savedSeed)
                    setWallet(savedWallet)
                    setProfile({
                        walletAddress: savedWallet.address,
                        role: (localStorage.getItem('xrpulse_role') as UserProfile['role']) || null
                    })
                    // Fetch balance with error handling
                    try {
                        const balance = await xrplClient.client.getXrpBalance(savedWallet.address)
                        setBalance(balance.toString())
                    } catch (err: any) {
                        console.warn("Could not fetch balance for saved wallet (might be unfunded):", err.message)
                        if (err.message && err.message.includes("Account not found")) {
                            setBalance('0')
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to connect to XRPL on init", e)
            }
        }
        init()
    }, [])

    const connectWallet = async () => {
        setIsLoading(true)
        try {
            console.log("Generating Mock Wallet for Testnet...")

            // 1. Generate Wallet
            // In a real app, this would come from GemWallet/Crossmark
            const newWallet = Wallet.generate()
            setWallet(newWallet)

            // Persist
            if (typeof window !== 'undefined') {
                localStorage.setItem('xrpulse_seed', newWallet.seed || '')
                // Default role to null until selected, but we can update it later.
            }

            // 2. Fund it (so we can do transactions)
            toast({
                title: "Funding Wallet...",
                description: "Requesting Testnet XRP for gas fees.",
            })

            try {
                // Ensure we are connected before asking faucet
                await xrplClient.client.connect()

                // We use the client to fund. Note: This might take a few seconds.
                console.log("Requesting funding from XRPL Faucet...")
                const fundResult = await xrplClient.client.fundWallet(newWallet)

                console.log("Funded:", fundResult)
                setBalance(fundResult.balance.toString())
            } catch (err) {
                console.warn("Funding failed or timed out, proceeding with mock balance", err)
                setBalance('1000')
            }

            // 3. Set Profile
            setProfile({
                walletAddress: newWallet.address,
                role: null,
            })

            toast({
                title: "Wallet Connected",
                description: `Address: ${newWallet.address.slice(0, 6)}...`,
            })

        } catch (error) {
            console.error("Connection failed", error)
            toast({
                title: "Connection Failed",
                description: "Could not generate wallet.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signTransaction = async (tx: any) => {
        if (!wallet) throw new Error("No wallet connected")

        // Local Signing (since we hold the keys in memory for this demo)
        return wallet.sign(tx)
    }

    const disconnectWallet = () => {
        setWallet(null)
        setProfile(null)
        setBalance('0')
        localStorage.removeItem('xrpulse_seed')
        localStorage.removeItem('xrpulse_role')
    }

    return (
        <WalletContext.Provider value={{
            isConnected: !!wallet,
            walletAddress: wallet?.address || null,
            wallet,
            balance,
            profile,
            connectWallet,
            disconnectWallet,
            isLoading,
            signTransaction
        }}>
            {children}
        </WalletContext.Provider>
    )
}

export const useWallet = () => {
    const context = useContext(WalletContext)
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider')
    }
    return context
}
