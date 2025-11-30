'use client'

import { useState, useEffect } from 'react'

interface ShareButtonsProps {
    url?: string
    title?: string
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
    const [shareUrl, setShareUrl] = useState('')
    const [shareTitle, setShareTitle] = useState('')
    const [isCopied, setIsCopied] = useState(false)

    useEffect(() => {
        setShareUrl(url || window.location.href)
        setShareTitle(title || document.title)
    }, [url, title])

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(shareTitle)

    return (
        <div className="flex flex-wrap gap-3 justify-center">
            {/* X (Twitter) */}
            <a
                href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="font-bold text-sm">Post</span>
            </a>

            {/* Facebook */}
            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2 rounded-full hover:bg-[#166fe5] transition-colors"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.66-2.797 3.54v1.212h4.195l-1.549 3.667h-2.646v7.98H9.102L9.101 23.691z" />
                </svg>
                <span className="font-bold text-sm">Share</span>
            </a>

            {/* LINE */}
            <a
                href={`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#06C755] text-white px-4 py-2 rounded-full hover:bg-[#05b34c] transition-colors"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.5c-5.52 0-10 3.58-10 8 0 2.5 1.44 4.75 3.82 6.18-.17.62-.61 2.23-.71 2.61-.06.24-.26.93.81.51 4.51-1.74 5.09-1.95 5.54-1.92.18.01.36.02.54.02 5.52 0 10-3.58 10-8s-4.48-8-10-8zm0 13c-4.41 0-8-2.69-8-6s3.59-6 8-6 8 2.69 8 6-3.59 6-8 6z" />
                </svg>
                <span className="font-bold text-sm">LINE</span>
            </a>

            {/* Copy Link */}
            <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                    isCopied
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span className="font-bold text-sm">{isCopied ? 'Copied!' : 'Copy'}</span>
            </button>
        </div>
    )
}
