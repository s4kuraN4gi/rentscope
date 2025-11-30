'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import RentChart from '@/components/features/RentChart'
import AreaMap from '@/components/features/AreaMap'
import AIAnalysis from '@/components/features/AIAnalysis'
import AdSenseUnit from '@/components/features/AdSenseUnit'

interface AnalysisResult {
    recommendedRent: {
        min: number
        max: number
        ideal: number
    }
    affordableAreas: Array<{
        name: string
        averageRent: number
        distance: string
        prefecture: string
        latitude: number
        longitude: number
    }>
    incomeGap: {
        targetArea: string
        requiredIncome: number
        gap: number
    }
    chartData: any
}

function ResultPageContent() {
    const searchParams = useSearchParams()
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [aiAnalysis, setAiAnalysis] = useState<{ analysis: string; tips: string[] } | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const salary = searchParams.get('salary')
    const familySize = searchParams.get('familySize')
    const location = searchParams.get('location')

    useEffect(() => {
        async function fetchAnalysis() {
            if (!salary) {
                setIsLoading(false)
                return
            }

            try {
                // 分析データを取得
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        salary: Number(salary),
                        familySize: Number(familySize) || 1,
                        location: location || undefined,
                    }),
                })

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`)
                }

                const data = await response.json()
                setResult(data)

                // AI分析を取得
                const aiResponse = await fetch('/api/openai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        salary: Number(salary),
                        recommendedRent: data.recommendedRent.ideal,
                        areas: data.affordableAreas.map((a: any) => a.name),
                    }),
                })

                if (aiResponse.ok) {
                    const aiData = await aiResponse.json()
                    setAiAnalysis(aiData)
                } else {
                    console.warn('AI analysis failed, continuing without it')
                }
            } catch (error) {
                console.error('Error fetching analysis:', error)
                setResult(null)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAnalysis()
    }, [salary, familySize, location])

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-xl">分析中...</p>
            </div>
        )
    }

    if (!result) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-xl text-red-500 mb-4">
                    {!salary ? '給与情報が見つかりません' : 'データの取得に失敗しました'}
                </p>
                <Link
                    href="/"
                    className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    トップページに戻る
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8">分析結果</h1>

            {/* 広告 */}
            <AdSenseUnit slot="1111111111" format="horizontal" className="mb-8" />

            {/* 推奨家賃 */}
            <section className="glass rounded-2xl p-8 mb-8 animate-fadeIn">
                <h2 className="text-2xl font-bold mb-4">💰 推奨家賃</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">最低</p>
                        <p className="text-2xl font-bold text-primary-600">
                            {result.recommendedRent.min.toLocaleString()}円
                        </p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-primary-600 to-primary-400 text-white rounded-lg">
                        <p className="text-sm">理想</p>
                        <p className="text-3xl font-bold">
                            {result.recommendedRent.ideal.toLocaleString()}円
                        </p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">最高</p>
                        <p className="text-2xl font-bold text-primary-600">
                            {result.recommendedRent.max.toLocaleString()}円
                        </p>
                    </div>
                </div>
            </section>

            {/* グラフ */}
            <section className="glass rounded-2xl p-8 mb-8 animate-fadeIn">
                <h2 className="text-2xl font-bold mb-4">📊 家賃分析グラフ</h2>
                <RentChart data={result.chartData} />
            </section>

            {/* 広告 */}
            <AdSenseUnit slot="2222222222" format="infeed" className="mb-8" />

            {/* 住めるエリア */}
            <section className="glass rounded-2xl p-8 mb-8 animate-fadeIn">
                <h2 className="text-2xl font-bold mb-4">🗺️ あなたが住めるエリア</h2>
                <AreaMap areas={result.affordableAreas} />

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                    {result.affordableAreas.map((area, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-bold text-lg">{area.name}</h3>
                            <p className="text-primary-600 font-semibold">
                                平均家賃: {area.averageRent.toLocaleString()}円
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{area.distance}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* AI分析 */}
            {aiAnalysis && (
                <section className="glass rounded-2xl p-8 mb-8 animate-fadeIn">
                    <h2 className="text-2xl font-bold mb-4">🤖 AI分析</h2>
                    <AIAnalysis analysis={aiAnalysis.analysis} tips={aiAnalysis.tips} />
                </section>
            )}

            {/* 収入ギャップ */}
            <section className="glass rounded-2xl p-8 mb-8 animate-fadeIn">
                <h2 className="text-2xl font-bold mb-4">📈 理想のエリアに住むには</h2>
                <p className="text-lg mb-2">
                    <span className="font-bold">{result.incomeGap.targetArea}</span>に住むには
                </p>
                <p className="text-3xl font-bold text-primary-600 mb-2">
                    月収 {result.incomeGap.requiredIncome.toLocaleString()}円
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                    あと<span className="font-bold text-xl">{result.incomeGap.gap.toLocaleString()}円</span>の収入アップが必要です
                </p>
            </section>

            {/* 広告 */}
            <AdSenseUnit slot="3333333333" format="horizontal" className="mb-8" />
        </div>
    )
}

export default function ResultPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-xl">読み込み中...</p>
            </div>
        }>
            <ResultPageContent />
        </Suspense>
    )
}
