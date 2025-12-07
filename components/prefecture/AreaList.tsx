'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Area } from '@/types/prefecture'

const FEATURE_LABELS: Record<string, string> = {
    pet_friendly: '🐶 ペット可',
    safe_area: '🛡️ 治安重視',
    child_rearing: '👶 子育て環境',
    access_good: '🚃 アクセス重視',
    cost_performance: '💰 コスパ重視',
    shopping_convenient: '🛍️ 買い物便利',
}

export default function AreaList({ areas }: { areas: Area[] }) {
    const [selectedRoomType, setSelectedRoomType] = useState<string>('default')
    const [sortOrder, setSortOrder] = useState<string>('default')
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
    const [isFilterOpen, setIsFilterOpen] = useState(false) // モバイル用開閉状態

    // フィルタリングとソートのロジック
    const filteredAndSortedAreas = areas
        .filter(area => {
            // 特徴フィルター
            if (selectedFeatures.length === 0) return true
            return selectedFeatures.every(feature => area.features?.includes(feature))
        })
        .sort((a, b) => {
            // ソート
            if (sortOrder === 'default') return 0

            const getPrice = (area: Area) => {
                switch (selectedRoomType) {
                    case 'oneRoom': return area.rentByRoomType.oneRoom
                    case 'oneLDK': return area.rentByRoomType.oneLDK
                    case 'twoLDK': return area.rentByRoomType.twoLDK
                    case 'threeLDK': return area.rentByRoomType.threeLDK
                    default: return area.averageRent
                }
            }

            const priceA = getPrice(a)
            const priceB = getPrice(b)

            // データなし(null)は常に最後に回す
            if (priceA === null && priceB === null) return 0
            if (priceA === null) return 1
            if (priceB === null) return -1

            if (sortOrder === 'price_asc') return priceA - priceB
            if (sortOrder === 'price_desc') return priceB - priceA
            return 0
        })

    const toggleFeature = (key: string) => {
        setSelectedFeatures(prev => 
            prev.includes(key) 
                ? prev.filter(k => k !== key)
                : [...prev, key]
        )
    }

    if (!areas || areas.length === 0) {
        return <p className="col-span-3 text-center text-gray-500">エリアデータがありません</p>
    }

    return (
        <div className="space-y-6">
            {/* コントロールパネル */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col space-y-4">
                    
                    {/* 上段: ソートとモバイル用フィルターボタン */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
                            <select 
                                value={selectedRoomType}
                                onChange={(e) => setSelectedRoomType(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="default">家賃相場 (全体)</option>
                                <option value="oneRoom">ワンルーム</option>
                                <option value="oneLDK">1LDK</option>
                                <option value="twoLDK">2LDK</option>
                                <option value="threeLDK">3LDK</option>
                            </select>

                            <select 
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="default">おすすめ順</option>
                                <option value="price_asc">家賃が安い順</option>
                                <option value="price_desc">家賃が高い順</option>
                            </select>
                        </div>

                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm font-medium flex items-center space-x-2 sm:hidden w-full justify-center"
                        >
                            <span>こだわり条件</span>
                            <span className="bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 text-xs">
                                {selectedFeatures.length}
                            </span>
                            <svg className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* 下段: 特徴フィルター (PCでは常に表示、モバイルでは開閉) */}
                    <div className={`${isFilterOpen ? 'block' : 'hidden'} sm:block`}>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                                const isSelected = selectedFeatures.includes(key)
                                return (
                                    <button
                                        key={key}
                                        onClick={() => toggleFeature(key)}
                                        className={`
                                            px-3 py-1.5 rounded-full text-sm font-medium transition-all
                                            ${isSelected 
                                                ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-600 ring-offset-1' 
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }
                                        `}
                                    >
                                        {label.replace(/^[^\s]+\s/, '')} {/* 絵文字を除去して表示する場合 */}
                                        {/* 絵文字ありならそのまま label を使う */}
                                    </button>
                                )
                            })}
                            {selectedFeatures.length > 0 && (
                                <button 
                                    onClick={() => setSelectedFeatures([])}
                                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline decoration-dotted"
                                >
                                    クリア
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 検索結果カウント */}
            <div className="flex justify-between items-center px-2">
                <p className="text-sm text-gray-500">
                    <span className="font-bold text-gray-900 dark:text-white text-lg">{filteredAndSortedAreas.length}</span>
                    <span className="ml-1">エリアが見つかりました</span>
                </p>
            </div>

            {/* リスト表示 */}
            <div className="grid md:grid-cols-3 gap-4">
                {filteredAndSortedAreas.map((area, index) => (
                    <AreaCard key={area.name} area={area} />
                ))}
            </div>
            
            {filteredAndSortedAreas.length === 0 && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 text-lg">条件に一致するエリアが見つかりませんでした</p>
                    <button 
                        onClick={() => {
                            setSelectedFeatures([])
                            setSelectedRoomType('default')
                            setSortOrder('default')
                        }}
                        className="mt-4 text-primary-600 font-medium hover:underline"
                    >
                        条件をリセットする
                    </button>
                </div>
            )}
        </div>
    )
}

