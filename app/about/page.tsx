export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-center">RentScopeの使い方</h1>

            <div className="space-y-8">
                {/* サービス概要 */}
                <section className="glass rounded-2xl p-8">
                    <h2 className="text-2xl font-bold mb-4">📱 サービス概要</h2>
                    <p className="text-lg leading-relaxed">
                        RentScopeは、あなたの給料から最適な家賃帯とおすすめエリアをAIが分析するWebアプリです。
                        引っ越しを考えている方、一人暮らしを始める方、家賃の見直しをしたい方に最適です。
                    </p>
                </section>

                {/* 使い方 */}
                <section className="glass rounded-2xl p-8">
                    <h2 className="text-2xl font-bold mb-4">🔍 使い方</h2>
                    <ol className="space-y-4">
                        <li className="flex items-start">
                            <span className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">1</span>
                            <div>
                                <h3 className="font-semibold text-lg">月収を入力</h3>
                                <p className="text-gray-600 dark:text-gray-300">手取り額を入力してください</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">2</span>
                            <div>
                                <h3 className="font-semibold text-lg">家族構成を選択</h3>
                                <p className="text-gray-600 dark:text-gray-300">一人暮らしか家族暮らしかを選択</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">3</span>
                            <div>
                                <h3 className="font-semibold text-lg">分析結果を確認</h3>
                                <p className="text-gray-600 dark:text-gray-300">推奨家賃、住めるエリア、収入アップ目標を確認</p>
                            </div>
                        </li>
                    </ol>
                </section>

                {/* 家賃の目安 */}
                <section className="glass rounded-2xl p-8">
                    <h2 className="text-2xl font-bold mb-4">💰 家賃の目安について</h2>
                    <p className="mb-4">
                        一般的に、家賃は手取り月収の<strong className="text-primary-600">25〜30%</strong>が適正と言われています。
                    </p>
                    <div className="bg-primary-50 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="font-semibold mb-2">例:</p>
                        <ul className="space-y-1 text-sm">
                            <li>• 月収20万円 → 家賃5〜6万円</li>
                            <li>• 月収25万円 → 家賃6.2〜7.5万円</li>
                            <li>• 月収30万円 → 家賃7.5〜9万円</li>
                        </ul>
                    </div>
                </section>

                {/* よくある質問 */}
                <section className="glass rounded-2xl p-8">
                    <h2 className="text-2xl font-bold mb-4">❓ よくある質問</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Q. 手取りと額面、どちらを入力すればいいですか?</h3>
                            <p className="text-gray-600 dark:text-gray-300">A. 手取り額(実際に振り込まれる金額)を入力してください。</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Q. データはどこから取得していますか?</h3>
                            <p className="text-gray-600 dark:text-gray-300">A. 公開されている不動産データと統計情報を使用しています。</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Q. 個人情報は保存されますか?</h3>
                            <p className="text-gray-600 dark:text-gray-300">A. いいえ、入力された情報は保存されません。</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
