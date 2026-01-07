
import { Client, Wallet, AccountSet, AccountSetAsfFlags } from 'xrpl'

async function main() {
    console.log("Connecting to XRPL Testnet...")
    const client = new Client("wss://s.altnet.rippletest.net:51233")
    await client.connect()

    try {
        console.log("Funding Issuer Wallet (The 'Bank')...")
        const { wallet, balance } = await client.fundWallet()

        console.log(`\n--- ISSUER WALLET CREATED ---`)
        console.log(`Address: ${wallet.address}`)
        console.log(`Seed:    ${wallet.seed}`)
        console.log(`Balance: ${balance} XRP`)
        console.log(`------------------------------\n`)

        console.log("Configuring 'DefaultRipple' flag (Required for Issuers)...")

        const settingsTx: AccountSet = {
            TransactionType: "AccountSet",
            Account: wallet.address,
            SetFlag: AccountSetAsfFlags.asfDefaultRipple
        }

        const prepared = await client.autofill(settingsTx)
        const signed = wallet.sign(prepared)
        const result = await client.submitAndWait(signed.tx_blob)

        if (result.result.meta && typeof result.result.meta !== 'string' && result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log("✅ Success! Wallet is now configured as an Issuer.")
            console.log(`\n[Action Required] Add this to your .env.local:`)
            console.log(`NEXT_PUBLIC_RLUSD_ISSUER=${wallet.address}`)
            console.log(`RLUSD_ISSUER_SECRET=${wallet.seed}`)
        } else {
            console.error("❌ Failed to set DefaultRipple flag:", result)
        }

    } catch (error) {
        console.error("Error setting up issuer:", error)
    } finally {
        await client.disconnect()
    }
}

main()
