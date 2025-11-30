/**
 * 家賃データ収集スクリプト
 * 
 * 注意事項:
 * - このスクリプトは教育目的のサンプルです
 * - 実際の使用前に対象サイトの利用規約を確認してください
 * - robots.txtを尊重してください
 * - 過度なリクエストは避けてください(rate limiting)
 * 
 * 推奨: 手動でデータを収集するか、公式APIを使用してください
 */

import * as fs from 'fs';
import * as path from 'path';

// 型定義
interface RentData {
    oneRoom: number;
    oneLDK: number;
    twoLDK: number;
    threeLDK: number;
}

interface Area {
    name: string;
    averageRent: number;
    minRent: number;
    maxRent: number;
    latitude: number;
    longitude: number;
    nearestStation: string;
    distanceToStation: number;
    description: string;
    rentByRoomType: RentData;
}

interface Prefecture {
    id: number;
    name: string;
    slug: string;
    region: string;
    averageRent: number;
    latitude: number;
    longitude: number;
    population: number;
    description: string;
    areas: Area[];
}

/**
 * 手動データ収集用のテンプレート
 * 以下のサイトから情報を収集してください:
 * 
 * 1. HOME'S: https://www.homes.co.jp/chintai/tokyo/price/
 * 2. SUUMO: https://suumo.jp/chintai/soba/
 * 3. at home: https://www.athome.co.jp/chintai/souba/
 */

// サンプルデータ(手動で収集したデータを入力)
const manualDataTemplate: Prefecture[] = [
    {
        id: 1,
        name: '東京都',
        slug: 'tokyo',
        region: '関東',
        averageRent: 85000, // HOME'Sから取得
        latitude: 35.6762,
        longitude: 139.6503,
        population: 14000000,
        description: '日本の首都。ビジネス、文化、エンターテイメントの中心地。',
        areas: [
            {
                name: '港区',
                averageRent: 150000, // HOME'Sの「港区 家賃相場」から取得
                minRent: 100000,
                maxRent: 300000,
                latitude: 35.6585,
                longitude: 139.7514,
                nearestStation: '品川駅',
                distanceToStation: 5,
                description: '高級住宅街、ビジネス街。',
                rentByRoomType: {
                    oneRoom: 120000,   // 1R/1Kの相場
                    oneLDK: 180000,    // 1LDKの相場
                    twoLDK: 250000,    // 2LDKの相場
                    threeLDK: 350000,  // 3LDKの相場
                },
            },
            // 他のエリアを追加...
        ],
    },
    // 他の都道府県を追加...
];

/**
 * データを検証する関数
 */
function validatePrefectureData(data: Prefecture[]): boolean {
    for (const pref of data) {
        // 必須フィールドのチェック
        if (!pref.name || !pref.slug || !pref.averageRent) {
            console.error(`Invalid prefecture data: ${pref.name}`);
            return false;
        }

        // エリアデータのチェック
        for (const area of pref.areas) {
            if (!area.name || !area.averageRent) {
                console.error(`Invalid area data: ${area.name} in ${pref.name}`);
                return false;
            }

            // 家賃の整合性チェック
            if (area.minRent > area.averageRent || area.averageRent > area.maxRent) {
                console.error(`Invalid rent range for ${area.name}`);
                return false;
            }
        }
    }

    return true;
}

/**
 * データをJSONファイルに保存
 */
function saveToJSON(data: Prefecture[], filename: string): void {
    const outputPath = path.join(__dirname, '..', 'data', filename);

    // データを検証
    if (!validatePrefectureData(data)) {
        console.error('Data validation failed!');
        return;
    }

    // JSONファイルに保存
    fs.writeFileSync(
        outputPath,
        JSON.stringify(data, null, 2),
        'utf-8'
    );

    console.log(`✅ Data saved to ${outputPath}`);
    console.log(`📊 Total prefectures: ${data.length}`);
    console.log(`📍 Total areas: ${data.reduce((sum, p) => sum + p.areas.length, 0)}`);
}

/**
 * 統計情報を表示
 */
function showStatistics(data: Prefecture[]): void {
    console.log('\n📈 Data Statistics:');
    console.log('─'.repeat(50));

    for (const pref of data) {
        console.log(`\n${pref.name}:`);
        console.log(`  Average Rent: ¥${pref.averageRent.toLocaleString()}`);
        console.log(`  Areas: ${pref.areas.length}`);

        const avgAreaRent = pref.areas.reduce((sum, a) => sum + a.averageRent, 0) / pref.areas.length;
        console.log(`  Average Area Rent: ¥${Math.round(avgAreaRent).toLocaleString()}`);
    }
}

/**
 * CSVからJSONに変換(e-Statデータ用)
 */
function convertCSVtoJSON(csvPath: string): Prefecture[] {
    // TODO: CSVパーサーを実装
    // e-StatからダウンロードしたCSVファイルを読み込んで変換
    console.log('CSV conversion not implemented yet');
    return [];
}

/**
 * メイン処理
 */
function main() {
    console.log('🏠 RentScope Data Collection Tool\n');

    // 手動データを使用
    const data = manualDataTemplate;

    // 統計情報を表示
    showStatistics(data);

    // JSONファイルに保存
    saveToJSON(data, 'prefectures.json');

    console.log('\n✨ Done!');
    console.log('\n📝 Next steps:');
    console.log('1. Visit https://www.homes.co.jp/chintai/tokyo/price/');
    console.log('2. Collect rent data for each prefecture');
    console.log('3. Update the manualDataTemplate in this script');
    console.log('4. Run this script again to generate the JSON file');
}

// スクリプトを実行
if (require.main === module) {
    main();
}

export type { Prefecture, Area, RentData };
export { validatePrefectureData, saveToJSON };
