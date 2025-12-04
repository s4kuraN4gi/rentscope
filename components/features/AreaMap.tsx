'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

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
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<mapboxgl.Map | null>(null)
    const markersRef = useRef<mapboxgl.Marker[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (!mapContainerRef.current) return
        if (areas.length === 0) {
            setIsLoading(false)
            return
        }

        // マップの初期化
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: {
                version: 8,
                sources: {
                    'raster-tiles': {
                        type: 'raster',
                        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '© OpenStreetMap contributors'
                    }
                },
                layers: [{
                    id: 'simple-tiles',
                    type: 'raster',
                    source: 'raster-tiles',
                    minzoom: 0,
                    maxzoom: 22
                }]
            },
            center: [139.6503, 35.6762],
            zoom: 10
        })

        mapRef.current = map

        map.on('load', () => {
            // マーカーを追加
            const newMarkers: mapboxgl.Marker[] = []
            
            areas.forEach(area => {
                // カスタムマーカー要素を作成
                const el = document.createElement('div')
                el.className = 'custom-marker'
                el.style.cssText = 'background-color: #0ea5e9; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); cursor: pointer;'

                // ポップアップの内容を作成
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

                const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
                    <div style="text-align: center; min-width: 150px;">
                        <strong style="font-size: 14px;">${area.name}</strong><br/>
                        <span style="color: #0284c7; font-weight: bold;">${area.averageRent.toLocaleString()}円</span>
                        ${featuresHtml}
                    </div>
                `)

                const marker = new mapboxgl.Marker(el)
                    .setLngLat([area.longitude, area.latitude])
                    .setPopup(popup)
                    .addTo(map)

                newMarkers.push(marker)
            })

            markersRef.current = newMarkers

            // 全マーカーが見えるように調整
            if (areas.length > 0) {
                const bounds = new mapboxgl.LngLatBounds()
                areas.forEach(area => {
                    bounds.extend([area.longitude, area.latitude])
                })
                map.fitBounds(bounds, { padding: 50 })
            }

            setIsLoading(false)
        })

        // クリーンアップ
        return () => {
            markersRef.current.forEach(marker => marker.remove())
            markersRef.current = []
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
        }
    }, [areas])

    if (areas.length === 0) {
        return (
            <div className="w-full h-[400px] rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <p className="text-gray-500">表示できるエリアがありません</p>
            </div>
        )
    }

    return (
        <div className="relative w-full h-[400px] rounded-lg">
            <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-70 rounded-lg">
                    <p className="text-gray-500">地図を読み込み中...</p>
                </div>
            )}
        </div>
    )
}
