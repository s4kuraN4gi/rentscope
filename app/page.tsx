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
            <section className="text-center mb-20">
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
