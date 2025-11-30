'use client'

import { useEffect, useRef, useState } from 'react'

interface Area {
    name: string
    averageRent: number
    latitude: number
    longitude: number
    matchedFeatures?: string[]
}

interface AreaMapProps {
    areas: Area[]
}

export default function AreaMap({ areas }: AreaMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // クライアントサイドでのみLeafletをロード
        if (typeof window === 'undefined') return

        let isMounted = true

        async function initMap() {
            try {
                // 動的にLeafletをインポート
                const L = (await import('leaflet')).default

                if (!isMounted || !mapRef.current) return

                if (areas.length === 0) {
                    setIsLoading(false)
                    return
                }

                // 既存のマップがあれば削除
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.remove()
                }

                // マップの初期化
                const map = L.map(mapRef.current).setView([35.6762, 139.6503], 10)
                mapInstanceRef.current = map

                // タイルレイヤーの追加
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                }).addTo(map)

                // カスタムアイコン
                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: '<div style="background-color: #0ea5e9; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                })

                // マーカーの追加
                areas.forEach(area => {
                    const featuresHtml = area.matchedFeatures && area.matchedFeatures.length > 0
                        ? `<div style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;">
                            ${area.matchedFeatures.map(f => {
                                const labels: Record<string, string> = {
                                    pet_friendly: '🐶',
                                    safe_area: '🛡️',
                                    child_rearing: '👶',
                                    access_good: '🚃',
                                    cost_performance: '💰',
                                    shopping_convenient: '🛍️',
                                }
                                return `<span style="background-color: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 9999px; font-size: 10px;">${labels[f] || ''}</span>`
                            }).join('')}
                           </div>`
                        : ''

                    L.marker([area.latitude, area.longitude], { icon })
                        .addTo(map)
                        .bindPopup(`
              <div style="text-align: center; min-width: 150px;">
                <strong style="font-size: 14px;">${area.name}</strong><br/>
                <span style="color: #0284c7; font-weight: bold;">${area.averageRent.toLocaleString()}円</span>
                ${featuresHtml}
              </div>
            `)
                })

                // 全マーカーが見えるように調整
                if (areas.length > 0) {
                    const bounds = L.latLngBounds(areas.map(a => [a.latitude, a.longitude]))
                    map.fitBounds(bounds, { padding: [50, 50] })
                }

                setIsLoading(false)
            } catch (error) {
                console.error('Error loading map:', error)
                setIsLoading(false)
            }
        }

        initMap()

        return () => {
            isMounted = false
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [areas])

    if (isLoading) {
        return (
            <div className="w-full h-[400px] rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <p className="text-gray-500">地図を読み込み中...</p>
            </div>
        )
    }

    if (areas.length === 0) {
        return (
            <div className="w-full h-[400px] rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <p className="text-gray-500">表示できるエリアがありません</p>
            </div>
        )
    }

    return <div ref={mapRef} className="w-full h-[400px] rounded-lg" />
}
