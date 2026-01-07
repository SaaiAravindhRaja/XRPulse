
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as xrpl from 'xrpl';

// Load env vars
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Use Service Role in prod for safety, anon for hackathon demo
const XRPL_RPC = process.env.NEXT_PUBLIC_XRPL_RPC_URL || 'wss://s.altnet.rippletest.net:51233';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing Supabase Credentials");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function distributeYield() {
    console.log("\n🏥 XRPulse Yield Distribution Engine");
    console.log("=====================================");
    console.log(`Connecting to Ledger: ${XRPL_RPC}...`);

    const client = new xrpl.Client(XRPL_RPC);
    await client.connect();
    console.log("✅ Connected to XRPL Testnet");

    // 1. Fetch Assets eligible for yield (e.g., 'funded' or just all for demo)
    console.log("\n🔍 Scanning for Active Assets...");
    // For demo, we just grab all assets
    const { data: assets, error: assetError } = await supabase
        .from('assets')
        .select('*')

    if (assetError) {
        console.error("Failed to fetch assets", assetError);
        return;
    }

    console.log(`Found ${assets?.length} assets. Checking for funding...`);

    // 2. Process each asset
    for (const asset of assets || []) {
        // 3. Fetch Investors first to calculate funding
        const { data: investments, error: invError } = await supabase
            .from('investments')
            .select('*')
            .eq('asset_id', asset.id);

        if (invError) {
            console.error("Failed to fetch investors for asset", invError);
            continue;
        }

        // Calculate Real Funding
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentFunding = investments?.reduce((acc, curr: any) => acc + curr.amount_invested, 0) || 0

        if (currentFunding === 0) continue; // Skip unfunded assets

        console.log(`\n------------------------------------------------`);
        console.log(`PROCESSING: ${asset.title} (ID: ${asset.id.slice(0, 8)}...)`);
        console.log(`📈 Funding Pool: $${currentFunding} RLUSD`);

        // Mock Yield Rate (e.g. 5% monthly)
        const YIELD_RATE = 0.05;
        const totalPayout = currentFunding * YIELD_RATE;
        console.log(`💰 Monthly Yield Pool: $${totalPayout.toFixed(2)} RLUSD`);

        console.log(`👥 Distributing to ${investments.length} Investors...`);

        // 4. Batch Payments (Simulated for Demo)
        for (const investment of investments) {
            const investorShare = (investment.amount_invested / currentFunding) * totalPayout;
            console.log(`   ➜ Paying ${investorShare.toFixed(2)} RLUSD to ${investment.investor_wallet.slice(0, 10)}...`);

            // In a real scenario, here we would construct and sign an XRPL Payment transaction
            // const payment = {
            //   TransactionType: 'Payment',
            //   Destination: investment.investor_wallet,
            //   Amount: xrpl.xrpToDrops(investorShare), // Using XRP/Drops or TrustLine IOUs
            //   Currency: 'RLUSD' 
            // }
            // await client.submitAndWait(payment)

            await new Promise(r => setTimeout(r, 200)); // Simulate network latency
        }
        console.log(`✅ Distribution Complete for ${asset.title}`);
    }

    console.log("\n=====================================");
    console.log("🎉 All Yields Distributed Successfully");

    await client.disconnect();
}

distributeYield()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
