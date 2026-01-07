"use server"

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createAssetInDb(assetData: any) {
    console.log("⚡️ Server Action: Creating Asset...", assetData.title)

    // 1. Ensure Profile Exists (FK Constraint)
    const { error: profileError } = await supabase.from('profiles').upsert({
        wallet_address: assetData.clinic_wallet,
        role: 'clinic',
        name: 'Clinic ' + assetData.clinic_wallet.slice(0, 4)
    }, { onConflict: 'wallet_address' })

    if (profileError) {
        console.error("❌ Profile Sync Failed:", profileError)
        // Proceeding anyway might fail, but let's try or throw
        throw new Error("Could not sync profile: " + profileError.message)
    }

    // 2. Insert Asset //
    const { data, error } = await supabase.from('assets').insert({
        clinic_wallet: assetData.clinic_wallet,
        title: assetData.title,
        description: assetData.description,
        funding_goal_rlusd: assetData.funding_goal_rlusd,
        share_price_rlusd: assetData.share_price_rlusd,
        total_shares: assetData.total_shares,
        image_url: assetData.image_url,
        status: assetData.status,
        token_id: assetData.token_id,
        escrow_sequence: assetData.escrow_sequence
    }).select()

    if (error) {
        console.error("❌ Server DB Error:", error)
        throw new Error(error.message)
    }

    return { success: true, data }
}

export async function recordInvestment(
    assetId: string,
    investorWallet: string,
    shares: number,
    amountPaid: number
) {
    console.log(`💰 Recording Investment: ${shares} shares for ${amountPaid} RLUSD`)

    // 1. Insert Investment Record
    const { error: investError } = await supabase.from('investments').insert({
        asset_id: assetId,
        investor_wallet: investorWallet,
        amount_invested: amountPaid,
        tokens_received: shares
    })

    if (investError) throw new Error("Investment Record Failed: " + investError.message)

    // 2. Update Asset Funding Progress
    // We need to fetch current funding first to be safe, or use RPC call if Supabase supported increment (it does via rpc, but let's keep it simple with fetch-update for now)

    const { data: asset } = await supabase.from('assets').select('current_funding_rlusd').eq('id', assetId).single()
    const newFunding = (asset?.current_funding_rlusd || 0) + amountPaid

    // Update 'status' to 'funded' if goal reached? (Logic for later)

    const { error: updateError } = await supabase
        .from('assets')
        .update({ current_funding_rlusd: newFunding })
        .eq('id', assetId)

    if (updateError) throw new Error("Asset Update Failed: " + updateError.message)

    return { success: true }
}
