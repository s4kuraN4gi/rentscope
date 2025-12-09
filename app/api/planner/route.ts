import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getPrefectures, getPrefectureDetail } from '@/lib/data'
import type { AffordableArea } from '@/types/rent'
import { FEATURE_LABELS } from '@/lib/constants'

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

        // 3. AI分析（GPT-3.5-turbo）
        let aiAdvice = null
        
        // プロンプト構築
        const featureNames = features.map((f: string) => FEATURE_LABELS[f]).join('、')
        const areaInfos = topAreas.map((area, index) => 
            `${index + 1}. ${area.prefecture}${area.name} (家賃相場: ${(area.averageRent/10000).toFixed(1)}万円)\n特徴: ${area.description}`
        ).join('\n\n')

        const systemPrompt = isStudentMode
            ? `あなたは学生や新社会人の初めての一人暮らしをサポートする、親身で頼れる先輩アドバイザーです。
ユーザーが入力したこだわり条件（${featureNames || '特になし'}）を深く考慮し、なぜこの街がユーザーに最適なのかを論理的かつ感情に訴えるように解説してください。

**回答のガイドライン:**
1. **各エリアの解説（150〜200文字程度）**:
   - 必ず「〜なので、あなたの〇〇という条件にぴったりです」という納得感のある理由を含めてください。
   - 「最寄駅から徒歩○分」という情報は無視し、代わりに**「新宿・渋谷・池袋・東京」などの主要ターミナル駅への電車でのアクセス時間の目安**（例：「新宿まで電車で約15分」）を必ず独自の知識で推定して記載してください。
   - 街の雰囲気や具体的な生活シーン（例：「駅前の西友で買い物して...」）が想像できる描写をしてください。

2. **総評・エリア比較（200文字程度）**:
   - 3つのエリアを比較し、「もし〇〇を重視するならA、××ならB」といった比較視点を提供してください。
   - 最後に先輩として背中を押すメッセージを添えてください。`
            : `あなたはプロの不動産コンサルタントです。ユーザーの希望条件（${featureNames || '特になし'}）に基づき、提案されたエリアがなぜ最適なのかを具体的にプレゼンしてください。

**回答のガイドライン:**
1. **各エリアの解説（150〜200文字程度）**:
   - ユーザーの条件と街の特徴を結びつけ、「だからこの街がおすすめです」というロジックを明確にしてください。
   - 「最寄駅から徒歩○分」という情報は無視し、代わりに**「都心主要駅（新宿・渋谷・東京など）への電車での所要時間目安」**（例：「大手町まで直通20分」）を必ず独自の知識で推定して記載してください。
   - 具体的な施設名や通り名などを出し、プロならではの深い知識を披露してください。

2. **総評・エリア比較（200文字程度）**:
   - 3つのエリアの長所・短所を比較し、ライフスタイルごとの選び方をアドバイスしてください。`

        const userPrompt = `以下の3つのエリアが候補として挙がりました。
ガイドラインに従って、詳細なアドバイスを作成してください。
レスポンスはJSON形式で返してください。
キーは "area1_comment", "area2_comment", "area3_comment", "summary" としてください。

候補エリア情報:
${areaInfos}`

        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.7,
                })
                
                const content = completion.choices[0]?.message?.content
                if (content) {
                    aiAdvice = JSON.parse(content)
                }
            } catch (e) {
                console.error('AI Processing Error:', e)
                // エラー時はフォールバック（何もしない＝null）
            }
        } else {
            // モックデータ
            aiAdvice = {
                area1_comment: "家賃相場が手頃で、生活利便施設も整っています。初めての一人暮らしにもおすすめのエリアです。",
                area2_comment: "交通アクセスが良好で、通勤・通学に便利です。周辺環境も落ち着いており、快適に暮らせます。",
                area3_comment: "自然豊かで治安も良く、静かな環境を好む方に最適です。休日は近所の公園でリフレッシュできます。",
                summary: `予算${(rentRange.max/10000).toFixed(1)}万円以内で、ご希望の条件を満たすエリアを厳選しました。いずれも住みやすさには定評があり、ライフスタイルに合わせて比較検討してみてください。`
            }
        }

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
