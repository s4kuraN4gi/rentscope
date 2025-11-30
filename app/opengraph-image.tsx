import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'RentScope - 給料から住めるエリアをAI分析'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #2563eb, #60a5fa)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 40,
                    }}
                >
                    {/* 家アイコン */}
                    <svg
                        width="120"
                        height="120"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                </div>
                <div
                    style={{
                        fontSize: 100,
                        fontWeight: 'bold',
                        marginBottom: 20,
                        letterSpacing: '-0.05em',
                    }}
                >
                    RentScope
                </div>
                <div
                    style={{
                        fontSize: 40,
                        fontWeight: 'normal',
                        opacity: 0.9,
                    }}
                >
                    給料から住めるエリアをAI分析
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
