import { NextRequest, NextResponse } from 'next/server'
import { getPrefectures, getPrefectureDetail } from '@/lib/data'
import type { AffordableArea } from '@/types/rent'

export const runtime = 'edge'

// OpenAI初期化


// 家賃計算ロジック
function calculateRecommendedRent(salary: number, familySize: number = 1) {
    // 手取りの20%〜30%を目安とする
    const baseRatio = 0.25 // 25%を基準
    return {
        min: Math.floor(salary * 0.2), // 20%
        ideal: Math.floor(salary * 0.25), // 25%
        max: Math.floor(salary * 0.3), // 30%
    }
}

// エリアスコアリングロジック
async function findTopAreas(
    minRent: number,
    maxRent: number,
    targetPrefectures: string[],
    features: string[]
): Promise<AffordableArea[]> {
    const allAreas: AffordableArea[] = []
    
    // データ取得
    const prefectures = getPrefectures()
    // ターゲット都道府県のみフィルタリング（空なら全部）
    const targetSlugs = targetPrefectures.length > 0
        ? targetPrefectures
        : prefectures.map(p => p.slug) // 指定なしなら全県

    const detailedPrefectures = await Promise.all(
        targetSlugs.map(slug => getPrefectureDetail(slug))
    )

    // エリア抽出
    detailedPrefectures.forEach((prefecture) => {
        if (!prefecture || !prefecture.areas) return

        prefecture.areas.forEach((area) => {
            // 家賃フィルター（家賃が安すぎる＝質が低い可能性もあるので、下限は緩く、上限は厳しく）
            // ここでは簡易的に「平均家賃が予算上限以下」かつ「予算下限の-2万以上」とする
            if (area.averageRent <= 0) return
            if (area.averageRent > maxRent) return
            // if (area.averageRent < minRent - 20000) return 

            allAreas.push({
                name: area.name,
                averageRent: area.averageRent,
                distance: `${area.nearestStation}から徒歩${area.distanceToStation}分`,
                prefecture: prefecture.name,
                latitude: area.latitude,
                longitude: area.longitude,
                features: area.features || [],
                description: area.description // AIプロンプト用に説明文も含める
            })
        })
    })

    // スコアリングとソート
    return allAreas
        .map(area => {
            // 特徴マッチングスコア
            const matchedFeatures = features.filter(f => area.features?.includes(f))
            let score = matchedFeatures.length * 10 // 特徴一致ごとに10点

            // 家賃スコア（予算に近いほど高得点、安すぎても加点しない）
            // 理想家賃との差分が小さいほど良い
            // const rentDiff = Math.abs(area.averageRent - (minRent + maxRent) / 2)
            // score -= rentDiff / 1000 // 1000円ズレるごとに-1点

            return { ...area, score, matchedFeatures }
        })
        .sort((a, b) => b.score - a.score) // スコア高い順
        .slice(0, 3) // 上位3件
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { salary, familySize = 1, prefectures = [], features = [], isStudent = 'false', budget } = body
        
        const isStudentMode = String(isStudent) === 'true'

        // 1. 家賃計算
        let rentRange;
        if (isStudentMode && budget) {
            // 学生モード: 直接予算を指定
            const budgetNum = Number(budget)
            rentRange = {
                min: Math.max(0, budgetNum - 5000),
                ideal: budgetNum,
                max: budgetNum + 5000
            }
        } else {
            // 通常モード: 給料から計算
            if (!salary || salary <= 0) {
                return NextResponse.json({ error: '正しい給与額を入力してください' }, { status: 400 })
            }
            rentRange = calculateRecommendedRent(Number(salary), Number(familySize))
        }

        // 2. ベストエリア選定
        const topAreas = await findTopAreas(rentRange.min, rentRange.max, prefectures, features)

        // データがない場合
        if (topAreas.length === 0) {
            return NextResponse.json({
                rentRange,
                topAreas: [],
                aiAdvice: null
            })
        }

        // 3. AI分析（分離済みのためここではnullを返す）
        // クライアント側で別途 /api/planner/advice をコールする
        const aiAdvice = null

        return NextResponse.json({
            rentRange,
            topAreas,
            aiAdvice
        })

    } catch (error) {
        console.error('Planner API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
