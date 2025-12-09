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
                        <span className="block">手取り月収から、</span>
                        <span className="block">あなたが「無理なく</span>
                        <span className="block">住める街」を</span>
                        <span className="block">AIが即座に診断。</span>
                    </span>
                    <span className="hidden md:inline">
                        手取り月収から、<br />
                        あなたが「無理なく住める街」を<br />
                        AIが即座に診断。
                    </span>
                </h1>
                
                {/* モバイル用テキスト */}
                <p className="md:hidden text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                    6万件の家賃データから、<br />
                    コスパの良い穴場エリアを<br />
                    導き出します。<br />
                    もう、家賃で悩みたくないあなたへ。
                </p>

                {/* デスクトップ用テキスト */}
                <p className="hidden md:block text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-10 leading-relaxed font-medium">
                    6万件の家賃データから、コスパの良い穴場エリアを導き出します。<br />
                    もう、家賃で悩みたくないあなたへ。
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

            {/* こんな方におすすめ */}
            <section className="mb-20 px-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 md:p-12 max-w-5xl mx-auto border border-slate-100 dark:border-slate-700">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">RentScopeはこんな方におすすめ</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                            <div className="text-4xl mb-4">🎓</div>
                            <h3 className="font-bold mb-2">初めての一人暮らし</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                「手取り20万でいくらの家に住める？」<br />
                                誰も教えてくれない適正家賃がわかります。
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                            <div className="text-4xl mb-4">📉</div>
                            <h3 className="font-bold mb-2">家賃を見直したい</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                今の家賃が高すぎると感じていませんか？<br />
                                生活レベルを落とさずに安く住める街見つかります。
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                            <div className="text-4xl mb-4">⚖️</div>
                            <h3 className="font-bold mb-2">コスパ重視の学生さん</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                仕送りやバイト代の範囲内で、<br />
                                学校に通いやすく治安の良いエリアを提案します。
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
