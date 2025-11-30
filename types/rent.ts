// 家賃関連の型定義
export interface AffordableArea {
    name: string
    averageRent: number
    distance: string
    prefecture: string
    latitude: number
    longitude: number
}

export interface RentData {
    prefecture: string
    city: string
    averageRent: number
    min: number
    max: number
}
