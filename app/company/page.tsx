import Link from 'next/link'

export default function CompanyPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-slate-100">運営者情報</h1>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100 dark:border-slate-700">
                <table className="w-full text-left border-collapse">
                    <tbody>
                        <tr className="border-b border-slate-100 dark:border-slate-700">
                            <th className="py-4 font-bold text-slate-600 dark:text-slate-400 w-1/3">サイト名</th>
                            <td className="py-4 text-slate-800 dark:text-slate-200">RentScope (レントスコープ)</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-700">
                            <th className="py-4 font-bold text-slate-600 dark:text-slate-400">運営者</th>
                            <td className="py-4 text-slate-800 dark:text-slate-200">RentScope Lab</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-700">
                            <th className="py-4 font-bold text-slate-600 dark:text-slate-400">URL</th>
                            <td className="py-4 text-slate-800 dark:text-slate-200">https://rentscope.jp/</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-700">
                            <th className="py-4 font-bold text-slate-600 dark:text-slate-400">ミッション</th>
                            <td className="py-4 text-slate-800 dark:text-slate-200">
                                「給料から逆算する家賃選び」を通じて、無理のない豊かな生活をサポートする。
                                AIの力を活用し、感覚ではなくデータに基づいた新しい部屋探しのスタンダードを提案します。
                            </td>
                        </tr>
                        <tr>
                            <th className="py-4 font-bold text-slate-600 dark:text-slate-400">お問い合わせ</th>
                            <td className="py-4 text-slate-800 dark:text-slate-200">
                                <Link 
                                    href="/contact" 
                                    className="text-primary-600 hover:text-primary-700 underline"
                                >
                                    お問い合わせフォーム
                                </Link>
                                <span className="mx-2">よりご連絡ください。</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-8 text-center">
                <Link 
                    href="/" 
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm"
                >
                    ← トップページに戻る
                </Link>
            </div>
        </div>
    )
}
