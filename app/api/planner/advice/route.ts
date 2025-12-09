import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { FEATURE_LABELS } from '@/lib/constants'
import type { AffordableArea } from '@/types/rent'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { topAreas, features = [], isStudent = false } = body
        
        const isStudentMode = String(isStudent) === 'true' || isStudent === true

        // AI分析（GPT-3.5-turbo / GPT-4o-mini）
        let aiAdvice = null
        
        // プロンプト構築
        const featureNames = features.map((f: string) => FEATURE_LABELS[f]).join('、')
        const areaInfos = topAreas.map((area: AffordableArea, index: number) => 
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
            // rentRange.maxがここでは不明だが、メッセージには影響しない範囲で作成
            aiAdvice = {
                area1_comment: "家賃相場が手頃で、生活利便施設も整っています。初めての一人暮らしにもおすすめのエリアです。",
                area2_comment: "交通アクセスが良好で、通勤・通学に便利です。周辺環境も落ち着いており、快適に暮らせます。",
                area3_comment: "自然豊かで治安も良く、静かな環境を好む方に最適です。休日は近所の公園でリフレッシュできます。",
                summary: `ご希望の条件を満たすエリアを厳選しました。いずれも住みやすさには定評があり、ライフスタイルに合わせて比較検討してみてください。`
            }
        }

        return NextResponse.json({ aiAdvice })

    } catch (error) {
        console.error('Planner Advice API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
