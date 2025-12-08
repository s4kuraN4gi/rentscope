import { MetadataRoute } from 'next'
import prefecturesData from '@/data/prefectures.json'

export const runtime = 'edge'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://rentscope.jp'

    // 静的ページ
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/prefecture`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
    ]

    // 都道府県別ページ
    const prefecturePages: MetadataRoute.Sitemap = prefecturesData.map((prefecture) => ({
        url: `${baseUrl}/prefecture/${prefecture.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [...staticPages, ...prefecturePages]
}
