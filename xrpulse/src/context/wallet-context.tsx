
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { xrplClient } from '@/lib/xrpl'
import { Wallet } from 'xrpl'

// Basic User Profile Type
interface UserProfile {
    walletAddress: string
    role: 'clinic' | 'investor' | null
    name?: string
}

interface WalletContextType {
    isConnected: boolean
    walletAddress: string | null
    balance: string
    profile: UserProfile | null
    connectWallet: () => Promise<void>
    disconnectWallet: () => void
    isLoading: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
    const [walletAddress, setWalletAddress] = useState<string | null>(null)
    const [balance, setBalance] = useState<string>('0')
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Auto-connect if stored in localStorage (optional for later)
    useEffect(() => {
        const init = async () => {
            try {
                await xrplClient.connect()
            } catch (e) {
                console.error("Failed to connect to XRPL on init", e)
            }
        }
        init()
    }, [])

    const connectWallet = async () => {
        setIsLoading(true)
        try {
            // TODO: Integrate actual Wallet Connectors (Crossmark / GemWallet)
            // For Phase 1 Mock: Generate a random wallet or use a hardcoded one for dev.
            console.log("Mocking Wallet Connection...")

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800))

            // MOCK WALLET FOR TESTNET
            const mockWallet = Wallet.generate()
            setWalletAddress(mockWallet.address)
            setBalance('1000') // Virtual Balance

            // Check Supabase for existing profile (To be implemented in Slice A)
            setProfile({
                walletAddress: mockWallet.address,
                role: null, // User needs to select
            })

        } catch (error) {
            console.error("Connection failed", error)
        } finally {
            setIsLoading(false)
        }
    }

    const disconnectWallet = () => {
        setWalletAddress(null)
        setProfile(null)
        setBalance('0')
    }

    return (
        <WalletContext.Provider value={{
            isConnected: !!walletAddress,
            walletAddress,
            balance,
            profile,
            connectWallet,
            disconnectWallet,
            isLoading
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
