import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'



interface OpenAIRequest {
    salary?: number
    budget?: number
    isStudent?: boolean
    recommendedRent: number
    areas: string[]
}

export async function POST(request: NextRequest) {
    try {
        const body: OpenAIRequest = await request.json()
        const { salary, budget, isStudent, recommendedRent, areas } = body

        // APIキーが設定されていない場合はモックレスポンス
        if (!process.env.OPENAI_API_KEY) {
            const incomeInfo = isStudent ? `予算${budget?.toLocaleString()}円` : `月収${salary?.toLocaleString()}円`
            return NextResponse.json({
                analysis: `${incomeInfo}の場合、推奨家賃は${recommendedRent.toLocaleString()}円です。${areas.join('、')}などのエリアがおすすめです。`,
                tips: [
                    '固定費を見直して貯蓄を増やしましょう',
                    '副業やスキルアップで収入アップを目指しましょう',
                    '家賃交渉で月々の支出を抑えることも検討してください',
                ],
            })
        }

        const incomeStr = isStudent ? `予算: ${budget?.toLocaleString()}円` : `月収: ${salary?.toLocaleString()}円`

        const prompt = `
あなたは賃貸住宅のアドバイザーです。以下の情報をもとに、ユーザーにアドバイスをしてください。

- ${incomeStr}
- 推奨家賃: ${recommendedRent.toLocaleString()}円
- おすすめエリア: ${areas.join('、')}

以下の形式で回答してください:
1. 現在の収入と家賃のバランスについての分析(2-3文)
2. おすすめエリアの特徴(2-3文)
3. 節約・収入アップのヒント(3つ、箇条書き)
`

        const completion = await new OpenAI({ apiKey: process.env.OPENAI_API_KEY }).chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'あなたは親切で知識豊富な賃貸住宅アドバイザーです。',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            max_tokens: 500,
            temperature: 0.7,
        })

        const responseText = completion.choices[0]?.message?.content || ''

        // レスポンスをパース(簡易的な実装)
        const lines = responseText.split('\n').filter(line => line.trim())
        const analysis = lines.slice(0, 2).join(' ')
        const tips = lines.slice(2).filter(line => line.includes('-') || line.includes('•')).slice(0, 3)

        return NextResponse.json({
            analysis,
            tips: tips.length > 0 ? tips : [
                '固定費を見直して貯蓄を増やしましょう',
                '副業やスキルアップで収入アップを目指しましょう',
                '家賃交渉で月々の支出を抑えることも検討してください',
            ],
        })
    } catch (error) {
        console.error('OpenAI API error:', error)

        // エラー時はフォールバック
        return NextResponse.json({
            analysis: 'AI分析は現在利用できません。基本的な分析結果をご確認ください。',
            tips: [
                '固定費を見直して貯蓄を増やしましょう',
                '副業やスキルアップで収入アップを目指しましょう',
            ],
        })
    }
}
