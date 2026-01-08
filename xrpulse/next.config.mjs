/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ndyyfrczuceqxdppunwa.supabase.co',
                pathname: '/storage/v1/object/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'www.sciencephoto.com',
            },
        ],
    },
};

export default nextConfig;
