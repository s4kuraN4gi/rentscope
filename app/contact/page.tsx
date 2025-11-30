import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'お問い合わせ | RentScope',
    description: 'RentScopeへのお問い合わせはこちらからお願いします。',
}

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">お問い合わせ</h1>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                <p className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    当サイトに関するお問い合わせ、ご意見、ご要望は、以下のGoogleフォームよりお願いいたします。<br />
                    内容を確認次第、担当者よりご連絡させていただきます。
                </p>

                <div className="text-center py-8">
                    <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLScRen9oyAi6C4H3PjiagKP00XZ23SnecJ823aN4CBy1D3K4fw/viewform?usp=header"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        お問い合わせフォームを開く
                    </a>
                </div>

                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-bold mb-2">⚠️ ご注意</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>お問い合わせの内容によっては、回答にお時間をいただく場合や、回答できない場合がございます。</li>
                        <li>営業メールや勧誘など、当サイトと関係のない内容については返信いたしかねます。</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
