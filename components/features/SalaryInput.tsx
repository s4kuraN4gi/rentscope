'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SalaryInput() {
    const router = useRouter()
    const [salary, setSalary] = useState('')
    const [familySize, setFamilySize] = useState('1')
    const [location, setLocation] = useState('')
    const [isLoading, setIsLoading] = useState(false)

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
                    <span className="absolute right-4 top-3 text-gray-500">円</span>
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
