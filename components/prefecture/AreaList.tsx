'use client'

import { useState, useEffect } from 'react'
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
    if (!areas || areas.length === 0) {
        return <p className="col-span-3 text-center text-gray-500">エリアデータがありません</p>
    }

    return (
        <div className="grid md:grid-cols-3 gap-4">
            {areas.map((area, index) => (
                <AreaCard key={index} area={area} />
            ))}
        </div>
    )
}

function AreaCard({ area }: { area: Area }) {
    const [isOpen, setIsOpen] = useState(false)

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

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-4">{area.name}</h3>
                
                {/* 特徴タグ */}
                {area.features && (
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                            const isActive = area.features?.includes(key)
                            return (
                                <div 
                                    key={key} 
                                    className={`
                                        flex items-center p-2 rounded-lg border text-sm transition-colors
                                        ${isActive 
                                            ? 'bg-primary-50 border-primary-200 text-primary-800 font-medium' 
                                            : 'bg-gray-50 border-gray-100 text-gray-400'
                                        }
                                    `}
                                >
                                    <span>{label}</span>
                                    {isActive && <span className="ml-auto text-primary-600">★</span>}
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="mt-auto">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center font-medium shadow-sm"
                    >
                        <span>詳細・家賃相場を見る</span>
                    </button>
                </div>
            </div>

            {/* モーダル */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            )}
        </>
    )
}
