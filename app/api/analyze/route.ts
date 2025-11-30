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

// エリアマッチングロジック(実データ使用)
function findAffordableAreas(maxRent: number, location?: string): AffordableArea[] {
    const allAreas: AffordableArea[] = []
    
    // prefectures.jsonから全エリアを取得
    prefecturesData.forEach((prefecture: any) => {
        prefecture.areas.forEach((area: any) => {
            allAreas.push({
                name: area.name,
                averageRent: area.averageRent,
                distance: `${area.nearestStation}から徒歩${area.distanceToStation}分`,
                prefecture: prefecture.name,
                latitude: area.latitude,
                longitude: area.longitude,
            })
        })
    })

    return allAreas
        .filter(area => area.averageRent <= maxRent)
        .sort((a, b) => a.averageRent - b.averageRent)
        .slice(0, 5)
}

// 収入ギャップ計算(実データ使用)
function calculateIncomeGap(currentSalary: number, targetArea: string = '港区'): IncomeGap {
    // 実データから目標エリアの家賃を取得
    let targetRent = 317000 // デフォルト: 港区の平均家賃
    
    for (const prefecture of prefecturesData) {
        const area = prefecture.areas.find((a: any) => a.name === targetArea)
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
        const { salary, familySize = 1, location } = body

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
        const affordableAreas = findAffordableAreas(recommendedRent.max, location)

        // 収入ギャップを計算
        const incomeGap = calculateIncomeGap(salary, location || '港区')

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
