import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'プライバシーポリシー | RentScope',
    description: 'RentScopeのプライバシーポリシーページです。個人情報の取り扱い、Cookieの使用、広告配信、アクセス解析ツールについて説明しています。',
}

export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>

            <div className="space-y-8 text-gray-700 dark:text-gray-300">
                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">1. 個人情報の利用目的</h2>
                    <p className="leading-relaxed">
                        当サイトでは、お問い合わせや記事へのコメントの際、名前やメールアドレス等の個人情報を入力いただく場合がございます。
                        取得した個人情報は、お問い合わせに対する回答や必要な情報を電子メールなどでご連絡する場合に利用させていただくものであり、これらの目的以外では利用いたしません。
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">2. 広告の配信について</h2>
                    <p className="leading-relaxed mb-4">
                        当サイトでは、第三者配信の広告サービス（Google AdSense）を利用しており、ユーザーの興味に応じた商品やサービスの広告を表示するため、クッキー（Cookie）を使用しております。
                        クッキーを使用することで当サイトはお客様のコンピュータを識別できるようになりますが、お客様個人を特定できるものではありません。
                    </p>
                    <p className="leading-relaxed">
                        Cookieを無効にする方法やGoogleアドセンスに関する詳細は
                        <a 
                            href="https://policies.google.com/technologies/ads?hl=ja" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline"
                        >
                            「Googleポリシーと規約」
                        </a>
                        をご確認ください。
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">3. アクセス解析ツールについて</h2>
                    <p className="leading-relaxed">
                        当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。
                        このGoogleアナリティクスはトラフィックデータの収集のためにクッキー（Cookie）を使用しております。
                        トラフィックデータは匿名で収集されており、個人を特定するものではありません。
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">4. 免責事項</h2>
                    <p className="leading-relaxed mb-4">
                        当サイトからのリンクやバナーなどで移動したサイトで提供される情報、サービス等について一切の責任を負いません。
                    </p>
                    <p className="leading-relaxed">
                        また当サイトのコンテンツ・情報について、できる限り正確な情報を提供するように努めておりますが、正確性や安全性を保証するものではありません。情報が古くなっていることもございます。
                        当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">5. 著作権について</h2>
                    <p className="leading-relaxed">
                        当サイトで掲載している文章や画像などにつきましては、無断転載することを禁止します。
                        当サイトは著作権や肖像権の侵害を目的としたものではありません。著作権や肖像権に関して問題がございましたら、お問い合わせフォームよりご連絡ください。迅速に対応いたします。
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">6. お問い合わせ</h2>
                    <p className="leading-relaxed">
                        本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。<br />
                        <a 
                            href="/contact" 
                            className="text-primary-600 hover:underline font-bold"
                        >
                            お問い合わせページへ
                        </a>
                    </p>
                </section>

                <section className="pt-8 border-t border-gray-200 dark:border-gray-700">
                    <p>制定日：2025年11月30日</p>
                    <p>運営者：RentScope運営事務局</p>
                </section>
            </div>
        </div>
    )
}
