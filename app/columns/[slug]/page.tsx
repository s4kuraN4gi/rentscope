import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { getArticle, articles } from '@/lib/columns'
import AdSenseUnit from '@/components/features/AdSenseUnit'
import type { Metadata } from 'next'

// export const runtime = 'edge' -- Removed for react-markdown compatibility

// export async function generateStaticParams() {
//     return articles.map((article) => ({
//         slug: article.slug,
//     }))
// }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const article = getArticle(slug)

    if (!article) {
        return {
            title: '記事が見つかりません',
        }
    }

    return {
        title: `${article.title} | RentScope`,
        description: article.description,
        openGraph: {
            title: article.title,
            description: article.description,
            type: 'article',
            publishedTime: article.date,
        },
    }
}

export default async function ColumnDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const article = getArticle(slug)

    if (!article) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            {/* Header */}
            <header className="mb-12 text-center">
                <div className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-1 rounded-full text-sm font-bold mb-6">
                    {article.date}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-8">
                    {article.title}
                </h1>
                <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-8xl mb-8">
                    {article.thumbnail}
                </div>
            </header>

            {/* Content */}
            <article className="prose prose-lg dark:prose-invert max-w-none mb-16">
                <ReactMarkdown>{article.content}</ReactMarkdown>
            </article>

            {/* AdSense Middle */}
            <div className="my-12">
                <AdSenseUnit slot="8888888888" format="auto" />
            </div>

            {/* Footer / CTA */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                <h3 className="text-xl font-bold mb-4">あなたにぴったりの街を探してみませんか？</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    RentScopeなら、給料を入力するだけで<br />
                    無理なく住める「穴場エリア」がすぐに見つかります。
                </p>
                <Link 
                    href="/" 
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg hover:shadow-xl"
                >
                    今すぐ診断する（無料）
                </Link>
            </div>

            <div className="mt-12 text-center">
                <Link href="/columns" className="text-slate-500 hover:text-primary-600 font-bold">
                    ← コラム一覧に戻る
                </Link>
            </div>
        </div>
    )
}
