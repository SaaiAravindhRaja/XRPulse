
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase Creds")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    console.log(`Testing connection to: ${supabaseUrl}`)

    // 1. Check CONNECTION
    const { data: healthData, error: healthError } = await supabase.from('assets').select('count', { count: 'exact', head: true })

    if (healthError) {
        console.error("❌ Connection Failed:", healthError.message)
        return
    }
    console.log("✅ Connection Successful!")

    // 2. Fetch ASSETS
    const { data: assets, error: fetchError } = await supabase.from('assets').select('*')

    if (fetchError) {
        console.error("❌ Fetch Failed:", fetchError.message)
    } else {
        console.log(`\n✅ Found ${assets?.length || 0} Assets in Database:`)
        assets?.forEach(a => {
            console.log(` - [${a.status}] ${a.title} (ID: ${a.id?.slice(0, 8)}...)`)
        })
    }
}

testConnection()
