import type { Metadata } from 'next'
import Link from 'next/link'
import AdSenseUnit from '@/components/features/AdSenseUnit'
import { getPrefectureDetail, getPrefectures } from '@/lib/data'
import { Area } from '@/types/prefecture'

const FEATURE_LABELS: Record<string, string> = {
    pet_friendly: '🐶 ペット可',
    safe_area: '🛡️ 治安重視',
    child_rearing: '👶 子育て環境',
    access_good: '🚃 アクセス重視',
    cost_performance: '💰 コスパ重視',
    shopping_convenient: '🛍️ 買い物便利',
}

export async function generateStaticParams() {
    const prefectures = getPrefectures()
    return prefectures.map(prefecture => ({
        slug: prefecture.slug,
    }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const data = await getPrefectureDetail(slug)

    if (!data) {
        return {
            title: '都道府県が見つかりません',
        }
    }

    const salaryExample = Math.ceil(data.averageRent / 0.3)

    return {
        title: `${data.name}の家賃相場 | 給料から見る住めるエリア - RentScope`,
        description: `${data.name}の平均家賃は${data.averageRent.toLocaleString()}円。${data.description}`,
        openGraph: {
            title: `${data.name}の家賃相場`,
            description: `給料${salaryExample.toLocaleString()}円で住める${data.name}のエリアを分析`,
        },
    }
}

export default async function PrefectureDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const data = await getPrefectureDetail(slug)

    if (!data) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-red-500">都道府県が見つかりません</h1>
            </div>
        )
    }

    const salaryExample = Math.ceil(data.averageRent / 0.3)

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-4">{data.name}の家賃相場</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{data.description}</p>

            {/* 広告 */}
            <AdSenseUnit slot="4444444444" format="horizontal" className="mb-8" />

            {/* 平均家賃 */}
            <section className="glass rounded-2xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-4">📊 間取り別 平均家賃</h2>
                {data.rentByRoomType ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                            <p className="text-sm text-gray-500 mb-1">ワンルーム/1K</p>
                            <p className="text-xl font-bold text-primary-600">
                                {data.rentByRoomType.oneRoom ? data.rentByRoomType.oneRoom.toLocaleString() + '円' : '-'}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                            <p className="text-sm text-gray-500 mb-1">1LDK/2K</p>
                            <p className="text-xl font-bold text-primary-600">
                                {data.rentByRoomType.oneLDK ? data.rentByRoomType.oneLDK.toLocaleString() + '円' : '-'}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                            <p className="text-sm text-gray-500 mb-1">2LDK/3K</p>
                            <p className="text-xl font-bold text-primary-600">
                                {data.rentByRoomType.twoLDK ? data.rentByRoomType.twoLDK.toLocaleString() + '円' : '-'}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                            <p className="text-sm text-gray-500 mb-1">3LDK/4K~</p>
                            <p className="text-xl font-bold text-primary-600">
                                {data.rentByRoomType.threeLDK ? data.rentByRoomType.threeLDK.toLocaleString() + '円' : '-'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-5xl font-bold text-primary-600 mb-2">
                            {data.averageRent.toLocaleString()}円
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                            全体平均
                        </p>
                    </div>
                )}
                <p className="text-sm text-gray-500 mt-4 text-center">
                    ※月収目安: 家賃の約3.3倍（手取りの30%）
                </p>
            </section>

            {/* エリア別家賃 */}
            <section className="glass rounded-2xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-4">🏘️ エリア別家賃</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {data.areas && data.areas.length > 0 ? (
                        data.areas.map((area: Area, index: number) => (
                            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                                <h3 className="text-xl font-semibold mb-2">{area.name}</h3>
                                <p className="text-3xl font-bold text-primary-600 mb-2">
                                    {area.averageRent.toLocaleString()}円
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{area.description}</p>
                                <div className="mt-4 text-sm">
                                    <p className="text-gray-500">間取り別家賃:</p>
                                    <ul className="mt-2 space-y-1">
                                        <li>ワンルーム/1K: {area.rentByRoomType.oneRoom ? area.rentByRoomType.oneRoom.toLocaleString() + '円' : '-'}</li>
                                        <li>1LDK/2K: {area.rentByRoomType.oneLDK ? area.rentByRoomType.oneLDK.toLocaleString() + '円' : '-'}</li>
                                        <li>2LDK/3K: {area.rentByRoomType.twoLDK ? area.rentByRoomType.twoLDK.toLocaleString() + '円' : '-'}</li>
                                        <li>3LDK/4K~: {area.rentByRoomType.threeLDK ? area.rentByRoomType.threeLDK.toLocaleString() + '円' : '-'}</li>
                                    </ul>

                                </div>
                                {area.features && (
                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                                            const isActive = area.features?.includes(key)
                                            return (
                                                <div 
                                                    key={key} 
                                                    className={`
                                                        flex items-center p-2 rounded-lg border text-sm transition-colors
                                                        ${isActive 
                                                            ? 'bg-primary-50 border-primary-200 text-primary-800 font-medium' 
                                                            : 'bg-gray-50 border-gray-100 text-gray-400'
                                                        }
                                                    `}
                                                >
                                                    <span>{label}</span>
                                                    {isActive && <span className="ml-auto text-primary-600">★</span>}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="col-span-3 text-center text-gray-500">エリアデータがありません</p>
                    )}
                </div>
            </section>

            {/* 広告 */}
            <AdSenseUnit slot="5555555555" format="infeed" className="mb-8" />

            {/* おすすめ給与帯 */}
            <section className="glass rounded-2xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-4">💰 おすすめ給与帯</h2>
                <p className="text-lg mb-4">
                    {data.name}で快適に暮らすには、月収<strong className="text-primary-600 text-2xl">{salaryExample.toLocaleString()}円</strong>以上がおすすめです。
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                    ※家賃を手取りの30%以内に抑える場合の目安です
                </p>
            </section>

            {/* CTA */}
            <section className="text-center bg-gradient-to-r from-primary-600 to-primary-400 text-white rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">あなたの給料で住めるエリアを診断</h2>
                <Link
                    href="/"
                    className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300"
                >
                    今すぐ診断する
                </Link>
            </section>
        </div>
    )
}