function AreaCard({ area }: { area: Area }) {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // モーダル表示時にスクロールをロック
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    // 家賃レベル判定 (〜7万:1, 〜11万:2, 11万〜:3)
    const getRentLevel = (price: number) => {
        if (price < 70000) return 1
        if (price < 110000) return 2
        return 3
    }
    const rentLevel = getRentLevel(area.averageRent)

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                <div className="p-6 md:p-8">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl font-bold">{area.name}</h2>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* 特徴タグ（モーダル内に移動） */}
                        {area.features && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center text-primary-600">
                                    <span className="mr-2">✨</span>こだわり条件
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                                        const isActive = area.features?.includes(key)
                                        if (!isActive) return null
                                        return (
                                            <div 
                                                key={key} 
                                                className="flex items-center p-2 rounded-lg border bg-primary-50 border-primary-200 text-primary-800 font-medium text-sm"
                                            >
                                                <span>{label}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 街の特徴 */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center text-primary-600">
                                <span className="mr-2">📍</span>街の特徴
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {area.description}
                            </p>
                        </div>

                        {/* 家賃相場 */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center text-primary-600">
                                <span className="mr-2">💰</span>家賃相場
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">間取り</th>
                                            <th className="px-4 py-3 font-medium text-right">相場</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        <tr>
                                            <td className="px-4 py-3">ワンルーム / 1K</td>
                                            <td className="px-4 py-3 text-right font-semibold">
                                                {area.rentByRoomType.oneRoom ? area.rentByRoomType.oneRoom.toLocaleString() + '円' : '-'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3">1LDK / 2K</td>
                                            <td className="px-4 py-3 text-right font-semibold">
                                                {area.rentByRoomType.oneLDK ? area.rentByRoomType.oneLDK.toLocaleString() + '円' : '-'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3">2LDK / 3K</td>
                                            <td className="px-4 py-3 text-right font-semibold">
                                                {area.rentByRoomType.twoLDK ? area.rentByRoomType.twoLDK.toLocaleString() + '円' : '-'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3">3LDK / 4K~</td>
                                            <td className="px-4 py-3 text-right font-semibold">
                                                {area.rentByRoomType.threeLDK ? area.rentByRoomType.threeLDK.toLocaleString() + '円' : '-'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <>
            <div 
                onClick={() => setIsOpen(true)}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full border border-transparent hover:border-primary-100 dark:hover:border-primary-900"
            >
                {/* ヘッダー: エリア名 */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        {area.name}
                    </h3>
                </div>
                
                {/* メイン: 家賃レンジ */}
                <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">家賃相場</p>
                    <p className="text-2xl font-bold text-primary-600">
                        {(area.minRent / 10000).toFixed(1)}
                        <span className="text-sm text-gray-500 font-normal mx-1">〜</span>
                        {(area.maxRent / 10000).toFixed(1)}
                        <span className="text-sm text-gray-500 font-normal ml-1">万円</span>
                    </p>
                </div>

                {/* ボディ: 説明文チラ見せ */}
                <div className="flex-grow">
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                        {area.description}
                    </p>
                </div>

                {/* ホバー時のヒント（視覚的なアフォーダンス） */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end items-center text-primary-600 text-sm font-medium">
                    <span>詳細を見る</span>
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>

            {/* ポータルで描画 */}
            {mounted && isOpen && createPortal(modalContent, document.body)}
        </>
    )
}
