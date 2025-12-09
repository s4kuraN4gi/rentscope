'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdSenseUnit from '@/components/features/AdSenseUnit'
import { FEATURE_LABELS } from '@/lib/constants'
import type { AffordableArea } from '@/types/rent'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// 型定義
interface PlannerResult {
    rentRange: {
        min: number
        max: number
        ideal: number
    }
    topAreas: AffordableArea[]
    aiAdvice: {
        area1_comment?: string
        area2_comment?: string
        area3_comment?: string
        summary?: string
    } | null
}

function ResultContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [result, setResult] = useState<PlannerResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loadingStage, setLoadingStage] = useState(0) // 0: init, 1: calculating, 2: searching, 3: analyzing

    useEffect(() => {
        const fetchData = async () => {
            try {
                // ローディング演出開始
                setLoadingStage(1)
                
                const payload = {
                    salary: searchParams.get('salary') ? Number(searchParams.get('salary')) : undefined,
                    budget: searchParams.get('budget') ? Number(searchParams.get('budget')) : undefined,
                    isStudent: searchParams.get('isStudent') === 'true',
                    familySize: Number(searchParams.get('familySize')),
                    prefectures: searchParams.get('prefectures')?.split(',').filter(Boolean) || [],
                    features: searchParams.get('features')?.split(',').filter(Boolean) || [],
                }

                // 少し待って次のステージへ（演出）
                await new Promise(r => setTimeout(r, 600))
                setLoadingStage(2)

                const res = await fetch('/api/planner', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })

                if (!res.ok) throw new Error('診断に失敗しました')

                setLoadingStage(3)
                const data = await res.json()
                
                // AI分析演出のため少し待つ
                await new Promise(r => setTimeout(r, 800))
                
                setResult(data)
            } catch (err) {
                console.error(err)
                setError('データの取得中にエラーが発生しました')
            }
        }

        fetchData() // 給与がなくても（学生モードなら）実行する必要があるため、条件判定を外すか調整が必要
    }, [searchParams])

    // ローディング画面
    if (!result && !error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="w-24 h-24 mb-8 relative">
                    <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-white p-4 rounded-full shadow-lg text-4xl flex items-center justify-center h-full w-full">
                        🏠
                    </div>
                </div>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                    AIが最適なプランを作成中...
                </h2>
                <div className="w-full max-w-sm bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                    <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${loadingStage * 33}%` }}
                    />
                </div>
                <p className="text-gray-500 animate-pulse">
                    {loadingStage === 1 && '条件を分析しています...'}
                    {loadingStage === 2 && '条件に合うエリアを探しています...'}
                    {loadingStage === 3 && 'AIがおすすめ理由を生成しています...'}
                </p>
            </div>
        )
    }

    if (error || !result) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
                <p className="text-red-500 mb-4">{error || 'データが見つかりませんでした'}</p>
                <button onClick={() => router.back()} className="text-primary-600 underline">
                    条件入力に戻る
                </button>
            </div>
        )
    }

    const bestArea = result.topAreas[0]
    const otherAreas = result.topAreas.slice(1)

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-12 animate-fadeIn">
            
            {/* 総合コメント */}
            {result.aiAdvice?.summary && (
                <div className="bg-gradient-to-r from-indigo-50 to-primary-50 dark:from-indigo-900/20 dark:to-primary-900/20 p-6 rounded-2xl border border-primary-100 dark:border-primary-800 shadow-sm">
                    <div className="flex gap-4 items-start">
                        <div className="text-4xl">🤖</div>
                        <div>
                            <h3 className="font-bold text-lg mb-2 text-indigo-900 dark:text-indigo-200">AIコンシェルジュより</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                {result.aiAdvice.summary}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 第1位（ベストマッチ） */}
            {bestArea ? (
                <section className="relative">
                    <div className="absolute -top-6 -left-4 z-10 w-20 h-20 bg-yellow-400 text-white rounded-full flex items-center justify-center font-black text-2xl shadow-lg transform -rotate-12 border-4 border-white dark:border-gray-900">
                        No.1
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-primary-100 dark:border-gray-700">
                        <div className="bg-primary-600 p-6 text-white text-center">
                            <p className="text-sm font-bold opacity-80 mb-1">あなたにとって最高の街は...</p>
                            <h2 className="text-4xl font-black tracking-tight drop-shadow-md">
                                {bestArea.prefecture} {bestArea.name}
                            </h2>
                        </div>
                        <div className="p-6 sm:p-10">
                            {/* データグリッド */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">平均家賃</p>
                                    <p className="text-xl font-bold text-primary-600">
                                        {bestArea.averageRent > 0 
                                            ? `${(bestArea.averageRent / 10000).toFixed(1)}万円` 
                                            : 'データなし'
                                        }
                                    </p>
                                </div>

                                <div className="col-span-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">特徴</p>
                                    <div className="flex flex-wrap gap-1">
                                        {/* マッチした特徴 */}
                                        {bestArea.matchedFeatures?.map(f => (
                                            <span key={f} className="text-xs bg-primary-100 text-primary-700 border border-primary-200 px-2 py-1 rounded-full font-medium">
                                                {FEATURE_LABELS[f] || f}
                                            </span>
                                        ))}
                                        {/* マッチしていないその他の特徴 */}
                                        {bestArea.features?.filter(f => !bestArea.matchedFeatures?.includes(f)).map(f => (
                                            <span key={`other-${f}`} className="text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
                                                {FEATURE_LABELS[f] || f}
                                            </span>
                                        ))}
                                        {(!bestArea.features || bestArea.features.length === 0) && (
                                            <span className="text-xs text-gray-400">登録された特徴はありません</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* AIコメント */}
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-2xl relative mb-8">
                                <div className="absolute -top-3 left-8 w-6 h-6 bg-indigo-50 dark:bg-indigo-900/30 transform rotate-45"></div>
                                <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">💡 おすすめポイント</h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {result.aiAdvice?.area1_comment || bestArea.description}
                                </p>
                            </div>

                            {/* アクションボタン */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a 
                                    href={`https://suumo.jp/jj/chintai/ichiran/FR301FC001/?ar=030&bs=040&ta=13&sc=13103&cb=0.0&ct=9999999&et=9999999&cn=9999999&mb=0&mt=9999999&shkr1=03&shkr2=03&shkr3=03&shkr4=03&fw=${encodeURIComponent(bestArea.name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-xl text-center shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
                                >
                                    <span>SUUMOで物件を見る</span>
                                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded">PR</span>
                                </a>
                                <Link 
                                    href={`/prefecture/tokyo`} // ※実際にはprefecture slugを動的に取得すべき
                                    className="flex-1 bg-white border-2 border-indigo-100 text-indigo-600 font-bold py-4 rounded-xl text-center hover:bg-indigo-50 hover:border-indigo-200 transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                    エリア詳細を見る
                                </Link>
                            </div>

                            {/* 広告ユニット: アクション直後の一等地 */}
                            <div className="mt-8">
                                <p className="text-xs text-center text-gray-400 mb-2">- PR -</p>
                                <AdSenseUnit
                                    slot="1234567890" // 共通スロットID（実際は適切なIDに分けることを推奨）
                                    format="horizontal"
                                    className="max-w-full mx-auto"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                <div className="text-center py-12">条件に合うエリアが見つかりませんでした</div>
            )}

            {/* 2位・3位の提案 */}
            {otherAreas.length > 0 && (
                <section>
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span className="text-gray-400">Other Candidates</span>
                        <span>こちらもおすすめ</span>
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {otherAreas.map((area, idx) => (
                            <div key={area.name} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-xl font-bold">{area.prefecture} {area.name}</h4>
                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-full">
                                        No.{idx + 2}
                                    </span>
                                </div>
                                <p className="text-3xl font-bold text-primary-600 mb-4">
                                    {(area.averageRent / 10000).toFixed(1)}<span className="text-sm text-gray-500 font-normal">万円</span>
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                    {idx === 0 ? result.aiAdvice?.area2_comment : result.aiAdvice?.area3_comment || area.description}
                                </p>
                                <a 
                                    href={`https://www.google.com/search?q=${encodeURIComponent(area.prefecture + area.name + " 賃貸")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center py-3 rounded-lg border border-primary-100 text-primary-600 hover:bg-primary-50 font-bold transition-colors text-sm"
                                >
                                    Googleで検索
                                </a>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
                <button 
                    onClick={() => router.back()}
                    className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 underline transition-colors"
                >
                    条件を変更して再診断する
                </button>
                <p className="mt-4 text-xs text-center text-gray-300 dark:text-gray-700">RentScope v2.0.1 (Fix Applied)</p>
            </div>
        </div>
    )
}

export default function PlannerResultPage() {
    return (
        <Suspense fallback={<div className="min-h-screen grid place-items-center">読み込み中...</div>}>
            <ResultContent />
        </Suspense>
    )
}
