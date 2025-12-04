/**
 * データ変換スクリプト
 * tokyo_data.md などのマークダウンファイルから prefectures.json 形式に変換
 */

import fs from 'fs';
import path from 'path';

interface RentByRoomType {
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
  features: string[];
  rentByRoomType: RentByRoomType;
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

// 区市町村の座標データ（主要なもののみ）
const COORDINATES: Record<string, { lat: number; lng: number; station: string }> = {
  '千代田区': { lat: 35.6940, lng: 139.7536, station: '東京駅' },
  '中央区': { lat: 35.6704, lng: 139.7703, station: '銀座駅' },
  '港区': { lat: 35.6585, lng: 139.7514, station: '品川駅' },
  '新宿区': { lat: 35.6938, lng: 139.7036, station: '新宿駅' },
  '文京区': { lat: 35.7081, lng: 139.7519, station: '後楽園駅' },
  '台東区': { lat: 35.7107, lng: 139.7794, station: '上野駅' },
  '墨田区': { lat: 35.7101, lng: 139.8013, station: '錦糸町駅' },
  '江東区': { lat: 35.6731, lng: 139.8170, station: '豊洲駅' },
  '品川区': { lat: 35.6092, lng: 139.7301, station: '大井町駅' },
  '目黒区': { lat: 35.6417, lng: 139.6983, station: '目黒駅' },
  '大田区': { lat: 35.5614, lng: 139.7161, station: '蒲田駅' },
  '世田谷区': { lat: 35.6464, lng: 139.6533, station: '三軒茶屋駅' },
  '渋谷区': { lat: 35.6638, lng: 139.6983, station: '渋谷駅' },
  '中野区': { lat: 35.7073, lng: 139.6636, station: '中野駅' },
  '杉並区': { lat: 35.6995, lng: 139.6364, station: '荻窪駅' },
  '豊島区': { lat: 35.7295, lng: 139.7156, station: '池袋駅' },
  '北区': { lat: 35.7537, lng: 139.7341, station: '赤羽駅' },
  '荒川区': { lat: 35.7362, lng: 139.7833, station: '日暮里駅' },
  '板橋区': { lat: 35.7513, lng: 139.7083, station: '板橋駅' },
  '練馬区': { lat: 35.7357, lng: 139.6516, station: '練馬駅' },
  '足立区': { lat: 35.7753, lng: 139.8044, station: '北千住駅' },
  '葛飾区': { lat: 35.7436, lng: 139.8486, station: '金町駅' },
  '江戸川区': { lat: 35.7068, lng: 139.8681, station: '小岩駅' },
};

// 特徴を自動的に割り当て（家賃に基づく）
function assignFeatures(rentByRoomType: RentByRoomType): string[] {
  const features: string[] = [];
  const avgRent = (rentByRoomType.oneRoom + rentByRoomType.oneLDK) / 2;

  if (avgRent < 100000) {
    features.push('cost_performance');
  }
  if (avgRent < 120000) {
    features.push('child_rearing', 'pet_friendly');
  }
  if (avgRent > 150000) {
    features.push('access_good', 'shopping_convenient');
  }
  if (avgRent > 200000) {
    features.push('safe_area');
  }

  return features.length > 0 ? features : ['cost_performance'];
}

// マークダウンファイルをパース
function parseMarkdownData(filePath: string): Area[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const areas: Map<string, Partial<RentByRoomType>> = new Map();

  let currentRoomType: keyof RentByRoomType | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // セクション判定（HTMLコメント内も含む）
    if (trimmed.includes('ワンルーム') || trimmed.includes('1K') || trimmed.includes('1DK')) {
      currentRoomType = 'oneRoom';
      console.log('📍 セクション: ワンルーム');
      continue;
    } else if (trimmed.includes('1LDK') || trimmed.includes('2K') || trimmed.includes('2DK')) {
      currentRoomType = 'oneLDK';
      console.log('📍 セクション: 1LDK');
      continue;
    } else if (trimmed.includes('2LDK') || trimmed.includes('3K') || trimmed.includes('3DK')) {
      currentRoomType = 'twoLDK';
      console.log('📍 セクション: 2LDK');
      continue;
    } else if (trimmed.includes('3LDK') || trimmed.includes('4K') || trimmed.includes('4DK')) {
      currentRoomType = 'threeLDK';
      console.log('📍 セクション: 3LDK');
      continue;
    }

    // HTMLコメントや空行はスキップ
    if (trimmed.startsWith('<!--')) continue;

    if (!currentRoomType) continue;

    // データ行をパース（例: "千代田区 15.18 万円"）
    const match = trimmed.match(/^(.+?)\s+([\d.]+)\s*万円/);
    if (match) {
      const areaName = match[1].trim();
      const rent = parseFloat(match[2]) * 10000; // 万円を円に変換

      if (!areas.has(areaName)) {
        areas.set(areaName, {});
      }
      const areaData = areas.get(areaName)!;
      areaData[currentRoomType] = Math.round(rent);
      console.log(`  ✓ ${areaName}: ${currentRoomType} = ${Math.round(rent).toLocaleString()}円`);
    }
  }

