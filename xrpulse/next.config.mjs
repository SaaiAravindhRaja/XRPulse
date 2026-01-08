/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ndyyfrczuceqxdppunwa.supabase.co',
                pathname: '/storage/v1/object/**',
            },
        ],
    },
};

export default nextConfig;
