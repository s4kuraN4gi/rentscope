'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Footer() {
    const [currentYear, setCurrentYear] = useState<number | null>(null)

    useEffect(() => {
        setCurrentYear(new Date().getFullYear())
    }, [])

    return (
        <footer className="bg-gray-100 dark:bg-gray-900 mt-16">
            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* サイト情報 */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                            RentScope
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            給料から最適な家賃とエリアを分析するWebアプリ
                        </p>
                    </div>

                    {/* リンク */}
                    <div>
                        <h4 className="font-semibold mb-4">リンク</h4>
                        <ul className="grid grid-cols-2 gap-2">
                            <li>
                                <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
                                    ホーム
                                </Link>
                            </li>
                            <li>
                                <Link href="/prefecture" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
                                    都道府県別
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
                                    使い方
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
                                    利用規約
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
                                    プライバシー
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
                                    お問い合わせ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* SNS */}
                    <div>
                        <h4 className="font-semibold mb-4">シェア</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            気に入ったらSNSでシェアしてください!
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-300 dark:border-gray-700 mt-8 pt-8 text-center text-gray-600 dark:text-gray-300">
                    <p>&copy; {currentYear || new Date().getFullYear()} RentScope. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