  // Area オブジェクトに変換
  const result: Area[] = [];
  for (const [areaName, rentData] of areas.entries()) {
    // 4つの間取りデータが揃っているもののみ
    if (!rentData.oneRoom || !rentData.oneLDK || !rentData.twoLDK || !rentData.threeLDK) {
      console.warn(`⚠️  ${areaName}: データ不完全（スキップ）`);
      continue;
    }

    const rentByRoomType: RentByRoomType = {
      oneRoom: rentData.oneRoom,
      oneLDK: rentData.oneLDK,
      twoLDK: rentData.twoLDK,
      threeLDK: rentData.threeLDK,
    };

    const averageRent = Math.round(
      (rentByRoomType.oneRoom + rentByRoomType.oneLDK + rentByRoomType.twoLDK + rentByRoomType.threeLDK) / 4
    );

    const coords = COORDINATES[areaName] || { lat: 35.6762, lng: 139.6503, station: '最寄駅' };

    result.push({
      name: areaName,
      averageRent,
      minRent: rentByRoomType.oneRoom,
      maxRent: rentByRoomType.threeLDK,
      latitude: coords.lat,
      longitude: coords.lng,
      nearestStation: coords.station,
      distanceToStation: 10,
      description: `${areaName}エリア。`,
      features: assignFeatures(rentByRoomType),
      rentByRoomType,
    });
  }

  return result;
}

// メイン処理
function main() {
  const dataDir = path.join(process.cwd(), 'data');
  const tokyoDataPath = path.join(dataDir, 'tokyo_data.md');

  if (!fs.existsSync(tokyoDataPath)) {
    console.error('❌ tokyo_data.md が見つかりません');
    process.exit(1);
  }

  console.log('📖 tokyo_data.md を読み込み中...');
  const areas = parseMarkdownData(tokyoDataPath);

  console.log(`✅ ${areas.length} 件のエリアデータを変換しました`);

  // 既存の prefectures.json を読み込み
  const prefecturesPath = path.join(dataDir, 'prefectures.json');
  const prefectures: Prefecture[] = JSON.parse(fs.readFileSync(prefecturesPath, 'utf-8'));

  // 東京都のデータを更新
  const tokyoIndex = prefectures.findIndex(p => p.slug === 'tokyo');
  if (tokyoIndex !== -1) {
    prefectures[tokyoIndex].areas = areas;
    console.log('✅ 東京都のデータを更新しました');
  } else {
    console.error('❌ 東京都のデータが見つかりません');
    process.exit(1);
  }

  // 保存
  fs.writeFileSync(prefecturesPath, JSON.stringify(prefectures, null, 2), 'utf-8');
  console.log('💾 prefectures.json に保存しました');

  // サマリー表示
  console.log('\n📊 変換結果サマリー:');
  console.log(`総エリア数: ${areas.length}`);
  console.log(`平均家賃範囲: ${Math.min(...areas.map(a => a.averageRent)).toLocaleString()}円 〜 ${Math.max(...areas.map(a => a.averageRent)).toLocaleString()}円`);
}

main();
