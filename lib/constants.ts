export const FEATURE_LABELS: Record<string, string> = {
    pet_friendly: '🐶 ペット可',
    safe_area: '🛡️ 治安重視',
    child_rearing: '👶 子育て環境',
    access_good: '🚃 アクセス重視',
    cost_performance: '💰 コスパ重視',
    shopping_convenient: '🛍️ 買い物便利',
}

export const FEATURE_DESCRIPTIONS: Record<string, string> = {
    pet_friendly: 'ペット可物件の割合が高いエリアを優先します',
    safe_area: '犯罪発生率が低く、治安が良いエリアを優先します',
    child_rearing: '公園や学校が多く、子育てしやすい環境を優先します',
    access_good: '複数路線利用可や、主要駅へのアクセスが良いエリアを優先します',
    cost_performance: '家賃相場の割に利便性が高いエリアを優先します',
    shopping_convenient: 'スーパーや商店街が充実しているエリアを優先します',
}

export const PREFECTURE_LABELS = [
    { value: 'tokyo', label: '東京都' },
    { value: 'kanagawa', label: '神奈川県' },
    { value: 'chiba', label: '千葉県' },
    { value: 'saitama', label: '埼玉県' },
    { value: 'aichi', label: '愛知県' },
    { value: 'osaka', label: '大阪府' },
    { value: 'fukuoka', label: '福岡県' },
]
