'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import RentChart from '@/components/features/RentChart'
import AreaMap from '@/components/features/AreaMap'
import AIAnalysis from '@/components/features/AIAnalysis'
import AdSenseUnit from '@/components/features/AdSenseUnit'
import ShareButtons from '@/components/features/ShareButtons'

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
        features?: string[]
        matchedFeatures?: string[]
        images?: string[]
        reviews?: Array<{
            age: number
            gender: string
            comment: string
            rating: number
        }>
    }>
    incomeGap: {
        targetArea: string
        requiredIncome: number
        gap: number
    }
    chartData: any
}

const FEATURE_LABELS: Record<string, string> = {
    pet_friendly: '🐶 ペット可',
    safe_area: '🛡️ 治安良し',
    child_rearing: '👶 子育て向き',
    access_good: '🚃 アクセス良',
    cost_performance: '💰 コスパ良',
    shopping_convenient: '🛍️ 買い物便利',
}

function ResultPageContent() {
    const searchParams = useSearchParams()
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [aiAnalysis, setAiAnalysis] = useState<{ analysis: string; tips: string[] } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [showAiAd, setShowAiAd] = useState(false)
    const [aiError, setAiError] = useState<string | null>(null)
    const [selectedArea, setSelectedArea] = useState<AnalysisResult['affordableAreas'][0] | null>(null)

    const salary = searchParams.get('salary')
    const familySize = searchParams.get('familySize')
    const location = searchParams.get('location')
    const featuresParam = searchParams.get('features')

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
                        features: featuresParam ? featuresParam.split(',') : [],
                    }),
                })

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`)
                }

                const data = await response.json()
                setResult(data)


            } catch (error) {
                console.error('Error fetching analysis:', error)
                setResult(null)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAnalysis()
    }, [salary, familySize, location, featuresParam])

    const handleAiAnalysis = async () => {
        if (!result || !salary) return
        setShowAiAd(true)
        setIsAiLoading(true)
        setAiError(null)

        const fetchWithRetry = async (retries: number): Promise<void> => {
            try {
                const aiResponse = await fetch('/api/openai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        salary: Number(salary),
                        recommendedRent: result.recommendedRent.ideal,
                        areas: result.affordableAreas.map((a: any) => a.name),
                    }),
                })

                if (!aiResponse.ok) {
                    throw new Error(`API error: ${aiResponse.status}`)
                }

                const aiData = await aiResponse.json()
                setAiAnalysis(aiData)
            } catch (error) {
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    return fetchWithRetry(retries - 1)
                } else {
                    throw error
                }
            }
        }

        try {
            await fetchWithRetry(1)
        } catch (error) {
            console.error('Final AI analysis error:', error)
            setAiError('AI分析を利用できませんでした。時間を置いて再度お試しください。')
        } finally {
            setIsAiLoading(false)
        }
    }

    if (isLoading) {
        return <LoadingTips />
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

    const shareText = `私の適正家賃は${result.recommendedRent.ideal.toLocaleString()}円でした！\nおすすめエリア: ${result.affordableAreas[0]?.name}など\n\n給料から住めるエリアをAI分析 #RentScope`

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8">分析結果</h1>

            {/* シェアボタン */}
            <div className="mb-8">
                <ShareButtons title={shareText} />
            </div>

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
                        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{area.name}</h3>
                                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                                    {area.matchedFeatures?.map(f => (
                                        <span key={f} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                                            {FEATURE_LABELS[f] || f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <p className="text-primary-600 font-semibold mb-1">
                                平均家賃: {area.averageRent.toLocaleString()}円
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{area.distance}</p>
                            
                            {/* その他の特徴タグ */}
                            <div className="flex flex-wrap gap-1 mt-2 mb-3">
                                {area.features?.filter(f => !area.matchedFeatures?.includes(f)).map(f => (
                                    <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        {FEATURE_LABELS[f] || f}
                                    </span>
                                ))}
                            </div>

                            <button
                                onClick={() => setSelectedArea(area)}
                                className="w-full mt-2 bg-white border border-primary-500 text-primary-600 py-2 rounded-lg hover:bg-primary-50 transition-colors text-sm font-semibold"
                            >
                                詳細を見る
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* エリア詳細モーダル */}
            {selectedArea && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn" onClick={() => setSelectedArea(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedArea.name}</h2>
                                <p className="text-gray-600 dark:text-gray-400">{selectedArea.prefecture}</p>
                            </div>
                            <button onClick={() => setSelectedArea(null)} className="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* 写真ギャラリー */}
                        {selectedArea.images && selectedArea.images.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-bold text-lg mb-2">📸 街の風景</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedArea.images.map((img, i) => (
                                        <img key={i} src={img} alt={`${selectedArea.name}の風景${i + 1}`} className="w-full h-48 object-cover rounded-lg" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 口コミ */}
                        {selectedArea.reviews && selectedArea.reviews.length > 0 && (
                            <div>
                                <h3 className="font-bold text-lg mb-2">🗣️ 住民の口コミ</h3>
                                <div className="space-y-3">
                                    {selectedArea.reviews.map((review, i) => (
                                        <div key={i} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-semibold">{review.age}代 {review.gender}</span>
                                                <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {!selectedArea.images && !selectedArea.reviews && (
                            <p className="text-center text-gray-500 py-8">詳細情報は準備中です</p>
                        )}
                    </div>
                </div>
            )}

            {/* AI分析 */}
            <section className="glass rounded-2xl p-8 mb-8 animate-fadeIn">
                <h2 className="text-2xl font-bold mb-4">🤖 AI分析</h2>
                
                {!aiAnalysis && !showAiAd && (
                    <div className="text-center">
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                            AIがあなたの給与と希望条件から、最適なエリアと生活のアドバイスを提案します。
                        </p>
                        <button
                            onClick={handleAiAnalysis}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                        >
                            AI分析を開始する (無料)
                        </button>
                    </div>
                )}

                {(showAiAd || isAiLoading) && !aiAnalysis && !aiError && (
                    <div className="text-center">
                         <p className="mb-4 font-bold animate-pulse">AIが分析中です...しばらくお待ちください</p>
                         {/* High CPM Banner Placeholder */}
                         <div className="my-4">
                            <AdSenseUnit slot="YOUR_HIGH_CPM_SLOT" format="horizontal" />
                         </div>
                         <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
                    </div>
                )}

                {aiError && (
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                        <p className="font-bold mb-2">⚠️ エラーが発生しました</p>
                        <p>{aiError}</p>
                        <button
                            onClick={handleAiAnalysis}
                            className="mt-4 text-sm underline hover:no-underline"
                        >
                            再試行する
                        </button>
                    </div>
                )}

                {aiAnalysis && (
                    <AIAnalysis analysis={aiAnalysis.analysis} tips={aiAnalysis.tips} />
                )}
            </section>

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

const LOADING_TIPS = [
    '家賃は手取りの3分の1が目安と言われています',
    '駅から徒歩10分を超えると家賃がガクッと下がる傾向があります',
    '1階の物件は2階以上より数千円安いことが多いです',
    'プロパンガスより都市ガスの方が光熱費を抑えられます',
    '南向きの部屋は人気ですが、西向きは夕日が綺麗で冬暖かいメリットも',
    '鉄筋コンクリート(RC)造は防音性が高いですが、家賃も高めです',
    '定期借家契約の物件は相場より安いことがありますが、更新できない場合があります',
]

function LoadingTips() {
    const [tip, setTip] = useState('')

    useEffect(() => {
        setTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)])
        const interval = setInterval(() => {
            setTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)])
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-6" />
            <p className="text-xl font-bold mb-4">AIが分析中...</p>
            <div className="max-w-md mx-auto bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg animate-fadeIn">
                <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold mb-1">💡 豆知識</p>
                <p className="text-gray-700 dark:text-gray-300 min-h-[3rem] flex items-center justify-center">
                    {tip}
                </p>
            </div>
        </div>
    )
}

export default function ResultPage() {
    return (
        <Suspense fallback={<LoadingTips />}>
            <ResultPageContent />
        </Suspense>
    )
}
