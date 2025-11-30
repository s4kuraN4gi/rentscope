interface AIAnalysisProps {
    analysis: string
    tips: string[]
}

export default function AIAnalysis({ analysis, tips }: AIAnalysisProps) {
    return (
        <div className="space-y-6">
            {/* 分析コメント */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
                <p className="text-lg leading-relaxed">{analysis}</p>
            </div>

            {/* ヒント */}
            <div>
                <h3 className="text-xl font-semibold mb-4">💡 アドバイス</h3>
                <ul className="space-y-3">
                    {tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                            <span className="text-primary-600 mr-2 text-xl">•</span>
                            <span className="flex-1">{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
