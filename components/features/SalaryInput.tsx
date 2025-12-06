'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SalaryInput() {
    const router = useRouter()
    const [salary, setSalary] = useState('')
    const [familySize, setFamilySize] = useState('1')
    const [location, setLocation] = useState('')
    const [features, setFeatures] = useState<string[]>([])
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const tooltipRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setActiveTooltip(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!salary || Number(salary) <= 0) {
            alert('正しい月収を入力してください')
            return
        }

        setIsLoading(true)

        try {
            // 分析APIを呼び出し
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    salary: Number(salary),
                    familySize: Number(familySize),
                    location: location || undefined,
                    features: features,
                }),
            })

            if (!response.ok) {
                throw new Error('分析に失敗しました')
            }

            const data = await response.json()

            // 結果ページに遷移(データをクエリパラメータで渡す)
            const params = new URLSearchParams({
                salary,
                familySize,
                location: location || '',
                features: features.join(','),
            })

            router.push(`/result?${params.toString()}`)
        } catch (error) {
            console.error('Error:', error)
            alert('エラーが発生しました。もう一度お試しください。')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* 月収入力 */}
            <div>
                <label htmlFor="salary" className="block text-sm font-medium mb-2">
                    月収(手取り) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        type="number"
                        id="salary"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        placeholder="例: 250000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600"
                        required
                        min="0"
                        step="1000"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">円</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">※手取り額を入力してください</p>
            </div>

            {/* 家族構成 */}
            <div>
                <label htmlFor="familySize" className="block text-sm font-medium mb-2">
                    家族構成
                </label>
                <select
                    id="familySize"
                    value={familySize}
                    onChange={(e) => setFamilySize(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600"
                >
                    <option value="1">一人暮らし</option>
                    <option value="2">二人暮らし</option>
                    <option value="3">三人家族</option>
                    <option value="4">四人以上</option>
                </select>
            </div>

            {/* 希望エリア(任意) */}
            <div>
                <label htmlFor="location" className="block text-sm font-medium mb-2">
                    希望エリア(任意)
                </label>
                <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="例: 東京都, 大阪府"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600"
                />
            </div>

            {/* こだわり条件 */}
            <div ref={tooltipRef}>
                <label className="block text-sm font-medium mb-2">
                    こだわり条件（複数選択可）
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'pet_friendly', label: '🐶 ペットと暮らす', description: 'ペット可物件の割合が高いエリアを優先します' },
                        { id: 'safe_area', label: '🛡️ 治安重視', description: '犯罪発生率が低く、治安が良いエリアを優先します' },
                        { id: 'child_rearing', label: '👶 子育て環境', description: '公園や学校が多く、子育てしやすい環境を優先します' },
                        { id: 'access_good', label: '🚃 アクセス重視', description: '複数路線利用可や、主要駅へのアクセスが良いエリアを優先します' },
                        { id: 'cost_performance', label: '💰 コスパ重視', description: '家賃相場の割に利便性が高いエリアを優先します' },
                        { id: 'shopping_convenient', label: '🛍️ 買い物便利', description: 'スーパーや商店街が充実しているエリアを優先します' },
                    ].map((feature) => (
                        <div key={feature.id} className="relative">
                            <label
                                className={`
                                    flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all h-full
                                    ${features.includes(feature.id)
                                        ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500'
                                        : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                                    }
                                `}
                            >
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        value={feature.id}
                                        checked={features.includes(feature.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFeatures([...features, feature.id])
                                            } else {
                                                setFeatures(features.filter(f => f !== feature.id))
                                            }
                                        }}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm">{feature.label}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation() // 親のlabelクリックイベントへの伝播を防ぐ
                                        setActiveTooltip(activeTooltip === feature.id ? null : feature.id)
                                    }}
                                    className="ml-2 text-gray-400 hover:text-primary-500 focus:outline-none p-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                </button>
                            </label>
                            
                            {/* ツールチップ */}
                            {activeTooltip === feature.id && (
                                <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                                    {feature.description}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 送信ボタン */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-400 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        分析中...
                    </span>
                ) : (
                    '分析する'
                )}
            </button>
        </form>
    )
}
