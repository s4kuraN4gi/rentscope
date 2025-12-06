import { NextRequest, NextResponse } from 'next/server'
import type { SalaryInput, RecommendedRent, IncomeGap } from '@/types/salary'
import type { AffordableArea } from '@/types/rent'
import prefecturesData from '@/data/prefectures.json'

// 家賃計算ロジック
function calculateRecommendedRent(salary: number, familySize: number = 1): RecommendedRent {
    // 一般的な家賃目安: 手取りの25-30%
    const baseRatio = 0.275 // 27.5%を基準
    const ideal = Math.floor(salary * baseRatio)

    // 家族構成による調整
    const familyAdjustment = (familySize - 1) * 0.05
    const adjustedIdeal = Math.floor(ideal * (1 + familyAdjustment))

    return {
        min: Math.floor(adjustedIdeal * 0.85),
        max: Math.floor(adjustedIdeal * 1.15),
        ideal: adjustedIdeal,
    }
}

import { getPrefectures, getPrefectureDetail } from '@/lib/data'

// エリアマッチングロジック(実データ使用)
async function findAffordableAreas(maxRent: number, location?: string, features: string[] = []): Promise<AffordableArea[]> {
    const allAreas: AffordableArea[] = []
    
    // 全都道府県の詳細データを取得
    const prefectures = getPrefectures()
    const detailedPrefectures = await Promise.all(
        prefectures.map(p => getPrefectureDetail(p.slug))
    )
    
    // 有効なデータのみ処理
    detailedPrefectures.forEach((prefecture) => {
        if (!prefecture || !prefecture.areas) return

        prefecture.areas.forEach((area) => {
            allAreas.push({
                name: area.name,
                averageRent: area.averageRent,
                distance: `${area.nearestStation}から徒歩${area.distanceToStation}分`,
                prefecture: prefecture.name,
                latitude: area.latitude,
                longitude: area.longitude,
                features: area.features || [],
            })
        })
    })

    // フィルタリングとスコアリング
    return allAreas
        .filter(area => {
            // 家賃条件
            if (area.averageRent > maxRent) return false
            // エリア条件(指定がある場合)
            if (location && !area.prefecture.includes(location) && !area.name.includes(location)) return false

            // 特徴条件(AND検索: 指定された特徴を全て満たす必要がある)
            if (features.length > 0) {
                const hasAllFeatures = features.every(f => area.features?.includes(f))
                if (!hasAllFeatures) return false
            }

            return true
        })
        .map(area => {
            // 特徴マッチングスコア計算
            const matchedFeatures = features.filter(f => area.features?.includes(f))
            const score = matchedFeatures.length
            return { ...area, score, matchedFeatures }
        })
        .sort((a, b) => {
            // スコアが高い順 > 家賃が安い順
            if (b.score !== a.score) return b.score - a.score
            return a.averageRent - b.averageRent
        })
        .slice(0, 5)
}

// 収入ギャップ計算(実データ使用)
async function calculateIncomeGap(currentSalary: number, targetArea: string = '港区'): Promise<IncomeGap> {
    // 実データから目標エリアの家賃を取得
    let targetRent = 317000 // デフォルト: 港区の平均家賃
    
    // 全都道府県の詳細データを取得（キャッシュされることを期待、あるいは最適化の余地あり）
    // ※ ここでは簡易的に全取得するが、本来はターゲットエリアが含まれる都道府県だけ取得すべき
    // しかしターゲットエリアがどの都道府県かわからないため全検索が必要
    // パフォーマンス改善のため、主要な都道府県から検索するなどの工夫が可能
    
    const prefectures = getPrefectures()
    const detailedPrefectures = await Promise.all(
        prefectures.map(p => getPrefectureDetail(p.slug))
    )
    
    for (const prefecture of detailedPrefectures) {
        if (!prefecture || !prefecture.areas) continue
        
        const area = prefecture.areas.find((a) => a.name === targetArea)
        if (area) {
            targetRent = area.averageRent
            break
        }
    }
    
    const requiredIncome = Math.ceil(targetRent / 0.275)

    return {
        targetArea,
        requiredIncome,
        gap: Math.max(0, requiredIncome - currentSalary),
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: SalaryInput = await request.json()
        const { salary, familySize = 1, location, features } = body

        // バリデーション
        if (!salary || salary <= 0) {
            return NextResponse.json(
                { error: '正しい給与額を入力してください' },
                { status: 400 }
            )
        }

        // 推奨家賃を計算
        const recommendedRent = calculateRecommendedRent(salary, familySize)

        // 住めるエリアを検索
        const affordableAreas = await findAffordableAreas(recommendedRent.max, location, features)

        // 収入ギャップを計算
        const incomeGap = await calculateIncomeGap(salary, location || '港区')

        // グラフ用データ
        const chartData = {
            labels: ['最低', '推奨', '最高', '現在の給与'],
            datasets: [
                {
                    label: '家賃(円)',
                    data: [
                        recommendedRent.min,
                        recommendedRent.ideal,
                        recommendedRent.max,
                        salary * 0.3,
                    ],
                },
            ],
        }

        return NextResponse.json({
            recommendedRent,
            affordableAreas,
            incomeGap,
            chartData,
        })
    } catch (error) {
        console.error('Analysis error:', error)
        return NextResponse.json(
            { error: '分析中にエラーが発生しました' },
            { status: 500 }
        )
    }
}
