import Link from 'next/link'

const prefectures = [
    { id: 1, name: '東京都', slug: 'tokyo', region: '関東', averageRent: 85000 },
    { id: 2, name: '大阪府', slug: 'osaka', region: '関西', averageRent: 65000 },
    { id: 3, name: '神奈川県', slug: 'kanagawa', region: '関東', averageRent: 75000 },
    { id: 4, name: '愛知県', slug: 'aichi', region: '中部', averageRent: 60000 },
    { id: 5, name: '福岡県', slug: 'fukuoka', region: '九州', averageRent: 55000 },
    // 他の都道府県は後で追加
]

export default function PrefecturePage() {
    const regions = Array.from(new Set(prefectures.map(p => p.region)))

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 text-center">都道府県別 家賃相場</h1>

            <div className="space-y-8">
                {regions.map(region => (
                    <section key={region} className="glass rounded-2xl p-8">
                        <h2 className="text-2xl font-bold mb-4">{region}地方</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            {prefectures
                                .filter(p => p.region === region)
                                .map(prefecture => (
                                    <Link
                                        key={prefecture.id}
                                        href={`/prefecture/${prefecture.slug}`}
                                        className="bg-white dark:bg-gray-800 p-6 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        <h3 className="text-xl font-semibold mb-2">{prefecture.name}</h3>
                                        <p className="text-primary-600 font-bold text-2xl">
                                            {prefecture.averageRent.toLocaleString()}円
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">平均家賃</p>
                                    </Link>
                                ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    )
}
