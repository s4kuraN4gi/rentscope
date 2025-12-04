import SalaryInput from '@/components/features/SalaryInput'
import AdSenseUnit from '@/components/features/AdSenseUnit'

export default function Home() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* ヒーローセクション */}
            <section className="text-center mb-12 animate-fadeIn">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                    あなたの給料で住める家賃は?
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                    給料を入力するだけで、最適な家賃帯とおすすめエリアをAIが分析します
                </p>

                {/* ヘッダー下広告 */}
                <AdSenseUnit slot="1234567890" format="horizontal" className="max-w-4xl mx-auto" />
            </section>

            {/* メインコンテンツ */}
            <section className="max-w-2xl mx-auto">
                <div className="glass rounded-2xl p-8 shadow-2xl">
                    <SalaryInput />
                </div>
            </section>

            {/* 特徴セクション */}
            <section className="mt-16 grid md:grid-cols-3 gap-8">
                <FeatureCard
                    icon="💰"
                    title="最適な家賃帯を算出"
                    description="あなたの給料から、無理のない家賃範囲を計算します"
                />
                <FeatureCard
                    icon="🗺️"
                    title="おすすめエリア提案"
                    description="予算内で住めるエリアを地図で可視化します"
                />
                <FeatureCard
                    icon="📈"
                    title="収入アップ目標"
                    description="理想のエリアに住むために必要な収入を提示します"
                />
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
        <div className="glass rounded-xl p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </div>
    )
}
