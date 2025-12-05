import { Prefecture } from '@/types/prefecture';
import prefectures from '@/data/prefectures.json';

// 軽量版の都道府県リストを返す
export function getPrefectures(): Prefecture[] {
  return prefectures as Prefecture[];
}

// 特定の都道府県の詳細データを取得する
export async function getPrefectureDetail(slug: string): Promise<Prefecture | null> {
  try {
    // 動的にインポート
    const detail = await import(`@/data/details/${slug}.json`);
    return detail.default as Prefecture;
  } catch (error) {
    console.error(`Failed to load data for ${slug}:`, error);
    return null;
  }
}

// 特定の都道府県の基本情報のみ取得（詳細データなし）
export function getPrefectureBasicInfo(slug: string): Prefecture | undefined {
  return (prefectures as Prefecture[]).find(p => p.slug === slug);
}
