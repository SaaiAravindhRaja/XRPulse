
"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useWallet } from "@/context/wallet-context"
import { Loader2, CheckCircle2 } from "lucide-react"
import { recordInvestment } from "@/app/actions"
import { toast } from "sonner"

interface Asset {
    id: string
    title: string
    clinic_wallet: string
    share_price_rlusd: number
    token_id: string
}

interface TrustLineModalProps {
    asset: Asset | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TrustLineModal({ asset, open, onOpenChange }: TrustLineModalProps) {
    const { wallet, walletAddress, isConnected } = useWallet()
    const [shares, setShares] = useState(10)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    if (!asset) return null

    const totalCost = shares * (asset.share_price_rlusd || 100)

    const handleInvest = async () => {
        if (!wallet || !walletAddress) return

        setIsLoading(true)
        try {
            const { xrplClient } = await import('@/lib/xrpl')
            const client = xrplClient.client
            if (!client.isConnected()) await client.connect()

            // 1. XRPL: TrustSet (Trust the Clinic for "PLS" tokens)
            // -----------------------------------------------------
            console.log("🔒 Setting TrustLine...")
            const trustSetTx = {
                TransactionType: "TrustSet",
                Account: walletAddress,
                LimitAmount: {
                    currency: "PLS", // Hardcoded for hackathon
                    issuer: asset.clinic_wallet,
                    value: "1000000000" // Max trust
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const preparedTrust = await client.autofill(trustSetTx as any)
            const signedTrust = wallet.sign(preparedTrust)
            await client.submitAndWait(signedTrust.tx_blob)
            toast.success("TrustLine Established on Ledger")

            // 2. XRPL: Payment (Send 'Funds' to Clinic)
            // -----------------------------------------------------
            // For Testnet, we send XRP as a proxy for RLUSD (since we don't have RLUSD issuer handy)
            // 1 RLUSD = 1 DROP for demo, or just 1 XRP.
            // Let's send 1 XRP total to prove movement.
            console.log("💸 Sending Payment...")
            const paymentTx = {
                TransactionType: "Payment",
                Account: walletAddress,
                Destination: asset.clinic_wallet,
                Amount: "1000" // 1000 drops = 0.001 XRP (Tiny amount for functionality test)
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const preparedPay = await client.autofill(paymentTx as any)
            const signedPay = wallet.sign(preparedPay)
            const payResult = await client.submitAndWait(signedPay.tx_blob)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((payResult.result.meta as any).TransactionResult !== "tesSUCCESS") {
                throw new Error("Payment Failed on Ledger")
            }
            toast.success("Payment Confirmed on Ledger")

            // 3. Database: Record Investment
            // -----------------------------------------------------
            await recordInvestment(asset.id, walletAddress, shares, totalCost)

            setIsSuccess(true)
            toast.success("Investment Recorded!")

            // Close after 2s
            setTimeout(() => {
                onOpenChange(false)
                setIsSuccess(false)
                // Trigger refresh if possible?
                window.location.reload() // Brute force refresh for demo
            }, 2000)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Investment Failed", error)
            toast.error("Investment Failed: " + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                {!isSuccess ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Invest in {asset.title}</DialogTitle>
                            <DialogDescription>
                                Purchase fractional ownership (PLS tokens).
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="shares" className="text-right">
                                    Shares
                                </Label>
                                <Input
                                    id="shares"
                                    type="number"
                                    value={shares}
                                    onChange={(e) => setShares(Number(e.target.value))}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Price</Label>
                                <div className="col-span-3 font-mono text-sm">
                                    {asset.share_price_rlusd || 100} RLUSD / share
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center font-bold">
                                <span>Total Cost:</span>
                                <span className="text-emerald-600">{totalCost.toLocaleString()} RLUSD</span>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleInvest} disabled={isLoading || !isConnected} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm Investment"}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Investment Successful!</h3>
                            <p className="text-slate-500">You are now a fractional owner.</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
