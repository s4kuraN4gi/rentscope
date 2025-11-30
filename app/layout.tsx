import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'RentScope - 給料から見る最適な家賃とエリア分析',
    description: 'あなたの給料で住める家賃帯とおすすめエリアをAIが分析。理想のエリアに住むために必要な収入もわかります。',
    keywords: '家賃, 給料, 賃貸, エリア, AI分析, 一人暮らし, 引っ越し',
    openGraph: {
        title: 'RentScope - 給料から見る最適な家賃とエリア分析',
        description: 'あなたの給料で住める家賃帯とおすすめエリアをAIが分析',
        url: process.env.NEXT_PUBLIC_SITE_URL,
        siteName: 'RentScope',
        locale: 'ja_JP',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'RentScope - 給料から見る最適な家賃とエリア分析',
        description: 'あなたの給料で住める家賃帯とおすすめエリアをAIが分析',
    },
    verification: {
        google: 'IiMEbrAr481zIC_-nZSfkoKUJXkFUn7SZQfaP3lkhTQ',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

    return (
        <html lang="ja" suppressHydrationWarning>
            <head>
                {/* Leaflet CSS */}
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                    crossOrigin=""
                />

                {/* Google Analytics */}
                {gaId && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                            strategy="afterInteractive"
                        />
                        <Script id="google-analytics" strategy="afterInteractive">
                            {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
                        </Script>
                    </>
                )}

                {/* Google AdSense */}
                {adsenseId && (
                    <Script
                        async
                        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
                        crossOrigin="anonymous"
                        strategy="afterInteractive"
                    />
                )}
            </head>
            <body className={inter.className} suppressHydrationWarning>
                <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
                </div>
            </body>
        </html>
    )
}
