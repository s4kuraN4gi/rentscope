'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FEATURE_LABELS, FEATURE_DESCRIPTIONS, PREFECTURE_LABELS } from '@/lib/constants'

// ステップの定義
const STEPS = [
    { id: 1, title: '予算を決める', icon: '💰' },
    { id: 2, title: 'エリアを選ぶ', icon: '🗺️' },
    { id: 3, title: '条件を選ぶ', icon: '✨' },
]

export default function RentalPlannerForm() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    
    // フォームデータ
    const [salary, setSalary] = useState('')
    const [familySize, setFamilySize] = useState('1')
    const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([])
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
    const [isStudentMode, setIsStudentMode] = useState(false)
    const [budget, setBudget] = useState(60000)
    const [isLoading, setIsLoading] = useState(false)

    // 推奨家賃の計算（手取りの20-30%）
    const recommendedRent = useMemo(() => {
        if (!salary || Number(salary) <= 0) return null
        const val = Number(salary)
        return {
            min: Math.floor(val * 0.2),
            max: Math.floor(val * 0.3)
        }
    }, [salary])

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(c => c + 1)
    }

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(c => c - 1)
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        
        // クエリパラメータの構築
        const params = new URLSearchParams({
            salary: salary,
            familySize: familySize,
            prefectures: selectedPrefectures.join(','),
            features: selectedFeatures.join(','),
            isStudent: isStudentMode.toString(),
            budget: budget.toString(),
        })

        // 結果ページへ遷移（少し遅延させて読み込み感を出す演出も可）
        await new Promise(resolve => setTimeout(resolve, 800))
        router.push(`/planner/result?${params.toString()}`)
    }

    // Step 1: 予算と家族構成
    const renderStep1 = () => (
        <div className="space-y-6 animate-fadeIn">
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all border-indigo-100 bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-900/20 hover:border-indigo-200">
                <div className="relative flex items-center">
                    <input 
                        type="checkbox" 
                        checked={isStudentMode} 
                        onChange={(e) => setIsStudentMode(e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                </div>
                <div className="flex-1">
                    <span className="font-bold text-gray-900 dark:text-white block">
                        学生・新社会人として一人暮らしをする
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mt-0.5">
                        年収ではなく、毎月の家賃予算から探せます
                    </span>
                </div>
            </label>

            {isStudentMode ? (
                // 学生モード: 家賃予算入力
                <div className="bg-white dark:bg-gray-800 rounded-xl">
                    <label className="block text-lg font-bold mb-4">
                        毎月の家賃予算はいくらですか？
                    </label>
                    <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                            {(budget / 10000).toFixed(1)}
                        </span>
                        <span className="text-xl font-bold text-gray-500">万円</span>
                    </div>
                    <input 
                        type="range" 
                        min="30000" 
                        max="200000" 
                        step="1000" 
                        value={budget} 
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-600 hover:accent-primary-700"
                    />
                    <div className="flex justify-between text-xs font-bold text-gray-400 mt-3 px-1">
                        <span>3万円</span>
                        <span>20万円</span>
                    </div>
                    <p className="text-sm text-center text-gray-500 mt-4 bg-gray-50 dark:bg-gray-900/50 py-2 rounded-lg">
                        💡 相場より少し高めに設定すると選択肢が広がります
                    </p>
                </div>
            ) : (
                // 通常モード: 年収入力
                <div>
                    <label className="block text-lg font-bold mb-2">
                        手取り月収を入力してください
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            placeholder="例: 250000"
                            className="w-full text-2xl p-4 pl-6 pr-12 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0 transition-colors bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                            min="0"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">円</span>
                    </div>
                </div>
            )}

            {!isStudentMode && recommendedRent && (
                <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-xl border border-primary-100 dark:border-primary-800">
                    <p className="text-sm text-primary-600 dark:text-primary-300 font-bold mb-1">
                        あなたにおすすめの家賃目安
                    </p>
                    <p className="text-2xl font-bold text-primary-700 dark:text-primary-200">
                        {(recommendedRent.min / 10000).toFixed(1)}万 〜 {(recommendedRent.max / 10000).toFixed(1)}万円
                    </p>
                </div>
            )}

            {!isStudentMode && (
                <div>
                    <label className="block text-lg font-bold mb-3">家族構成</label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { value: '1', label: '一人暮らし', icon: '🧍' },
                            { value: '2', label: '二人暮らし', icon: '👫' },
                            { value: '3', label: 'ファミリー', icon: '👨‍👩‍👧' },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setFamilySize(opt.value)}
                                className={`
                                    p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2
                                    ${familySize === opt.value
                                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200'
                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                    }
                                `}
                            >
                                <span className="text-2xl">{opt.icon}</span>
                                <span className="font-bold">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )

    // Step 2: エリア選択
    const renderStep2 = () => (
        <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-bold">興味のある都道府県を選んでください（複数可）</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PREFECTURE_LABELS.map((pref) => {
                    const isSelected = selectedPrefectures.includes(pref.value)
                    return (
                        <button
                            key={pref.value}
                            onClick={() => {
                                setSelectedPrefectures(prev => 
                                    isSelected 
                                        ? prev.filter(p => p !== pref.value)
                                        : [...prev, pref.value]
                                )
                            }}
                            className={`
                                p-3 rounded-lg border-2 font-bold transition-all
                                ${isSelected
                                    ? 'border-primary-500 bg-primary-500 text-white shadow-md transform scale-[1.02]'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                                }
                            `}
                        >
                            {pref.label}
                        </button>
                    )
                })}
            </div>
            {selectedPrefectures.length === 0 && (
                <p className="text-sm text-center text-gray-500 mt-4">
                    ※ 選択しない場合は全てのエリアから検索されます
                </p>
            )}
        </div>
    )

    // Step 3: こだわり条件
    const renderStep3 = () => {
        // カテゴリ定義
        const categories = [
            {
                title: '基本条件',
                keys: ['access_good', 'cost_performance', 'safe_area', 'shopping_convenient']
            },
            {
                title: 'ライフスタイル・趣味',
                keys: ['gym_sauna', 'sports_park', 'library_cafe', 'pet_friendly']
            },
            {
                title: '属性・その他',
                keys: ['single_friendly', 'student_friendly', 'child_rearing']
            }
        ]

        return (
            <div className="space-y-8 animate-fadeIn">
                <h3 className="text-lg font-bold">重視するポイントを選んでください</h3>
                
                {categories.map((cat) => {
                    const displayKeys = cat.keys.filter(key => {
                        // 学生モード時は「子育て」を非表示
                        if (isStudentMode && key === 'child_rearing') return false
                        // 通常モード時は「学生」を非表示にする（推奨）
                        if (!isStudentMode && key === 'student_friendly') return false
                        return true
                    })

                    if (displayKeys.length === 0) return null

                    return (
                        <div key={cat.title}>
                            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 border-l-4 border-primary-500 pl-3">
                                {cat.title}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {displayKeys.map(key => {
                                    const label = FEATURE_LABELS[key]
                                    const description = FEATURE_DESCRIPTIONS[key]
                                    const isSelected = selectedFeatures.includes(key)
                                    
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setSelectedFeatures(prev => 
                                                    isSelected 
                                                        ? prev.filter(f => f !== key)
                                                        : [...prev, key]
                                                )
                                            }}
                                            className={`
                                                text-left p-4 rounded-xl border transition-all h-full
                                                ${isSelected
                                                    ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 dark:bg-primary-900/20'
                                                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-gray-900 dark:text-white">{label}</span>
                                                {isSelected && <span className="text-primary-500">✓</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                {description}
                                            </p>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const isStep1Valid = isStudentMode ? budget > 0 : Boolean(salary && Number(salary) > 0)
    
    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* ステップインジケーター */}
            <div className="flex justify-between mb-8 px-2 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10 rounded-full" />
                <div 
                    className="absolute top-1/2 left-0 h-1 bg-primary-500 -z-10 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                />
                
                {STEPS.map((step) => {
                    const isActive = currentStep >= step.id
                    const isCurrent = currentStep === step.id
                    return (
                        <div key={step.id} className="flex flex-col items-center bg-white dark:bg-gray-900 px-2">
                            <div 
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 transition-all duration-300 border-2
                                    ${isActive 
                                        ? 'bg-primary-500 border-primary-500 text-white' 
                                        : 'bg-white border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600'
                                    }
                                    ${isCurrent ? 'ring-4 ring-primary-100 dark:ring-primary-900' : ''}
                                `}
                            >
                                {isActive ? step.icon : step.id}
                            </div>
                            <span className={`text-xs font-bold ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                                {step.title}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* フォームコンテンツ */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 min-h-[400px] flex flex-col justify-between">
                
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}

                {/* ナビゲーションボタン */}
                <div className="flex gap-4 mt-8 pt-6 border-t dark:border-gray-700">
                    {currentStep > 1 && (
                        <button
                            onClick={prevStep}
                            className="flex-1 py-3 px-6 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                            戻る
                        </button>
                    )}
                    
                    {currentStep < 3 ? (
                        <button
                            onClick={nextStep}
                            disabled={!isStep1Valid}
                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-xl font-bold shadow-lg shadow-primary-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            次へ進む
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-1 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-bold shadow-lg shadow-primary-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    AIが分析中...
                                </>
                            ) : (
                                <>
                                    <span>診断結果を見る</span>
                                    <span>🚀</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
