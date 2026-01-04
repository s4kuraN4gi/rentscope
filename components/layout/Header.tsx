'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    {/* ロゴ */}
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                        RentScope
                    </Link>

                    {/* デスクトップメニュー */}
                    <div className="hidden md:flex space-x-8">
                        <Link href="/" className="hover:text-primary-600 transition-colors">
                            ホーム
                        </Link>
                        <Link href="/prefecture" className="hover:text-primary-600 transition-colors">
                            都道府県別
                        </Link>
                        <Link href="/columns" className="hover:text-primary-600 transition-colors">
                            読みもの
                        </Link>
                        <Link href="/about" className="hover:text-primary-600 transition-colors">
                            使い方
                        </Link>
                        <Link href="/contact" className="hover:text-primary-600 transition-colors">
                            お問い合わせ
                        </Link>
                    </div>

                    {/* モバイルメニューボタン */}
                    <button
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="メニュー"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* モバイルメニュー */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 space-y-2">
                        <Link href="/" className="block py-2 hover:text-primary-600 transition-colors">
                            ホーム
                        </Link>
                        <Link href="/prefecture" className="block py-2 hover:text-primary-600 transition-colors">
                            都道府県別
                        </Link>
                        <Link href="/columns" className="block py-2 hover:text-primary-600 transition-colors">
                            読みもの
                        </Link>
                        <Link href="/about" className="block py-2 hover:text-primary-600 transition-colors">
                            使い方
                        </Link>
                        <Link href="/contact" className="block py-2 hover:text-primary-600 transition-colors">
                            お問い合わせ
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    )
}
