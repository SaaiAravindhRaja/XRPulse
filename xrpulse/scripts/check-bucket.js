
const { createClient } = require('@supabase/supabase-js');

// Load env vars - simplistic way for this script
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '../.env.local');

let url = '';
let key = '';

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
            url = line.split('=')[1].replace(/"/g, '').trim();
        }
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
            key = line.split('=')[1].replace(/"/g, '').trim();
        }
    });
}

if (!url || !key) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(url, key);

async function checkBucket() {
    console.log("Checking buckets...");
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error("Error listing buckets:", error);
    } else {
        console.log("Buckets:", data.map(b => b.name));
        const assetsBucket = data.find(b => b.name === 'assets');
        if (!assetsBucket) {
            console.log("Assets bucket missing. Attempting to create (this might fail if RLS blocks it)...");
            const { data: created, error: createError } = await supabase.storage.createBucket('assets', {
                public: true,
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
                fileSizeLimit: 5242880 // 5MB
            });
            if (createError) console.error("Create failed:", createError);
            else console.log("Created 'assets' bucket:", created);
        } else {
            console.log("'assets' bucket exists.");
        }
    }
}

checkBucket();
