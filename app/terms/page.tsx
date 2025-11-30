import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: '利用規約 | RentScope',
    description: 'RentScopeの利用規約ページです。当サイトを利用する上でのルールを定めています。',
}

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">利用規約</h1>

            <div className="space-y-8 text-gray-700 dark:text-gray-300">
                <section>
                    <p className="leading-relaxed">
                        この利用規約（以下，「本規約」といいます。）は，RentScope運営事務局（以下，「当事務局」といいます。）がこのウェブサイト上で提供するサービス（以下，「本サービス」といいます。）の利用条件を定めるものです。
                        登録ユーザーの皆さま（以下，「ユーザー」といいます。）には，本規約に従って，本サービスをご利用いただきます。
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">第1条（適用）</h2>
                    <p className="leading-relaxed">
                        本規約は，ユーザーと当事務局との間の本サービスの利用に関わる一切の関係に適用されるものとします。
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">第2条（禁止事項）</h2>
                    <p className="leading-relaxed mb-4">
                        ユーザーは，本サービスの利用にあたり，以下の行為をしてはなりません。
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>法令または公序良俗に違反する行為</li>
                        <li>犯罪行為に関連する行為</li>
                        <li>本サービスの内容等，本サービスに含まれる著作権，商標権ほか知的財産権を侵害する行為</li>
                        <li>当事務局，ほかのユーザー，またはその他第三者のサーバーまたはネットワークの機能を破壊したり，妨害したりする行為</li>
                        <li>本サービスによって得られた情報を商業的に利用する行為</li>
                        <li>当事務局のサービスの運営を妨害するおそれのある行為</li>
                        <li>不正アクセスをし，またはこれを試みる行為</li>
                        <li>他のユーザーまたは第三者に不利益，損害，不快感を与える行為</li>
                        <li>その他，当事務局が不適切と判断する行為</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">第3条（本サービスの提供の停止等）</h2>
                    <p className="leading-relaxed">
                        当事務局は，以下のいずれかの事由があると判断した場合，ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
                        これに起因してユーザーまたは第三者が被った損害について，当事務局は一切の責任を負わないものとします。
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">第4条（免責事項）</h2>
                    <p className="leading-relaxed">
                        当事務局は，本サービスに事実上または法律上の瑕疵（安全性，信頼性，正確性，完全性，有効性，特定の目的への適合性，セキュリティなどに関する欠陥，エラーやバグ，権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
                        当事務局は，本サービスに関して，ユーザーと他のユーザーまたは第三者との間において生じた取引，連絡または紛争等について一切責任を負いません。
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">第5条（サービス内容の変更等）</h2>
                    <p className="leading-relaxed">
                        当事務局は，ユーザーに通知することなく，本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし，これによってユーザーに生じた損害について一切の責任を負いません。
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">第6条（利用規約の変更）</h2>
                    <p className="leading-relaxed">
                        当事務局は，必要と判断した場合には，ユーザーに通知することなくいつでも本規約を変更することができるものとします。
                        なお，本規約の変更後，本サービスの利用を開始した場合には，当該ユーザーは変更後の規約に同意したものとみなします。
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
