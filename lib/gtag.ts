// Google Analytics イベント送信用のユーティリティ関数

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// ページビューを送信
export const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_MEASUREMENT_ID as string, {
      page_path: url,
    })
  }
}

// カスタムイベントを送信
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// AI分析クリックイベント
export const trackAIAnalysisClick = (salary: number) => {
  event({
    action: 'ai_click',
    category: 'AI Analysis',
    label: `Salary: ${salary}`,
    value: salary,
  })
}

// エリア選択イベント
export const trackAreaSelection = (areaName: string, rent: number) => {
  event({
    action: 'area_select',
    category: 'Area Selection',
    label: areaName,
    value: rent,
  })
}

// 型定義を拡張
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}
