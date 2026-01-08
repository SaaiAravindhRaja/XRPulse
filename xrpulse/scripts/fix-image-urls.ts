import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
    console.error("❌ Error: Please configure .env.local with valid Supabase credentials first.")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixImageUrls() {
    console.log("🔧 Fixing invalid image URLs in database...")

    // Get all assets with invalid image URLs
    const { data: assets, error: fetchError } = await supabase
        .from('assets')
        .select('*')

    if (fetchError) {
        console.error("Error fetching assets:", fetchError)
        return
    }

    console.log(`Found ${assets?.length || 0} assets in database`)

    // Update any assets with sciencephoto.com URLs
    for (const asset of assets || []) {
        if (asset.image_url?.includes('sciencephoto.com')) {
            console.log(`⚠️  Found invalid URL in asset: ${asset.title}`)

            // Replace with a valid medical equipment image from Unsplash
            const newImageUrl = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2070&auto=format&fit=crop'

            const { error: updateError } = await supabase
                .from('assets')
                .update({ image_url: newImageUrl })
                .eq('id', asset.id)

            if (updateError) {
                console.error(`Error updating asset ${asset.id}:`, updateError)
            } else {
                console.log(`✅ Updated image URL for: ${asset.title}`)
            }
        }
    }

    console.log("✨ Image URL fix complete!")
}

fixImageUrls()
