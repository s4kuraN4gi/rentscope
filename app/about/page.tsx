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
                    <ol className="space-y-6">
                        <li className="flex items-start">
                            <span className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">1</span>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">基本情報を入力</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                    <span className="font-bold text-primary-600">通常モード:</span> 月収（手取り）を入力すると、家賃目安を自動計算します。<br />
                                    <span className="font-bold text-indigo-600">学生モード:</span> 予算を直接指定して探すことができます。
                                </p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">2</span>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">エリアと条件を選択</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                    住みたい都道府県を選び、「コスパ重視」「治安重視」などの<span className="font-bold">こだわり条件</span>を選択してください。
                                    AIがあなたの好みに合わせた街を提案します。
                                </p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">3</span>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">AI分析結果を確認</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                    おすすめの街ランキングと、AIコンシェルジュによる詳しい解説が表示されます。
                                    気になった街はSUUMOで実際の物件を探せます。
                                </p>
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
