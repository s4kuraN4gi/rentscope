export interface RentByRoomType {
    oneRoom: number | null
    oneLDK: number | null
    twoLDK: number | null
    threeLDK: number | null
}

export interface Review {
    age: number
    gender: string
    comment: string
    rating: number
}

export interface Area {
    name: string
    averageRent: number
    minRent: number
    maxRent: number
    latitude: number
    longitude: number
    nearestStation: string
    distanceToStation: number
    description: string
    features: string[]
    images?: string[]
    reviews?: Review[]
    rentByRoomType: RentByRoomType
}

// 都道府県関連の型定義
export interface Prefecture {
    id: number
    name: string
    slug: string
    region: string
    averageRent: number
    latitude: number
    longitude: number
    population: number
    description: string
    areas: Area[]
    rentByRoomType: RentByRoomType
}
