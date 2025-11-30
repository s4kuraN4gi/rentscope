'use client'

import { useEffect, useRef } from 'react'

interface AdSenseUnitProps {
    slot: string
    format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle' | 'infeed'
    responsive?: boolean
    className?: string
}

export default function AdSenseUnit({
    slot,
    format = 'auto',
    responsive = true,
    className = ''
}: AdSenseUnitProps) {
    const adRef = useRef<HTMLModElement>(null)
    const isAdLoaded = useRef(false)

    useEffect(() => {
        // 既に広告が読み込まれている場合はスキップ
        if (isAdLoaded.current) return

        try {
            // AdSenseスクリプトがロードされている場合のみ実行
            if (typeof window !== 'undefined' && (window as any).adsbygoogle && adRef.current) {
                // data-adsbygoogle-statusをチェックして、未初期化の場合のみpush
                const insElement = adRef.current
                if (!insElement.getAttribute('data-adsbygoogle-status')) {
                    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
                    isAdLoaded.current = true
                }
            }
        } catch (err) {
            console.error('AdSense error:', err)
        }
    }, [])

    const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

    // 開発環境ではプレースホルダーを表示
    if (!clientId || clientId === 'ca-pub-XXXXXXXXXXXXXXXX') {
        return (
            <div className={`bg-gray-200 dark:bg-gray-700 p-4 rounded-lg text-center ${className}`}>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    広告スペース (AdSense未設定)
                </p>
            </div>
        )
    }

    return (
        <div className={className}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={clientId}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive.toString()}
            />
        </div>
    )
}
