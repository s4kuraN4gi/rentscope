import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'RentScope - 給料から住めるエリアを分析',
        short_name: 'RentScope',
        description: '給料を入力するだけで、あなたが住めるエリアをAIが分析。家賃相場、おすすめエリア、収入ギャップを可視化します。',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3b82f6',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
