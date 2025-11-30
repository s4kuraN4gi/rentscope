// 給与関連の型定義
export interface SalaryInput {
    salary: number
    familySize?: number
    location?: string
}

export interface RecommendedRent {
    min: number
    max: number
    ideal: number
}

export interface IncomeGap {
    targetArea: string
    requiredIncome: number
    gap: number
}
