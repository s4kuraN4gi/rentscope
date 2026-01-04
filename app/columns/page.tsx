import Link from 'next/link'
import { articles } from '@/lib/columns'

// export const runtime = 'edge' -- Removed for react-markdown compatibility

export default function ColumnsIndexPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <h1 className="text-4xl font-bold mb-4 text-center">お部屋探しコラム</h1>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
                家賃相場の賢い見方や、失敗しない一人暮らしのコツをお届けします。
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                    <Link 
                        key={article.slug} 
                        href={`/columns/${article.slug}`}
                        className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 block h-full flex flex-col"
                    >
                        <div className="h-48 bg-primary-50 dark:bg-slate-700 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                            {article.thumbnail}
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                            <div className="text-sm text-primary-600 dark:text-primary-400 font-bold mb-2">
                                {article.date}
                            </div>
                            <h2 className="text-xl font-bold mb-3 group-hover:text-primary-600 transition-colors line-clamp-3">
                                {article.title}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">
                                {article.description}
                            </p>
                            <span className="text-primary-600 font-bold text-sm group-hover:underline">
                                続きを読む →
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
