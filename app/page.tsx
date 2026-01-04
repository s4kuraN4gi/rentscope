import Link from 'next/link'
import RentalPlannerForm from '@/components/features/RentalPlannerForm'
import AdSenseUnit from '@/components/features/AdSenseUnit'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export default function Home() {
    const timestamp = new Date().toLocaleTimeString('ja-JP')

    return (
        <div className="container mx-auto px-4 py-12">
            {/* ヒーローセクション */}
            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-white mb-8 animate-fadeIn">
                    <span className="bg-primary-500 rounded-full px-2 py-0.5 text-xs font-bold">New</span>
                    <span>AIがあなたの理想の街をご提案 v2.0.2 ({timestamp})</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight bg-gradient-to-r from-primary-600 via-indigo-600 to-indigo-400 bg-clip-text text-transparent pb-1">
                    <span className="md:hidden block">
                        <span className="block">給料を入力。</span>
                        <span className="block">住める街がわかる。</span>
                    </span>
                    <span className="hidden md:inline">
                        給料を入力。<br />
                        住める街がわかる。
                    </span>
                </h1>
                
                {/* モバイル用テキスト */}
                <p className="md:hidden text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                    AIがあなたの適正家賃と<br />
                    穴場エリアを即座に診断。<br />
                    失敗しないお部屋探しをサポートします。
                </p>

                {/* デスクトップ用テキスト */}
                <p className="hidden md:block text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-10 leading-relaxed font-medium">
                    AIがあなたの適正家賃と穴場エリアを即座に診断。<br />
                    失敗しないお部屋探しをサポートします。
                </p>

                {/* ヘッダー下広告 */}
                <AdSenseUnit slot="1234567890" format="horizontal" className="max-w-4xl mx-auto mb-8" />
            </div>

            {/* メインコンテンツ（診断フォーム） */}
            <section className="max-w-4xl mx-auto mb-24 relative z-0">
                {/* 背景装飾 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-primary-200/20 via-indigo-200/20 to-pink-200/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
                
                <RentalPlannerForm />
            </section>

            {/* こんな方におすすめ（ジグザグ形式） */}
            <section className="mb-24 px-4 overflow-hidden">
                <div className="max-w-5xl mx-auto space-y-12 md:space-y-20">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">RentScopeはこんな悩みを解決します</h2>
                    
                    {/* Case 1: First-time Renter (Image Left, Text Right) */}
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="w-full md:w-1/2 flex justify-center">
                            <div className="w-48 h-48 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-8xl shadow-inner mb-4 md:mb-0">
                                🎓
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 text-center md:text-left">
                            <h3 className="text-xl md:text-2xl font-bold text-primary-600 mb-4">初めての一人暮らし</h3>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                                「手取り20万で、いくらの家なら<br className="hidden md:inline"/>生活が苦しくない？」
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl">
                                誰も教えてくれない「適正家賃」をAIが算出。<br />
                                手取りの25~30%を目安に、貯金も趣味も諦めない<br />
                                あなたにぴったりのエリアをご提案します。
                            </p>
                        </div>
                    </div>

                    {/* Case 2: Re-evaluation (Text Left, Image Right) */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12">
                        <div className="w-full md:w-1/2 flex justify-center">
                            <div className="w-48 h-48 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-8xl shadow-inner mb-4 md:mb-0">
                                📉
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 text-center md:text-left">
                            <h3 className="text-xl md:text-2xl font-bold text-indigo-600 mb-4">家賃を見直したい</h3>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                                「更新時期が近いけど、<br className="hidden md:inline"/>今の家賃は高すぎる気がする…」
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl">
                                わざわざ生活レベルを落とす必要はありません。<br />
                                電車で10分移動するだけで、家賃相場が<br />
                                1〜2万円下がる「穴場駅」をAIが見つけ出します。
                            </p>
                        </div>
                    </div>

                    {/* Case 3: Student (Image Left, Text Right) */}
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="w-full md:w-1/2 flex justify-center">
                            <div className="w-48 h-48 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center text-8xl shadow-inner mb-4 md:mb-0">
                                ⚖️
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 text-center md:text-left">
                            <h3 className="text-xl md:text-2xl font-bold text-pink-600 mb-4">コスパ重視の学生さん</h3>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                                「バイト代と仕送りだけで、<br className="hidden md:inline"/>安全に住める街はある？」
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl">
                                予算シビアな学生さんこそAIの出番。<br />
                                通学時間と治安の良さを加味した上で、<br />
                                最もコスパの良い「学生に人気の街」を教えます。
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 特徴セクション */}
            <section className="text-center mb-24">
                <h2 className="text-3xl font-bold mb-12">RentScopeの3つの特徴</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon="🤖"
                        title="AI分析 × リアルデータ"
                        description="家賃相場データとAIの推論を組み合わせ、論理的かつ感性豊かな提案を行います"
                    />
                    <FeatureCard
                        icon="💰"
                        title="無理のない家賃設計"
                        description="手取り月収から適正家賃を算出し、生活に余裕が生まれるエリアを厳選します"
                    />
                    <FeatureCard
                        icon="🔍"
                        title="見落としていた街を発見"
                        description="検索条件だけでは出会えなかった、あなたにとっての穴場スポットが見つかります"
                    />
                </div>
            </section>

            {/* コンセプト / 読みものセクション（SEO・AdSense対策） */}
            <section className="mb-24 px-4">
                <div className="max-w-4xl mx-auto space-y-16">
                    
                    {/* Latest Columns (New) */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
                                📚 最新コラム
                            </h2>
                            <Link href="/columns" className="text-primary-600 font-bold hover:underline">
                                もっと見る →
                            </Link>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Column 1 */}
                            <Link href="/columns/rent-vs-salary-rule" className="group block bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <div className="h-32 bg-primary-50 dark:bg-slate-700 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                                    💰
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold mb-2 line-clamp-2 text-sm md:text-base group-hover:text-primary-600 transition-colors">
                                        【徹底解説】家賃は「手取りの3割」が正解？生活レベルを守る黄金ルール
                                    </h3>
                                    <p className="text-xs text-gray-500">2025.01.05</p>
                                </div>
                            </Link>
                            {/* Column 2 */}
                            <Link href="/columns/hidden-gems-2025-kanto" className="group block bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <div className="h-32 bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                                    💎
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold mb-2 line-clamp-2 text-sm md:text-base group-hover:text-primary-600 transition-colors">
                                        【2025年版】関東・関西で注目！家賃が安くて住みやすい「穴場エリア」3選
                                    </h3>
                                    <p className="text-xs text-gray-500">2025.01.05</p>
                                </div>
                            </Link>
                            {/* Column 3 */}
                            <Link href="/columns/student-living-guide" className="group block bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <div className="h-32 bg-pink-50 dark:bg-slate-700 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                                    🎓
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold mb-2 line-clamp-2 text-sm md:text-base group-hover:text-primary-600 transition-colors">
                                        【学生必見】初めての一人暮らしで失敗しない「物件選び」3つのポイント
                                    </h3>
                                    <p className="text-xs text-gray-500">2025.01.05</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Why RentScope? */}
                    <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">
                            なぜ「手取り」から家を探すのか？
                        </h2>
                        <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                            <p>
                                従来の賃貸探しは「このエリアに住みたい」という場所ありきで始まることがほとんどでした。
                                しかし、人気のエリアは当然家賃も高く、知らず知らずのうちに<strong>「家賃貧乏」</strong>に陥ってしまう人が後を絶ちません。
                            </p>
                            <p>
                                RentScopeは、発想を逆転させました。
                                <br/>
                                <strong>「あなたの生活レベルを守れる適正家賃はいくらか？」</strong>
                                <br/>
                                まずここを出発点とし、その予算内で最もQOL（生活の質）が高くなる街をAIが世界中から探し出します。
                            </p>
                            <p>
                                ただ安いだけの街ではありません。治安、アクセスの良さ、そして街の雰囲気。
                                あなたがまだ知らない、けれど住めばきっと好きになる。そんな「穴場」との出会いを提供します。
                            </p>
                        </div>
                    </div>

                    {/* Usage Guide */}
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center text-slate-800 dark:text-slate-100">
                            RentScopeの使い方
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="text-primary-600 font-bold text-xl mb-3">STEP 1</div>
                                <h3 className="font-bold text-lg mb-2">手取り月収を入力</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    まずはあなたの手取り月収を入力してください。AIが生活費をシミュレーションし、無理のない家賃上限を算出します。
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="text-primary-600 font-bold text-xl mb-3">STEP 2</div>
                                <h3 className="font-bold text-lg mb-2">条件をリクエスト</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    「30分以内で通勤したい」「治安重視」「おしゃれなカフェがある」など、あなたのわがままをAIに伝えてください。
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="text-primary-600 font-bold text-xl mb-3">STEP 3</div>
                                <h3 className="font-bold text-lg mb-2">穴場エリアを発見</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    AIが条件に合致する「コスパ最強」の街を提案。なぜ選ばれたのかという理由とともに、あなたにお届けします。
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="bg-slate-50 dark:bg-slate-800/20 p-8 md:p-12 rounded-3xl">
                        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-slate-800 dark:text-slate-100">
                            よくある質問
                        </h2>
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                                <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">Q. 利用にお金はかかりますか？</h3>
                                <p className="text-slate-600 dark:text-slate-300">
                                    A. いいえ、RentScopeは完全無料でご利用いただけます。何度でも診断を試して、納得のいくお部屋探しにお役立てください。
                                </p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                                <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">Q. 提案された家賃は管理費込みですか？</h3>
                                <p className="text-slate-600 dark:text-slate-300">
                                    A. はい、基本的に管理費・共益費を含んだ「支払い総額」の目安として提示しています。実際の物件ごとの詳細な金額は、不動産サイト等でご確認ください。
                                </p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                                <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">Q. 対応しているエリアはどこですか？</h3>
                                <p className="text-slate-600 dark:text-slate-300">
                                    A. 現在は東京・大阪・神奈川・埼玉・千葉などの主要都市圏を中心にデータを強化していますが、日本全国のデータに基づいた推論が可能です。
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* フッター上広告 */}
            <div className="mt-16">
                <AdSenseUnit
                    slot="0987654321"
                    format="horizontal"
                    className="max-w-4xl mx-auto"
                />
            </div>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
    return (
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="text-6xl mb-6 bg-gray-50 dark:bg-gray-700 w-24 h-24 mx-auto rounded-full flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
        </div>
    )
}
