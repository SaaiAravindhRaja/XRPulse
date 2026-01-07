
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { Wallet } from 'xrpl'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
    console.error("❌ Error: Please configure .env.local with valid Supabase credentials first.")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const equipmentData = [
    {
        key: 'xray',
        title: 'Digital X-Ray Machine',
        cost: 85000,
        location: 'Rural Clinic, Kenya',
        patientsPerYear: 3500,
        usageFee: 15,
        annualRevenue: 52500,
        roi: 8.2,
        paybackYears: 5,
        description: 'High - Emergency diagnostics, fractures, pneumonia detection. Critical infrastructure for rural orthopedic care.',
        imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop'
    },
    {
        key: 'ct',
        title: 'Orbit CT Scanner',
        cost: 450000,
        location: 'District Hospital, Philippines',
        patientsPerYear: 2800,
        usageFee: 120,
        annualRevenue: 336000,
        roi: 9.5,
        paybackYears: 6,
        description: 'Critical - Cancer detection, stroke diagnosis, trauma assessment. The only scanner within a 200km radius.',
        imageUrl: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=2070&auto=format&fit=crop'
    },
    {
        key: 'mobile',
        title: 'Mobile X-Ray Unit',
        cost: 125000,
        location: 'Multi-village route, Uganda',
        patientsPerYear: 4200,
        usageFee: 12,
        annualRevenue: 50400,
        roi: 7.8,
        paybackYears: 5.5,
        description: 'Very High - Reaches 15 remote villages, TB screening. Bringing diagnostics to the patient.',
        imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=2070&auto=format&fit=crop'
    }
]

async function seed() {
    console.log("🌱 Seeding Mock Data to Supabase...")

    // 1. Generate a Mock Clinic Wallet (if we don't have one)
    const clinicWallet = Wallet.generate()
    console.log(`🏥 Created Mock Clinic Wallet: ${clinicWallet.address}`)

    // 2. Insert Clinic Profile
    const { error: profileError } = await supabase.from('profiles').upsert({
        wallet_address: clinicWallet.address,
        role: 'clinic',
        name: 'Global Health Diagnostics',
        location: 'Singapore',
        license_number: 'SNG-2026-MED-88',
        bio: 'Providing advanced diagnostic capabilities to under-served regions in SE Asia and Africa.',
    })

    if (profileError) {
        console.error("Error creating profile:", profileError)
        return
    }

    // 3. Insert Assets
    for (const eq of equipmentData) {
        const sharePrice = 100 // Fixed for simplicity
        const totalShares = Math.floor(eq.cost / sharePrice)

        // Currency Code: PULSE-MRI-001 (Mocked logic)
        const currencyCode = `PULSE-${eq.key.toUpperCase()}-01`

        const { error: assetError } = await supabase.from('assets').insert({
            clinic_wallet: clinicWallet.address,
            title: eq.title,
            description: `${eq.description} (ROI: ${eq.roi}%)`,
            image_url: eq.imageUrl,
            funding_goal_rlusd: eq.cost,
            total_shares: totalShares,
            share_price_rlusd: sharePrice,
            currency_code: currencyCode,
            status: 'funding'
        })

        if (assetError) {
            console.error(`Error inserting ${eq.title}:`, assetError)
        } else {
            console.log(`✅ Asset Listed: ${eq.title} (${currencyCode})`)
        }
    }

    console.log("✨ Seeding Complete!")
}

seed()
