/**
 * データ変換スクリプト
 * tokyo_data.md などのマークダウンファイルから prefectures.json 形式に変換
 */

import fs from 'fs';
import path from 'path';

interface RentByRoomType {
  oneRoom: number | null;
  oneLDK: number | null;
  twoLDK: number | null;
  threeLDK: number | null;
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
  rentByRoomType?: RentByRoomType; // 追加 (既存データにない場合があるためオプショナル)
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
  rentByRoomType?: RentByRoomType; // 追加
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
const AREA_FEATURES: Record<string, string[]> = {
  // --- 東京都 ---
  '千代田区': ['access_good', 'safe_area', 'shopping_convenient'],
  '中央区': ['access_good', 'safe_area', 'shopping_convenient'],
  '港区': ['access_good', 'safe_area', 'shopping_convenient', 'pet_friendly'],
  '新宿区': ['access_good', 'shopping_convenient', 'pet_friendly'],
  '文京区': ['safe_area', 'child_rearing', 'access_good'],
  '台東区': ['access_good', 'cost_performance', 'shopping_convenient'],
  '墨田区': ['access_good', 'cost_performance', 'child_rearing'],
  '江東区': ['child_rearing', 'shopping_convenient', 'access_good'],
  '品川区': ['access_good', 'shopping_convenient', 'child_rearing'],
  '目黒区': ['safe_area', 'shopping_convenient', 'pet_friendly'],
  '大田区': ['access_good', 'cost_performance', 'child_rearing'],
  '世田谷区': ['child_rearing', 'pet_friendly', 'safe_area'],
  '渋谷区': ['access_good', 'shopping_convenient', 'pet_friendly'],
  '中野区': ['access_good', 'shopping_convenient', 'cost_performance'],
  '杉並区': ['child_rearing', 'safe_area', 'pet_friendly'],
  '豊島区': ['access_good', 'shopping_convenient', 'cost_performance'],
  '北区': ['access_good', 'cost_performance', 'child_rearing'],
  '荒川区': ['access_good', 'cost_performance', 'child_rearing'],
  '板橋区': ['cost_performance', 'child_rearing', 'access_good'],
  '練馬区': ['child_rearing', 'pet_friendly', 'safe_area'],
  '足立区': ['cost_performance', 'child_rearing', 'access_good'],
  '葛飾区': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '江戸川区': ['child_rearing', 'cost_performance', 'pet_friendly'],
  '八王子市': ['child_rearing', 'cost_performance', 'pet_friendly'],
  '立川市': ['shopping_convenient', 'access_good', 'child_rearing'],
  '武蔵野市': ['shopping_convenient', 'safe_area', 'child_rearing'],
  '三鷹市': ['child_rearing', 'safe_area', 'pet_friendly'],
  '青梅市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '府中市': ['child_rearing', 'safe_area', 'access_good'],
  '昭島市': ['cost_performance', 'child_rearing', 'shopping_convenient'],
  '調布市': ['access_good', 'child_rearing', 'pet_friendly'],
  '町田市': ['shopping_convenient', 'cost_performance', 'child_rearing'],
  '小金井市': ['child_rearing', 'safe_area', 'access_good'],
  '小平市': ['child_rearing', 'cost_performance', 'safe_area'],
  '日野市': ['child_rearing', 'cost_performance', 'pet_friendly'],
  '東村山市': ['cost_performance', 'child_rearing', 'safe_area'],
  '国分寺市': ['access_good', 'safe_area', 'child_rearing'],
  '国立市': ['safe_area', 'child_rearing', 'access_good'],
  '福生市': ['cost_performance', 'shopping_convenient', 'access_good'],
  '狛江市': ['safe_area', 'child_rearing', 'pet_friendly'],
  '東大和市': ['child_rearing', 'cost_performance', 'pet_friendly'],
  '清瀬市': ['cost_performance', 'child_rearing', 'safe_area'],
  '東久留米市': ['cost_performance', 'child_rearing', 'shopping_convenient'],
  '武蔵村山市': ['cost_performance', 'child_rearing', 'shopping_convenient'],
  '多摩市': ['child_rearing', 'shopping_convenient', 'pet_friendly'],
  '稲城市': ['child_rearing', 'safe_area', 'pet_friendly'],
  '羽村市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  'あきる野市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '西東京市': ['access_good', 'child_rearing', 'shopping_convenient'],

  // --- 大阪府 ---
  '大阪市都島区': ['access_good', 'shopping_convenient', 'cost_performance'],
  '大阪市福島区': ['access_good', 'shopping_convenient', 'safe_area'],
  '大阪市此花区': ['cost_performance', 'access_good', 'shopping_convenient'],
  '大阪市西区': ['access_good', 'shopping_convenient', 'pet_friendly'],
  '大阪市港区': ['cost_performance', 'access_good', 'shopping_convenient'],
  '大阪市大正区': ['cost_performance', 'access_good', 'pet_friendly'],
  '大阪市天王寺区': ['safe_area', 'child_rearing', 'access_good'],
  '大阪市浪速区': ['access_good', 'shopping_convenient', 'cost_performance'],
  '大阪市西淀川区': ['cost_performance', 'access_good', 'child_rearing'],
  '大阪市東淀川区': ['cost_performance', 'access_good', 'child_rearing'],
  '大阪市東成区': ['cost_performance', 'access_good', 'shopping_convenient'],
  '大阪市生野区': ['cost_performance', 'shopping_convenient', 'access_good'],
  '大阪市旭区': ['cost_performance', 'child_rearing', 'safe_area'],
  '大阪市城東区': ['access_good', 'child_rearing', 'cost_performance'],
  '大阪市阿倍野区': ['access_good', 'shopping_convenient', 'safe_area'],
  '大阪市住吉区': ['safe_area', 'child_rearing', 'cost_performance'],
  '大阪市東住吉区': ['child_rearing', 'safe_area', 'pet_friendly'],
  '大阪市西成区': ['cost_performance', 'access_good', 'shopping_convenient'],
  '大阪市淀川区': ['access_good', 'shopping_convenient', 'cost_performance'],
  '大阪市鶴見区': ['child_rearing', 'shopping_convenient', 'pet_friendly'],
  '大阪市住之江区': ['cost_performance', 'access_good', 'pet_friendly'],
  '大阪市平野区': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '大阪市北区': ['access_good', 'shopping_convenient', 'safe_area'],
  '大阪市中央区': ['access_good', 'shopping_convenient', 'pet_friendly'],
  '堺市堺区': ['access_good', 'shopping_convenient', 'cost_performance'],
  '堺市中区': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '堺市東区': ['safe_area', 'child_rearing', 'access_good'],
  '堺市西区': ['cost_performance', 'shopping_convenient', 'child_rearing'],
  '堺市南区': ['child_rearing', 'pet_friendly', 'safe_area'],
  '堺市北区': ['access_good', 'shopping_convenient', 'child_rearing'],
  '堺市美原区': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '岸和田市': ['cost_performance', 'child_rearing', 'shopping_convenient'],
  '豊中市': ['safe_area', 'child_rearing', 'access_good'],
  '池田市': ['safe_area', 'child_rearing', 'pet_friendly'],
  '吹田市': ['safe_area', 'child_rearing', 'shopping_convenient'],
  '泉大津市': ['cost_performance', 'access_good', 'child_rearing'],
  '高槻市': ['access_good', 'shopping_convenient', 'child_rearing'],
  '貝塚市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '守口市': ['access_good', 'cost_performance', 'shopping_convenient'],
  '枚方市': ['child_rearing', 'shopping_convenient', 'cost_performance'],
  '茨木市': ['safe_area', 'child_rearing', 'access_good'],
  '八尾市': ['shopping_convenient', 'cost_performance', 'access_good'],
  '泉佐野市': ['access_good', 'shopping_convenient', 'cost_performance'],
  '富田林市': ['child_rearing', 'pet_friendly', 'safe_area'],
  '寝屋川市': ['cost_performance', 'access_good', 'child_rearing'],
  '河内長野市': ['pet_friendly', 'safe_area', 'child_rearing'],
  '松原市': ['access_good', 'cost_performance', 'shopping_convenient'],
  '大東市': ['cost_performance', 'access_good', 'child_rearing'],
  '和泉市': ['child_rearing', 'shopping_convenient', 'pet_friendly'],
  '箕面市': ['safe_area', 'child_rearing', 'pet_friendly'],
  '柏原市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '羽曳野市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '門真市': ['cost_performance', 'access_good', 'shopping_convenient'],
  '摂津市': ['access_good', 'cost_performance', 'child_rearing'],
  '高石市': ['safe_area', 'child_rearing', 'access_good'],
  '藤井寺市': ['safe_area', 'child_rearing', 'cost_performance'],
  '東大阪市': ['shopping_convenient', 'access_good', 'cost_performance'],
  '泉南市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '四條畷市': ['child_rearing', 'pet_friendly', 'safe_area'],
  '交野市': ['safe_area', 'child_rearing', 'pet_friendly'],
  '大阪狭山市': ['safe_area', 'child_rearing', 'pet_friendly'],
  '阪南市': ['cost_performance', 'pet_friendly', 'child_rearing'],

  // --- 神奈川県 ---
  '横浜市鶴見区': ['access_good', 'cost_performance', 'shopping_convenient'],
  '横浜市神奈川区': ['access_good', 'shopping_convenient', 'safe_area'],
  '横浜市西区': ['access_good', 'shopping_convenient', 'safe_area'],
  '横浜市中区': ['shopping_convenient', 'pet_friendly', 'access_good'],
  '横浜市南区': ['access_good', 'cost_performance', 'shopping_convenient'],
  '横浜市保土ケ谷区': ['access_good', 'cost_performance', 'safe_area'],
  '横浜市磯子区': ['access_good', 'child_rearing', 'cost_performance'],
  '横浜市金沢区': ['child_rearing', 'pet_friendly', 'shopping_convenient'],
  '横浜市港北区': ['access_good', 'shopping_convenient', 'child_rearing'],
  '横浜市戸塚区': ['access_good', 'shopping_convenient', 'child_rearing'],
  '横浜市港南区': ['child_rearing', 'shopping_convenient', 'safe_area'],
  '横浜市旭区': ['child_rearing', 'pet_friendly', 'cost_performance'],
  '横浜市緑区': ['child_rearing', 'pet_friendly', 'safe_area'],
  '横浜市瀬谷区': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '横浜市栄区': ['safe_area', 'child_rearing', 'pet_friendly'],
  '横浜市泉区': ['child_rearing', 'pet_friendly', 'safe_area'],
  '横浜市青葉区': ['safe_area', 'child_rearing', 'pet_friendly'],
  '横浜市都筑区': ['shopping_convenient', 'child_rearing', 'safe_area'],
  '川崎市川崎区': ['access_good', 'shopping_convenient', 'cost_performance'],
  '川崎市幸区': ['access_good', 'shopping_convenient', 'child_rearing'],
  '川崎市中原区': ['access_good', 'shopping_convenient', 'child_rearing'],
  '川崎市高津区': ['access_good', 'child_rearing', 'shopping_convenient'],
  '川崎市多摩区': ['access_good', 'child_rearing', 'pet_friendly'],
  '川崎市宮前区': ['safe_area', 'child_rearing', 'pet_friendly'],
  '川崎市麻生区': ['safe_area', 'child_rearing', 'pet_friendly'],
  '相模原市緑区': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '相模原市中央区': ['shopping_convenient', 'cost_performance', 'access_good'],
  '相模原市南区': ['access_good', 'shopping_convenient', 'child_rearing'],
  '横須賀市': ['pet_friendly', 'shopping_convenient', 'cost_performance'],
  '平塚市': ['shopping_convenient', 'child_rearing', 'cost_performance'],
  '鎌倉市': ['safe_area', 'pet_friendly', 'child_rearing'],
  '藤沢市': ['access_good', 'shopping_convenient', 'child_rearing'],
  '小田原市': ['access_good', 'shopping_convenient', 'pet_friendly'],
  '茅ヶ崎市': ['child_rearing', 'pet_friendly', 'safe_area'],
  '逗子市': ['safe_area', 'pet_friendly', 'child_rearing'],
  '三浦市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '秦野市': ['pet_friendly', 'child_rearing', 'cost_performance'],
  '厚木市': ['access_good', 'shopping_convenient', 'cost_performance'],
  '大和市': ['access_good', 'shopping_convenient', 'child_rearing'],
  '伊勢原市': ['access_good', 'cost_performance', 'child_rearing'],
  '海老名市': ['shopping_convenient', 'access_good', 'child_rearing'],
  '座間市': ['cost_performance', 'child_rearing', 'shopping_convenient'],
  '南足柄市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '綾瀬市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '葉山町': ['safe_area', 'pet_friendly', 'child_rearing'],

  // --- 愛知県 ---
  '名古屋市千種区': ['safe_area', 'child_rearing', 'access_good'],
  '名古屋市東区': ['access_good', 'shopping_convenient', 'safe_area'],
  '名古屋市北区': ['access_good', 'cost_performance', 'shopping_convenient'],
  '名古屋市西区': ['access_good', 'shopping_convenient', 'child_rearing'],
  '名古屋市中村区': ['access_good', 'shopping_convenient', 'cost_performance'],
  '名古屋市中区': ['access_good', 'shopping_convenient', 'pet_friendly'],
  '名古屋市昭和区': ['safe_area', 'child_rearing', 'access_good'],
  '名古屋市瑞穂区': ['safe_area', 'child_rearing', 'access_good'],
  '名古屋市熱田区': ['access_good', 'shopping_convenient', 'cost_performance'],
  '名古屋市中川区': ['cost_performance', 'access_good', 'shopping_convenient'],
  '名古屋市港区': ['cost_performance', 'shopping_convenient', 'child_rearing'],
  '名古屋市南区': ['cost_performance', 'access_good', 'shopping_convenient'],
  '名古屋市守山区': ['child_rearing', 'pet_friendly', 'cost_performance'],
  '名古屋市緑区': ['child_rearing', 'shopping_convenient', 'safe_area'],
  '名古屋市名東区': ['child_rearing', 'access_good', 'safe_area'],
  '名古屋市天白区': ['child_rearing', 'safe_area', 'cost_performance'],
  '豊橋市': ['access_good', 'shopping_convenient', 'cost_performance'],
  '岡崎市': ['child_rearing', 'shopping_convenient', 'safe_area'],
  '一宮市': ['access_good', 'shopping_convenient', 'cost_performance'],
  '瀬戸市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '半田市': ['cost_performance', 'child_rearing', 'shopping_convenient'],
  '春日井市': ['access_good', 'child_rearing', 'cost_performance'],
  '豊川市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '津島市': ['access_good', 'cost_performance', 'child_rearing'],
  '碧南市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '刈谷市': ['access_good', 'shopping_convenient', 'safe_area'],
  '豊田市': ['shopping_convenient', 'child_rearing', 'access_good'],
  '安城市': ['access_good', 'shopping_convenient', 'child_rearing'],
  '西尾市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '蒲郡市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '犬山市': ['pet_friendly', 'child_rearing', 'safe_area'],
  '常滑市': ['access_good', 'shopping_convenient', 'pet_friendly'],
  '江南市': ['access_good', 'child_rearing', 'cost_performance'],
  '小牧市': ['access_good', 'shopping_convenient', 'child_rearing'],
  '稲沢市': ['access_good', 'cost_performance', 'child_rearing'],
  '新城市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '東海市': ['access_good', 'child_rearing', 'cost_performance'],
  '大府市': ['access_good', 'child_rearing', 'safe_area'],
  '知多市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '知立市': ['access_good', 'shopping_convenient', 'cost_performance'],
  '尾張旭市': ['child_rearing', 'safe_area', 'access_good'],
  '高浜市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '岩倉市': ['access_good', 'cost_performance', 'child_rearing'],
  '豊明市': ['access_good', 'child_rearing', 'safe_area'],
  '日進市': ['child_rearing', 'safe_area', 'shopping_convenient'],
  '田原市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '愛西市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '清須市': ['access_good', 'cost_performance', 'child_rearing'],
  '北名古屋市': ['access_good', 'child_rearing', 'cost_performance'],
  '弥富市': ['access_good', 'cost_performance', 'child_rearing'],
  'みよし市': ['child_rearing', 'safe_area', 'pet_friendly'],
  'あま市': ['access_good', 'cost_performance', 'child_rearing'],
  '長久手市': ['child_rearing', 'shopping_convenient', 'safe_area'],

  // --- 福岡県 ---
  '北九州市門司区': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '北九州市若松区': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '北九州市戸畑区': ['cost_performance', 'shopping_convenient', 'access_good'],
  '北九州市小倉北区': ['access_good', 'shopping_convenient', 'cost_performance'],
  '北九州市小倉南区': ['child_rearing', 'cost_performance', 'pet_friendly'],
  '北九州市八幡東区': ['shopping_convenient', 'child_rearing', 'cost_performance'],
  '北九州市八幡西区': ['child_rearing', 'shopping_convenient', 'access_good'],
  '福岡市東区': ['child_rearing', 'shopping_convenient', 'access_good'],
  '福岡市博多区': ['access_good', 'shopping_convenient', 'cost_performance'],
  '福岡市中央区': ['access_good', 'shopping_convenient', 'safe_area'],
  '福岡市南区': ['child_rearing', 'safe_area', 'access_good'],
  '福岡市西区': ['child_rearing', 'pet_friendly', 'shopping_convenient'],
  '福岡市城南区': ['child_rearing', 'safe_area', 'cost_performance'],
  '福岡市早良区': ['safe_area', 'child_rearing', 'access_good'],
  '大牟田市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '久留米市': ['access_good', 'shopping_convenient', 'cost_performance'],
  '直方市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '飯塚市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '田川市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '柳川市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '八女市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '筑後市': ['access_good', 'child_rearing', 'cost_performance'],
  '大川市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '行橋市': ['access_good', 'shopping_convenient', 'cost_performance'],
  '豊前市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '中間市': ['access_good', 'cost_performance', 'child_rearing'],
  '小郡市': ['access_good', 'child_rearing', 'safe_area'],
  '筑紫野市': ['access_good', 'shopping_convenient', 'child_rearing'],
  '春日市': ['child_rearing', 'safe_area', 'access_good'],
  '大野城市': ['access_good', 'child_rearing', 'safe_area'],
  '宗像市': ['child_rearing', 'safe_area', 'access_good'],
  '太宰府市': ['safe_area', 'child_rearing', 'access_good'],
  '古賀市': ['access_good', 'child_rearing', 'cost_performance'],
  '福津市': ['child_rearing', 'safe_area', 'shopping_convenient'],
  'うきは市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '宮若市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '嘉麻市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '朝倉市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  'みやま市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '糸島市': ['pet_friendly', 'child_rearing', 'safe_area'],
  '那珂川市': ['child_rearing', 'safe_area', 'access_good'],

  // --- 埼玉県 ---
  'さいたま市西区': ['child_rearing', 'pet_friendly', 'cost_performance'],
  'さいたま市北区': ['shopping_convenient', 'access_good', 'child_rearing'],
  'さいたま市大宮区': ['access_good', 'shopping_convenient', 'cost_performance'],
  'さいたま市見沼区': ['child_rearing', 'pet_friendly', 'safe_area'],
  'さいたま市中央区': ['access_good', 'safe_area', 'child_rearing'],
  'さいたま市桜区': ['child_rearing', 'safe_area', 'cost_performance'],
  'さいたま市浦和区': ['safe_area', 'child_rearing', 'access_good'],
  'さいたま市南区': ['access_good', 'child_rearing', 'shopping_convenient'],
  'さいたま市緑区': ['child_rearing', 'safe_area', 'pet_friendly'],
  'さいたま市岩槻区': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '川越市': ['shopping_convenient', 'child_rearing', 'pet_friendly'],
  '熊谷市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '川口市': ['access_good', 'shopping_convenient', 'cost_performance'],
  '行田市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '秩父市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '所沢市': ['access_good', 'shopping_convenient', 'child_rearing'],
  '飯能市': ['pet_friendly', 'child_rearing', 'safe_area'],
  '加須市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '本庄市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '東松山市': ['cost_performance', 'child_rearing', 'shopping_convenient'],
  '春日部市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '狭山市': ['child_rearing', 'cost_performance', 'pet_friendly'],
  '羽生市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '鴻巣市': ['child_rearing', 'cost_performance', 'safe_area'],
  '深谷市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '上尾市': ['child_rearing', 'cost_performance', 'safe_area'],
  '草加市': ['access_good', 'cost_performance', 'shopping_convenient'],
  '越谷市': ['shopping_convenient', 'child_rearing', 'cost_performance'],
  '蕨市': ['access_good', 'shopping_convenient', 'cost_performance'],
  '戸田市': ['access_good', 'child_rearing', 'shopping_convenient'],
  '入間市': ['cost_performance', 'shopping_convenient', 'pet_friendly'],
  '朝霞市': ['access_good', 'child_rearing', 'shopping_convenient'],
  '志木市': ['access_good', 'shopping_convenient', 'child_rearing'],
  '和光市': ['access_good', 'shopping_convenient', 'safe_area'],
  '新座市': ['access_good', 'child_rearing', 'cost_performance'],
  '桶川市': ['child_rearing', 'cost_performance', 'safe_area'],
  '久喜市': ['access_good', 'cost_performance', 'child_rearing'],
  '北本市': ['child_rearing', 'cost_performance', 'safe_area'],
  '八潮市': ['access_good', 'cost_performance', 'shopping_convenient'],
  '富士見市': ['shopping_convenient', 'child_rearing', 'access_good'],
  '三郷市': ['shopping_convenient', 'access_good', 'cost_performance'],
  '蓮田市': ['child_rearing', 'safe_area', 'access_good'],
  '坂戸市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '幸手市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '鶴ヶ島市': ['child_rearing', 'cost_performance', 'shopping_convenient'],
  '日高市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '吉川市': ['child_rearing', 'shopping_convenient', 'access_good'],
  'ふじみ野市': ['shopping_convenient', 'child_rearing', 'access_good'],
  '白岡市': ['child_rearing', 'safe_area', 'cost_performance'],

  // --- 千葉県 ---
  '千葉市中央区': ['access_good', 'shopping_convenient', 'cost_performance'],
  '千葉市花見川区': ['cost_performance', 'child_rearing', 'safe_area'],
  '千葉市稲毛区': ['child_rearing', 'access_good', 'shopping_convenient'],
  '千葉市若葉区': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '千葉市緑区': ['child_rearing', 'safe_area', 'pet_friendly'],
  '千葉市美浜区': ['child_rearing', 'safe_area', 'shopping_convenient'],
  '銚子市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '市川市': ['access_good', 'child_rearing', 'shopping_convenient'],
  '船橋市': ['access_good', 'shopping_convenient', 'child_rearing'],
  '館山市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '木更津市': ['shopping_convenient', 'child_rearing', 'cost_performance'],
  '松戸市': ['cost_performance', 'child_rearing', 'access_good'],
  '野田市': ['child_rearing', 'cost_performance', 'pet_friendly'],
  '茂原市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '成田市': ['access_good', 'cost_performance', 'shopping_convenient'],
  '佐倉市': ['child_rearing', 'safe_area', 'cost_performance'],
  '東金市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '旭市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '習志野市': ['child_rearing', 'shopping_convenient', 'access_good'],
  '柏市': ['shopping_convenient', 'child_rearing', 'cost_performance'],
  '勝浦市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '市原市': ['cost_performance', 'child_rearing', 'pet_friendly'],
  '流山市': ['child_rearing', 'safe_area', 'access_good'],
  '八千代市': ['child_rearing', 'shopping_convenient', 'cost_performance'],
  '我孫子市': ['child_rearing', 'safe_area', 'cost_performance'],
  '鴨川市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '鎌ケ谷市': ['access_good', 'cost_performance', 'child_rearing'],
  '君津市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '富津市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '浦安市': ['child_rearing', 'safe_area', 'shopping_convenient'],
  '四街道市': ['child_rearing', 'cost_performance', 'safe_area'],
  '袖ケ浦市': ['child_rearing', 'cost_performance', 'pet_friendly'],
  '八街市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '印西市': ['shopping_convenient', 'child_rearing', 'safe_area'],
  '白井市': ['child_rearing', 'safe_area', 'cost_performance'],
  '富里市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '南房総市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '匝瑳市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '香取市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  '山武市': ['cost_performance', 'pet_friendly', 'child_rearing'],
  'いすみ市': ['pet_friendly', 'cost_performance', 'child_rearing'],
  '大網白里市': ['cost_performance', 'pet_friendly', 'child_rearing'],
};

// エリアごとの詳細説明
const AREA_DESCRIPTIONS: Record<string, string> = {
  // --- 東京都 ---
  '千代田区': '皇居や国会議事堂がある日本の政治・経済の中心地です。丸の内や大手町などのオフィス街が広がる一方、番町や麹町などの高級住宅街も点在。「千鳥ヶ淵」の桜は圧巻です。治安が非常に良く、職住近接を求めるエグゼクティブ層に人気ですが、家賃相場は都内トップクラスです。',
  '中央区': '銀座や日本橋などの老舗商業地と、勝どき・晴海などの湾岸エリアが共存する区です。湾岸エリアはタワーマンションの建設ラッシュで、ファミリー層が急増中。隅田川テラスなどは散歩コースとして整備されており、都会的な暮らしと水辺の潤いを感じられます。',
  '港区': '六本木、赤坂、青山、麻布十番など、誰もが知るブランドエリアを擁する区です。外資系企業や大使館が多く、国際色豊かで洗練された雰囲気。「港区女子」などの言葉があるように、ステータスの象徴とも言えるエリア。芝公園や有栖川宮記念公園など、意外と緑も多いのが特徴です。',
  '新宿区': '世界一の乗降客数を誇る新宿駅があり、百貨店や高層ビルが立ち並ぶ大都会。一方で、神楽坂のような情緒ある街や、早稲田などの学生街、戸山公園のような緑地もあり、多様な顔を持ちます。利便性は言わずもがな、どこへ行くにもアクセス抜群です。',
  '文京区': '東京大学やお茶の水女子大学などがある「文教の府」。東京ドームや小石川後楽園などの有名スポットもありますが、基本的には閑静な住宅街が広がります。治安が非常に良く、教育環境を重視するファミリー層に絶大な人気を誇ります。坂が多いのも特徴の一つ。',
  '台東区': '上野や浅草など、江戸の風情が色濃く残る下町エリアです。上野公園には美術館や博物館が集積し、文化的な休日を過ごせます。浅草寺周辺は観光客で賑わいますが、少し離れると静かな住宅街。最近は蔵前などが「東京のブルックリン」として若者に人気です。',
  '墨田区': '東京スカイツリーのお膝元として再開発が進む一方、向島などの花街の風情も残るエリアです。隅田川花火大会は夏の風物詩。錦糸町駅周辺は大型商業施設や映画館があり、副都心として非常に便利です。下町の温かさと新しい街の活気が融合しています。',
  '江東区': '豊洲や有明などの湾岸エリアはタワーマンションやショッピングモールが充実し、ファミリー層に大人気。一方、深川や門前仲町などの内陸部は、富岡八幡宮などの寺社があり、下町情緒が漂います。清澄白河はカフェの街としておしゃれなスポットになっています。',
  '品川区': '品川駅（所在地は港区ですが）周辺のオフィス街と、戸越銀座や武蔵小山などの活気ある商店街が共存する区です。目黒川沿いの桜並木は都内有数の名所。交通利便性が非常に高く、羽田空港へのアクセスも良いため、出張が多いビジネスマンにも選ばれています。',
  '目黒区': '中目黒や自由が丘など、おしゃれで洗練された街が多く、女性やカップルに人気のエリアです。目黒川沿いにはカフェやブティックが並びます。一方で、碑文谷や八雲などは閑静な高級住宅街。治安が良く、落ち着いた住環境を求める人におすすめです。',
  '大田区': '田園調布のような超高級住宅街から、蒲田のような活気ある下町、羽田空港まで多様な顔を持つ区です。多摩川沿いはサイクリングやランニングを楽しむ人で賑わいます。蒲田駅周辺は「羽根つき餃子」が有名で、飲食店が充実しており生活しやすい街です。',
  '世田谷区': '都内で最も人口が多く、二子玉川や三軒茶屋、下北沢など人気の街が目白押しです。砧公園や駒沢オリンピック公園など広大な公園が多く、緑豊かで住環境は抜群。子育て支援も充実しており、ファミリー層からの支持が厚いエリアです。',
  '渋谷区': '若者文化の発信地・渋谷や原宿だけでなく、代官山、恵比寿、広尾などの洗練された大人な街も擁します。代々木公園や明治神宮の広大な森は都会のオアシス。IT企業が多く集まるため、職住近接を求めるクリエイターやエンジニアにも人気です。',
  '中野区': '中野ブロードウェイに代表されるサブカルチャーの聖地。新宿へのアクセスが抜群に良く、家賃相場とのバランスが良い人気エリアです。中野駅周辺は再開発で大学キャンパスやオフィスビルが誕生し、公園も整備されて「住みたい街」としてさらに進化しています。',
  '杉並区': '高円寺、阿佐ヶ谷、荻窪、西荻窪など、中央線沿線独特のカルチャー色が強い街が並びます。古着屋、ジャズ喫茶、個性的な飲食店が多く、街歩きが楽しいエリア。善福寺川緑地などの自然もあり、落ち着いた住宅街としても人気があります。',
  '豊島区': '池袋という巨大ターミナルを擁し、買い物やエンタメには事欠きません。「消滅可能性都市」からの脱却を掲げ、南池袋公園の整備や「Hareza池袋」の開業など、文化都市としての再開発が成功しています。目白などの高級住宅街や、巣鴨のような下町もあります。',
  '北区': '赤羽は「千円でべろべろに酔える」街として有名ですが、実は5路線が使える交通の要衝で、再開発により住みやすさも向上しています。王子には「飛鳥山公園」があり、桜や紫陽花の名所。荒川沿いの自然も豊かで、子育て世帯の流入が増えています。',
  '荒川区': '都電荒川線が走るレトロな風景が残る下町エリア。日暮里は繊維街として有名で、成田空港へのアクセスも良好です。南千住エリアは再開発で高層マンションやショッピングモールが整備され、ファミリー層に人気の新しい街へと変貌を遂げました。',
  '板橋区': '池袋へのアクセスが良く、物価や家賃が比較的安いため、単身者からファミリーまで住みやすいエリアです。ハッピーロード大山などの活気ある商店街が魅力。高島平団地などの大規模団地も多く、緑豊かな公園も点在しています。',
  '練馬区': '東京23区で最も緑被率が高く、石神井公園や光が丘公園などの広大な公園があります。西武池袋線や大江戸線が利用でき、都心へのアクセスも良好。農地も多く残っており、地産地消の野菜が手に入るなど、のどかな住環境が魅力です。',
  '足立区': '北千住駅は5路線が乗り入れるターミナルで、駅ビルや大学キャンパスがあり、「穴場だと思う街」ランキング常連の人気エリアです。物価や家賃が安く、コストパフォーマンスは抜群。荒川河川敷や舎人公園など、自然と触れ合えるスポットも豊富です。',
  '葛飾区': '「こち亀」や「寅さん」で有名な、人情味あふれる下町エリア。物価が安く、レトロな商店街が残っています。水元公園は都内最大級の水郷公園で、メタセコイアの森は必見。京成線や常磐線で都心へアクセス可能で、のんびり暮らしたい人に最適です。',
  '江戸川区': '公園面積が23区内でトップクラスで、葛西臨海公園などの大規模公園があります。子育て支援制度が充実しており、ファミリー層に非常に人気。小岩や船堀などは商業施設も多く便利です。荒川と江戸川に挟まれ、水辺の自然を身近に感じられます。',
  '八王子市': '高尾山などの豊かな自然に囲まれた学園都市。中央線や京王線で新宿へアクセス可能。駅周辺はセレオ八王子などの商業施設が充実しており、生活利便性は高いです。家賃が安く、広めの物件に住みたい人におすすめです。',
  '立川市': '多摩地域最大のターミナル駅・立川駅周辺には、ルミネ、伊勢丹、IKEA、ららぽーとなどが集結し、都心に出なくても何でも揃います。「国営昭和記念公園」は広大な敷地を誇り、四季折々の花やイベントが楽しめます。',
  '武蔵野市': '「住みたい街ランキング」不動のNo.1、吉祥寺を擁する市。井の頭恩賜公園の豊かな自然と、パルコやアトレなどのおしゃれな商業施設が融合しています。中央線と井の頭線が利用でき、新宿・渋谷へのアクセスも抜群。文化的な薫りのする人気の街です。',
  '三鷹市': '「三鷹の森ジブリ美術館」があることで有名。井の頭公園を武蔵野市と共有しており、自然環境は抜群です。中央線特快停車駅で、総武線・東西線の始発駅でもあるため、座って通勤できるのが大きな魅力。落ち着いた住宅街が広がります。',
  '青梅市': '秩父多摩甲斐国立公園の玄関口であり、御岳山などの自然が豊か。レトロな映画看板の街としても知られます。青梅線で立川や東京へアクセス可能。アウトドア好きや、自然の中でスローライフを楽しみたい人に最適です。',
  '府中市': '大國魂神社の門前町として栄え、緑豊かな並木道が美しい街です。京王線特急停車駅で新宿まで約20分。駅周辺は再開発で商業施設が充実しています。東京競馬場やサントリー武蔵野ビール工場などのエンタメスポットもあります。',
  '昭島市': '「深層地下水100%」の水道水がおいしい街。昭島駅北口には「モリタウン」などのショッピングモールや映画館があり、アウトドアヴィレッジも人気。青梅線で立川へのアクセスも良く、住みやすさと利便性のバランスが取れています。',
  '調布市': '京王線特急停車駅で、新宿まで最短15分というアクセスの良さが魅力。「映画のまち」として知られ、撮影所などがあります。深大寺や神代植物公園などの緑豊かなスポットも多く、駅周辺の再開発で「トリエ京王調布」などの商業施設も充実しました。',
  '町田市': '「西の渋谷」とも呼ばれるほど駅周辺が繁華街として発展しており、小田急線と横浜線が利用可能。新宿にも横浜にも出やすく便利です。一方で、少し離れると里山風景が広がり、「薬師池公園」などの自然も豊か。買い物も自然も両方楽しみたい人におすすめ。',
  '小金井市': '「小金井公園」は都立公園最大規模を誇り、江戸東京たてもの園もあります。中央線武蔵小金井駅・東小金井駅が利用可能。坂が多く「はけ」と呼ばれる湧き水スポットも。教育環境が良く、落ち着いた住宅街としてファミリーに人気です。',
  '小平市': '玉川上水などの用水路沿いにグリーンロードが整備され、散歩やサイクリングに最適。「学園都市」として大学や高校が多く、文教地区の雰囲気があります。西武新宿線や西武国分寺線などが利用でき、都心へのアクセスも良好です。',
  '日野市': '新選組ゆかりの地として知られ、日野宿本陣などの史跡があります。多摩川や浅川が流れ、水と緑が豊か。「多摩動物公園」は人気のレジャースポット。中央線や京王線が利用でき、通勤通学にも便利です。',
  '東村山市': '「東村山音頭」で有名。西武新宿線や池袋線などが利用でき、高田馬場や池袋へアクセス良好。「北山公園」の菖蒲苑は見事です。となりのトトロの舞台のモデルの一つと言われる「八国山緑地」があり、里山の自然が残っています。',
  '国分寺市': '「名水百選」に選ばれたお鷹の道・真姿の池湧水群など、水と緑が美しい街。中央線特別快速停車駅で、新宿まで約20分。駅ビル「ミーツ国分寺」などの商業施設も充実。歴史と文化、利便性が調和した人気のエリアです。',
  '国立市': '一橋大学があり、文教地区として指定された落ち着いた街並みが特徴。国立駅から南に伸びる「大学通り」の桜並木とイチョウ並木は絶景です。中央線で新宿へアクセス可能。景観条例により美しい街並みが守られており、洗練された雰囲気があります。',
  '福生市': '横田基地があり、国道16号沿いにはアメリカンな雑貨店やカフェが並ぶ異国情緒あふれる街です。青梅線牛浜駅・福生駅などが利用可能。多摩川沿いの公園も整備されており、独自のカルチャーと自然を楽しめます。',
  '狛江市': '「絵手紙発祥の地」。日本で2番目に面積が小さい市ですが、小田急線で新宿までアクセスしやすく、多摩川の自然も身近です。静かで落ち着いた住宅街が広がり、治安も良いため、穏やかに暮らしたい人に適しています。',
  '東大和市': '多摩湖（村山貯水池）があり、サイクリングロードや公園が整備された自然豊かな街。西武拝島線や多摩モノレールが利用可能。立川へのアクセスも良く、ベッドタウンとして機能しています。',
  '清瀬市': '都内有数の農地面積を誇り、新鮮な野菜が手に入ります。西武池袋線で池袋までアクセス良好。柳瀬川沿いの自然や、ひまわりフェスティバルなど、四季折々の風景が楽しめます。医療機関が多いのも特徴です。',
  '東久留米市': '「平成の名水百選」に選ばれた落合川が流れ、川遊びができるほど水が綺麗です。西武池袋線で池袋までアクセス可能。イオンモール東久留米などの商業施設もあり、自然環境と利便性のバランスが良い街です。',
  '武蔵村山市': '都内で唯一鉄道駅がない市ですが、その分車移動が便利で、イオンモールむさし村山などの大型商業施設が充実しています。多摩モノレールの延伸計画も。狭山丘陵の自然が豊かで、みかん狩りなども楽しめます。',
  '多摩市': '多摩ニュータウンの中心地。「サンリオピューロランド」があることで有名です。京王線・小田急線・多摩モノレールが利用でき、新宿へのアクセスも良好。パルテノン多摩などの文化施設や公園が多く、計画的に整備された住みやすい街です。',
  '稲城市': '「よみうりランド」があり、丘陵地帯の地形を活かした街づくりが行われています。京王相模原線と南武線が利用可能。梨の産地としても有名。緑が多く、ニュータウン開発により綺麗な街並みと広い公園が整備されています。',
  '羽村市': '玉川上水の取水堰があり、桜の名所として知られます。青梅線で立川・東京方面へアクセス可能。「羽村市動物公園」はアットホームな雰囲気でファミリーに人気。工場も多く、財政が豊かな街でもあります。',
  'あきる野市': '「東京サマーランド」や秋川渓谷があり、自然とレジャーの宝庫です。五日市線が利用可能。都心から1時間ほどで大自然を満喫でき、キャンプやバーベキュー、川遊びが日常的に楽しめます。',
  '西東京市': '田無市と保谷市が合併して誕生。西武新宿線と西武池袋線が利用でき、高田馬場や池袋、新宿へのアクセスが非常に良いです。「多摩六都科学館」には世界最大級のプラネタリウムがあります。平坦な地形で自転車移動も楽です。',

  // --- 埼玉県 ---
  'さいたま市大宮区': '「埼玉の玄関口」として知られる大宮駅を擁し、新幹線を含む多数の路線が利用可能な交通の要衝です。駅周辺にはルミネ、エキュート、そごう、高島屋などの大型商業施設が立ち並び、ショッピングやグルメには事欠きません。一方で、駅から少し離れると「氷川神社」の広大な杜や「大宮公園」があり、豊かな自然と歴史を感じられる環境も魅力。都会的な利便性と落ち着いた住環境が共存する、県内屈指の人気エリアです。',
  'さいたま市浦和区': '古くから「文教地区」として知られ、公立校のレベルが高いことで有名です。教育熱心なファミリー層からの支持が絶大で、治安も非常に良好。浦和駅周辺にはパルコやアトレ、伊勢丹があり、洗練された街並みが広がります。東京駅や新宿駅へも湘南新宿ライン・上野東京ラインで短時間でアクセスでき、都内通勤者にも最適なベッドタウンです。',
  '川口市': '荒川を挟んで東京都北区に隣接し、京浜東北線で赤羽まで一駅という圧倒的なアクセスの良さが魅力です。川口駅周辺は再開発が進み、アリオ川口やキュポ・ラなどの商業施設、高層マンションが林立しています。一方で、「川口市立グリーンセンター」のような広大な公園もあり、子育て環境も整備されています。「本当に住みやすい街大賞」で上位にランクインするなど、近年注目度が急上昇しているエリアです。',
  '川越市': '「小江戸」と呼ばれる蔵造りの街並みが有名で、年間を通して多くの観光客が訪れる歴史ある街です。川越駅・本川越駅周辺はクレアモール商店街やアトレなどの商業施設が充実しており、生活利便性も抜群。池袋まで東武東上線急行で約30分、新宿へも西武新宿線やJR埼京線でアクセス可能と、都心への通勤圏内でありながら、独自の文化と風情を楽しめる街です。',
  '所沢市': '西武池袋線と西武新宿線の2路線が交差するターミナル駅・所沢駅を中心に発展しています。駅直結の「グランエミオ所沢」などの商業施設に加え、日本最大級のポップカルチャー発信拠点「ところざわサクラタウン」も話題。広大な敷地を誇る「所沢航空記念公園」は市民の憩いの場となっており、自然環境も豊。都心へのアクセスと住環境のバランスが良く、ファミリー層に人気です。',
  '越谷市': '日本最大級のショッピングモール「イオンレイクタウン」があり、買い物やエンターテイメント、グルメが全てここで完結します。JR武蔵野線と東武スカイツリーラインが交差する交通の要衝でもあり、都心へのアクセスも良好。平坦な地形が多いため自転車での移動が快適で、元荒川沿いの桜並木など自然も身近に感じられます。',
  '草加市': '「草加せんべい」で全国的に有名な街ですが、実は都心へのアクセスが非常に良いベッドタウンです。東武スカイツリーラインで北千住や大手町へ直通アクセスが可能。駅周辺にはマルイやイトーヨーカドーなどの商業施設が充実しているほか、松原団地跡地の再開発により、綺麗で整備された街並みが広がっています。「草加松原」の松並木は散策スポットとしても人気です。',
  '春日部市': '人気アニメ「クレヨンしんちゃん」の舞台として知られ、街のあちこちでキャラクターに出会えます。ララガーデン春日部やイオンモール春日部などの大型商業施設があり、買い物環境は非常に充実。東武スカイツリーラインと東武アーバンパークラインが利用でき、大宮や柏方面へのアクセスも便利です。「大凧あげ祭り」などの伝統行事も盛んです。',
  '上尾市': 'JR高崎線で上野・東京・新宿へ乗り換えなしでアクセスできる利便性が魅力です。上尾駅周辺にはショーサンプラザやアリオ上尾などの商業施設が揃い、日常の買い物に困ることはありません。「上尾運動公園」や「さいたま水上公園」など、スポーツやレジャーを楽しめる施設も充実しており、子育て世帯にとっても住みやすい環境が整っています。',
  '熊谷市': '上越・北陸新幹線の停車駅であり、都心への通勤だけでなく、新潟や長野方面への旅行にも便利です。夏は暑いことで有名ですが、その分「雪くま（かき氷）」などのグルメも楽しめます。駅直結の商業施設「アズ熊谷」や映画館、ラグビー場などがあり、都市機能が充実。荒川河川敷の桜堤は「日本さくら名所100選」にも選ばれています。',
  '戸田市': '荒川を挟んで東京都板橋区に隣接し、埼京線で新宿・渋谷・池袋へ一本でアクセスできる好立地です。平均年齢が若く、子育て支援に力を入れているため、若いファミリー層が増加中。「戸田公園」や荒川沿いのサイクリングロードなど、自然を感じられるスポットも豊富です。夏には「戸田橋花火大会」が開催され、多くの人で賑わいます。',
  '朝霞市': '東武東上線で池袋まで準急で約15分という近さが魅力のベッドタウンです。朝霞台駅ではJR武蔵野線への乗り換えも可能。駅周辺の再開発が進み、歩道が整備された綺麗な街並みになっています。陸上自衛隊朝霞駐屯地があることでも知られますが、普段は静かで落ち着いた住宅街が広がっています。黒目川沿いの桜並木は春の散策に最適です。',
  '和光市': '東京メトロ有楽町線・副都心線の始発駅であり、都心まで座って通勤できるのが最大のメリットです。東武東上線も利用可能で、3路線が使える交通利便性は県内トップクラス。駅ビル「エキアプレミエ和光」やイトーヨーカドーなど買い物施設も充実。理化学研究所などの研究機関が集まる「科学の街」という側面も持っています。',
  '新座市': 'JR武蔵野線（新座駅）と東武東上線（志木駅）が利用可能で、都心へのアクセスが良好です。立教大学や跡見学園女子大学などのキャンパスがあり、学生街のような活気とアカデミックな雰囲気があります。「野火止用水」などの歴史的なスポットや緑地も多く残されており、落ち着いた住環境を求める人に適しています。',
  '久喜市': 'JR宇都宮線と東武伊勢崎線が乗り入れるターミナル駅・久喜駅があり、都心へのアクセスと北関東方面への拠点の両方の役割を果たします。駅周辺には「クッキープラザ」などの商業施設があるほか、郊外には「モラージュ菖蒲」などの超大型モールもあり、車での買い物が非常に便利。「久喜提灯祭り」は関東一の提灯山車祭りとして有名です。',
  '八潮市': 'つくばエクスプレスの開業により、秋葉原まで最速17分という驚異的なアクセスを手に入れました。駅周辺は区画整理が進み、新しいマンションや商業施設「フレスポ八潮」が整備されています。公園も多く、道路も広いため、車を利用するファミリー層にとっても快適な住環境です。これからの発展がさらに期待されるエリアです。',
  '三郷市': '「ららぽーと新三郷」「IKEA」「コストコ」という3大大型商業施設が集結しており、県内外から買い物客が訪れるショッピング天国です。JR武蔵野線とつくばエクスプレス（三郷中央駅）が利用でき、都心へのアクセスも良好。江戸川沿いの広大な河川敷ではスポーツやバーベキューが楽しめ、休日のレジャーも充実しています。',
  'ふじみ野市': '東武東上線の急行停車駅・ふじみ野駅を中心に、計画的に整備された美しい街並みが特徴です。駅周辺には「ソヨカふじみ野」や「イオンタウン」などのショッピングモールがあり、日常の買い物が非常に便利。歩道が広く公園も多いため、小さな子供がいる家庭でも安心して暮らせる環境が整っています。',
  'さいたま市西区': '荒川の河川敷や大宮花の丘農林公苑など、豊かな自然に恵まれたエリアです。JR川越線（指扇駅・西大宮駅）が利用でき、大宮駅へのアクセスも良好。西大宮駅周辺は新しい区画整理地として開発が進み、綺麗な住宅街や区役所、商業施設が整備されています。静かで落ち着いた環境で子育てをしたい家族におすすめです。',
  'さいたま市北区': 'ショッピングモール「ステラタウン」があり、区役所や図書館も隣接しているため、生活の利便性が非常に高いエリアです。JR宇都宮線（土呂駅）と高崎線（宮原駅）、ニューシャトルが利用可能。大宮盆栽村などの歴史的なスポットもあり、文化的な薫りも感じられます。道路網も整備されており、車での移動も便利です。',
  'さいたま市見沼区': 'さいたま市の中で最も緑が豊かな区の一つで、「見沼田んぼ」などの原風景が残っています。JR宇都宮線（東大宮駅）や東武アーバンパークライン（大和田駅・七里駅）が利用可能。東大宮駅周辺は学生が多く活気があり、飲食店も充実しています。自然に近い環境でのびのびと暮らしたい人に適しています。',
  'さいたま市中央区': 'さいたま新都心駅周辺には「さいたまスーパーアリーナ」や「コクーンシティ」があり、イベントやショッピングを日常的に楽しめます。JR埼京線（北与野駅・与野本町駅・南与野駅）も利用でき、都心へのアクセスは抜群。行政の中心地でもあり、整然とした街並みと高い利便性が魅力のエリアです。',
  'さいたま市桜区': '埼玉大学のキャンパスがあり、学生街としての活気と文教地区の落ち着きを併せ持っています。JR埼京線（中浦和駅）や武蔵野線（西浦和駅）が利用可能。荒川沿いには「秋ヶ瀬公園」や「桜草公園」などの広大な公園があり、バーベキューやスポーツを楽しむ人々で賑わいます。自然と調和した暮らしが叶う街です。',
  'さいたま市南区': 'JR武蔵浦和駅は埼京線と武蔵野線の結節点であり、都心へも県内各地へもアクセス抜群。駅周辺は再開発によりタワーマンションや区役所が入る複合施設「サウスピア」が整備され、近代的な景観が広がります。「別所沼公園」などの緑地もあり、利便性と住環境のバランスが良い人気のエリアです。',
  'さいたま市緑区': 'サッカーの聖地「埼玉スタジアム2002」があることで有名です。東川口駅や浦和美園駅周辺は開発が進み、「イオンモール浦和美園」などの大型商業施設が充実。埼玉高速鉄道の始発駅である浦和美園駅からは、座って都心へ通勤できるのも大きなメリットです。見沼田んぼの自然も身近に感じられます。',
  'さいたま市岩槻区': '古くからの城下町であり、「人形のまち」として知られる歴史あるエリアです。東武アーバンパークライン（岩槻駅）が利用でき、大宮駅まで約10分。「岩槻城址公園」は約600本の桜が咲き誇る名所です。歴史的な情緒と落ち着いた住環境があり、静かに暮らしたい人におすすめです。',
  '狭山市': '入間川が市内を流れ、河川敷の公園やサイクリングロードが整備された自然豊かな街です。西武新宿線（狭山市駅）で都心へアクセス可能。特産品の「狭山茶」は全国的に有名です。駅周辺は再開発で綺麗になり、商業施設や市民交流センターが整備されています。「狭山稲荷山公園」は米軍基地跡地を利用した広大な公園で、桜の名所でもあります。',
  '入間市': '「三井アウトレットパーク 入間」があり、週末は多くの買い物客で賑わいます。西武池袋線（入間市駅）が利用可能。加治丘陵や狭山丘陵などの緑豊かな自然に囲まれており、ハイキングなども楽しめます。ジョンソン・タウンと呼ばれる米軍ハウスの街並みは、アメリカンな雰囲気でおしゃれなカフェや雑貨店が点在しています。',
  '志木市': '東武東上線の急行停車駅・志木駅があり、池袋まで約20分とアクセス良好。駅周辺はマルイファミリー志木などの商業施設や飲食店が密集しており、非常に賑やかで便利です。一方で、市内を流れる新河岸川や柳瀬川沿いには桜並木があり、自然も感じられます。カッパの伝説があり、街のあちこちでカッパの像を見かけます。',
  '蕨市': '日本で一番面積が小さい市ですが、人口密度は全国トップクラス。その分、街の機能がコンパクトに凝縮されています。JR京浜東北線（蕨駅）で都心へのアクセスは抜群。「コンパクトシティ」として、買い物、病院、公共施設などが徒歩圏内に揃う利便性が魅力です。昔ながらの商店街も元気で、下町のような温かさがあります。',
  '桶川市': '江戸時代には中山道の宿場町として栄え、今もその面影を残す蔵造りの建物が見られます。JR高崎線（桶川駅）で都心へ直通アクセスが可能。駅周辺には「おけがわマイン」などの商業施設があり、日常の買い物に便利です。「城山公園」などの大きな公園もあり、歴史と自然が調和した落ち着いた住環境です。',
  '北本市': '「北本自然観察公園」や「北本トマトカレー」で知られる、自然と食の街です。JR高崎線（北本駅）が利用可能。雑木林や湧き水などの里山風景が残されており、自然の中でのびのびと子育てをしたいファミリーに最適です。駅周辺は区画整理されており、歩道も広く整備されています。',
  '富士見市': '「ららぽーと富士見」があり、ショッピング、映画、グルメが充実しています。東武東上線（鶴瀬駅・みずほ台駅・ふじみ野駅）が利用でき、池袋へのアクセスも良好。市役所周辺は「キラリ☆ふじみ」などの文化施設も整備されています。荒川河川敷ではスポーツや散策が楽しめ、利便性と開放感を兼ね備えたエリアです。',
  '蓮田市': 'JR宇都宮線（蓮田駅）を利用して、上野や東京、新宿へダイレクトにアクセスできます。駅西口の再開発が進み、新しいマンションや商業施設が誕生しています。一方で、少し離れると梨園や田園風景が広がるのどかな環境。「西城沼公園」などのフィールドアスレチックがある公園もあり、子供たちの遊び場も充実しています。',
  '坂戸市': '東武東上線と東武越生線が乗り入れる坂戸駅を中心に発展しています。女子栄養大学などのキャンパスがあり、学生も多い街です。高麗川沿いの桜並木は絶景で、春には多くの人で賑わいます。「よさこい祭り」が有名で、夏には街全体が活気に包まれます。物価や家賃が比較的安く、暮らしやすいエリアです。',
  '鶴ヶ島市': '関越自動車道と圏央道が交差する「鶴ヶ島JCT」があり、車でのアクセスが非常に便利な街です。東武東上線（若葉駅・鶴ヶ島駅）が利用可能。若葉駅直結のショッピングモール「ワカバウォーク」には映画館もあり、休日のお出かけスポットとして人気です。公園や緑地も多く、整った住環境が魅力です。',
  '日高市': '彼岸花（曼珠沙華）の群生地として有名な「巾着田」があり、秋には真っ赤な絨毯のような絶景が広がります。JR川越線（武蔵高萩駅）や西武池袋線（高麗駅）が利用可能。日和田山などのハイキングコースも充実しており、自然を愛する人にはたまらない環境です。「サイボク」という豚肉のテーマパークも人気スポットです。',
  '吉川市': '「なまずの里」として知られ、駅前には金のなまず像があります。JR武蔵野線（吉川駅・吉川美南駅）が利用可能。特に吉川美南駅周辺は「イオンタウン」などの大規模な開発が進み、新しく美しい街並みが広がっています。道路も広く整備されており、若いファミリー層の流入が続いています。',
  '白岡市': '梨の生産が盛んで、「白岡美人」というブランド梨が有名です。JR宇都宮線（白岡駅・新白岡駅）が利用でき、都心への通勤も可能。静かで落ち着いた住宅街が広がり、治安も良いため、スローライフを楽しみたい人に適しています。「東武動物公園」も近く、休日のレジャーも楽しめます。',
  '行田市': '映画「のぼうの城」の舞台となった「忍城」や、国宝の鉄剣が出土した「埼玉古墳群」など、歴史ロマンあふれる街です。足袋の産地としても有名。JR高崎線（行田駅）や秩父鉄道が利用可能。B級グルメの「フライ」や「ゼリーフライ」も人気です。歴史と文化を感じながら、ゆったりと暮らせるエリアです。',
  '秩父市': '埼玉県西部を代表する観光都市で、豊かな自然と歴史的な街並みが魅力です。西武秩父線で池袋から特急ラビューで最短77分。ユネスコ無形文化遺産に登録された「秩父夜祭」は必見です。長瀞のライン下りや羊山公園の芝桜など、四季折々の観光スポットが満載。テレワークや二拠点居住の地としても注目されています。',
  '飯能市': '「ムーミンバレーパーク」があるメッツァビレッジで一躍有名になりました。西武池袋線の始発駅もあり、座って都心へ通勤可能。入間川の清流や天覧山など、豊かな自然に囲まれており、キャンプやハイキング、カヌーなどのアウトドアアクティビティが日常的に楽しめます。「森林文化都市」を掲げ、自然と共生する暮らしが叶います。',
  '加須市': '「こいのぼり」の生産量が日本一で、5月には全長100mのジャンボこいのぼりが遊泳します。また「加須うどん」も有名。東武伊勢崎線（加須駅）が利用可能。渡良瀬遊水地などの広大な自然があり、サイクリングやバードウォッチングが楽しめます。東北自動車道のICもあり、車での移動も便利です。',
  '本庄市': '上越・北陸新幹線の「本庄早稲田駅」があり、都心へ約45分でアクセスできるため、新幹線通勤をする人もいます。JR高崎線（本庄駅）も利用可能。早稲田大学のキャンパスや本庄早稲田の杜などの開発エリアは、無電柱化された美しい街並みが広がります。マスコットキャラクター「はにぽん」も人気です。',
  '東松山市': '「日本スリーデーマーチ」が開催されるウォーキングの街です。東武東上線（東松山駅・高坂駅）が利用でき、池袋へアクセス可能。高坂駅周辺には「ピオニウォーク東松山」などの大型商業施設があり、買い物に便利です。「埼玉県こども動物自然公園」はコアラやカピバラに会える人気スポットで、ファミリーに最適です。',
  '羽生市': '「イオンモール羽生」があり、北関東最大級の規模を誇るショッピングスポットとして賑わいます。東武伊勢崎線（羽生駅）が利用可能。キャラクターの聖地としても知られ、「世界キャラクターさみっとin羽生」が開催されます。「さいたま水族館」がある羽生水郷公園など、水と緑に親しめる環境です。',
  '鴻巣市': '「ひな人形のまち」として約380年の歴史を持ち、びっくりひな祭りの巨大ピラミッドは圧巻です。また、埼玉県民には「免許センターのある街」としておなじみ。JR高崎線（鴻巣駅）が利用でき、駅直結のショッピングモール「エルミこうのす」には映画館も入っています。荒川の河川敷には日本一広いポピー畑が広がります。',
  '深谷市': '新一万円札の顔・渋沢栄一の生誕地であり、レンガ造りの駅舎が美しい深谷駅は「ミニ東京駅」とも呼ばれます。特産品の「深谷ねぎ」は全国的に有名。JR高崎線（深谷駅）が利用可能。「ふかや花園プレミアム・アウトレット」が開業し、買い物や観光の拠点としても注目を集めています。農業と都市機能が調和した街です。',
  '幸手市': '桜の名所として関東有数の人気を誇る「権現堂堤」があり、春には桜と菜の花のコントラストが見事です。東武日光線（幸手駅）が利用可能。圏央道のICができ、車でのアクセスが向上しました。駅周辺は住宅街が広がり、静かで落ち着いた環境。自然の美しさを身近に感じながら暮らせるエリアです。',

  // --- 神奈川県 ---
  '横浜市鶴見区': '京浜東北線や京急線が利用でき、横浜・川崎・品川へのアクセスが抜群です。駅ビル「シークレイン」などの商業施設が充実。沖縄タウンとしても知られ、独自の食文化が楽しめます。鶴見川沿いの散策路など、水辺の憩いの場もあります。',
  '横浜市神奈川区': '横浜駅の北側に位置し、ポートサイド地区にはタワーマンションやオフィスビルが立ち並びます。一方で、六角橋商店街のようなレトロで活気ある商店街も健在。臨海部の工場夜景は美しく、都会的な暮らしと下町情緒の両方を味わえるエリアです。',
  '横浜市西区': '横浜駅やみなとみらい21地区を擁する、横浜の中心地です。ランドマークタワーやクイーンズスクエアなど、観光・ショッピングスポットが目白押し。都会的な生活を満喫したい人に最適ですが、野毛山公園などの緑豊かなスポットも身近にあります。',
  '横浜市中区': '山下公園、中華街、元町、赤レンガ倉庫など、横浜を代表する観光スポットが集まるエリアです。歴史的な洋館や港の風景が日常の一部になります。関内・馬車道周辺はオフィス街でありながら、おしゃれなカフェやバーも多く、大人の暮らしが楽しめます。',
  '横浜市南区': '「弘明寺観音」を中心に、古くからの門前町として栄えたエリアです。弘明寺商店街は活気があり、買い物客で賑わいます。大岡川沿いの桜並木は県内有数の名所。京急線と地下鉄ブルーラインが利用でき、横浜中心部へのアクセスも良好です。',
  '横浜市保土ケ谷区': 'かつての東海道の宿場町であり、歴史を感じさせるスポットが点在しています。起伏に富んだ地形で坂が多いですが、その分見晴らしの良い住宅地が多いのが特徴。保土ヶ谷公園などの大きな公園もあり、緑豊かな環境で暮らせます。',
  '横浜市磯子区': '根岸湾に面し、臨海部は工業地帯ですが、内陸部は落ち着いた住宅街が広がります。JR根岸線が利用可能。久良岐公園は能舞台や日本庭園がある広大な公園で、市民の憩いの場です。海釣り施設もあり、釣り好きにはたまらない環境です。',
  '横浜市金沢区': '「八景島シーパラダイス」や「横浜・八景島シーパラダイス」があり、海を身近に感じるリゾートライクなエリアです。金沢自然公園（金沢動物園）など、自然と触れ合えるスポットも豊富。京急線で品川まで直通アクセスが可能で、通勤にも便利です。',
  '横浜市港北区': '東急東横線沿線の日吉や綱島、新横浜駅周辺など、人気の高い住宅地が集まっています。特に日吉は慶應義塾大学があり、学生街の活気と文教地区の落ち着きを兼ね備えています。新横浜駅は新幹線停車駅で、出張や旅行に非常に便利です。',
  '横浜市戸塚区': '東海道線・横須賀線・湘南新宿ラインが利用でき、横浜・東京方面へのアクセスが非常に良いターミナル駅・戸塚駅を中心に発展しています。駅周辺は再開発でトツカーナモールなどが整備され、利便性が向上。柏尾川沿いの桜並木は春の風物詩です。',
  '横浜市港南区': '上大岡駅は京急線の快特停車駅で、横浜まで1駅、品川へも短時間でアクセス可能。駅直結の百貨店や映画館があり、買い物やエンタメが充実しています。区内は起伏があり、閑静な住宅街が広がっています。',
  '横浜市旭区': '「よこはま動物園ズーラシア」があることで有名です。相鉄線（二俣川駅・鶴ヶ峰駅）が利用でき、JRや東急線との直通運転により都心へのアクセスが飛躍的に向上しました。緑被率が高く、自然豊かな環境で子育てをしたいファミリーに人気です。',
  '横浜市緑区': 'その名の通り緑が豊かで、「県立四季の森公園」などの広大な公園があります。JR横浜線と東急田園都市線（長津田駅）が利用可能。長津田駅は始発列車もあり、座って通勤できるのが魅力。谷本川沿いの田園風景など、のどかな環境が残っています。',
  '横浜市瀬谷区': '相鉄線（瀬谷駅・三ツ境駅）が利用可能。米軍施設跡地を利用した「海軍道路」の桜並木は圧巻です。2027年の国際園芸博覧会（花博）の開催予定地となっており、今後の発展とインフラ整備が期待される注目エリアです。',
  '横浜市栄区': '鎌倉市に隣接し、緑豊かな丘陵地帯が広がる閑静な住宅街です。JR根岸線（本郷台駅）が利用可能。いたち川沿いの遊歩道は散策に最適で、カワセミが見られることも。自然環境と静かな暮らしを求める人におすすめです。',
  '横浜市泉区': '相鉄いずみ野線と地下鉄ブルーラインが利用可能。「ゆめが丘駅」周辺は大規模な再開発が行われ、大型商業施設「ソラトス」が開業するなど、今最も変化しているエリアの一つです。農業も盛んで、新鮮な野菜が手に入ります。',
  '横浜市青葉区': '東急田園都市線沿線に広がる「東急多摩田園都市」の中心地。たまプラーザや青葉台など、洗練された街並みと美しい並木道が特徴です。おしゃれなカフェやパン屋が多く、優雅なライフスタイルを楽しめます。教育環境も良く、ファミリー層に絶大な人気を誇ります。',
  '横浜市都筑区': '港北ニュータウンの中心エリアで、センター北・センター南駅周辺には大型ショッピングモールが集結しています。歩車分離が進んだ安全な街づくりが行われており、公園と緑道がネットワークのように繋がっています。子育て世帯にとって理想的な環境です。',
  '川崎市川崎区': '川崎大師の門前町としての歴史と、ラゾーナ川崎などの巨大商業施設が共存するエリアです。川崎駅は交通の要衝で、どこへ行くにも便利。多摩川沿いや工場夜景など、独特の景観も魅力。活気あふれる街で、利便性を重視する人に最適です。',
  '川崎市幸区': '川崎駅の西側に位置し、ラゾーナ川崎プラザへのアクセスが良いエリアです。近年は「ミューザ川崎」などの文化施設やタワーマンションが整備され、洗練された雰囲気に。多摩川の河川敷も近く、ランニングやサイクリングを楽しめます。',
  '川崎市中原区': '武蔵小杉駅周辺はタワーマンションが林立し、住みたい街ランキング常連のエリアです。東急線やJR線など多数の路線が利用でき、都心へのアクセスは最強クラス。グランツリー武蔵小杉などの商業施設も充実しており、都会的な生活を享受できます。',
  '川崎市高津区': '東急田園都市線（溝の口駅）とJR南武線（武蔵溝ノ口駅）が交差するターミナル。駅周辺はマルイやノクティなどの商業施設があり賑やかですが、少し離れると落ち着いた住宅街です。多摩川花火大会の会場も近く、夏は多くの人で賑わいます。',
  '川崎市多摩区': '「藤子・F・不二雄ミュージアム」や「岡本太郎美術館」がある文化の街。小田急線（向ヶ丘遊園駅・登戸駅）とJR南武線が利用可能。生田緑地は首都圏有数の自然の宝庫で、プラネタリウムや古民家園もあり、一日中楽しめます。',
  '川崎市宮前区': '東急田園都市線沿線の、坂と緑が多い閑静な住宅街です。宮崎台駅の「電車とバスの博物館」は子供に大人気。渋谷へのアクセスが良く、落ち着いた住環境を求めるファミリー層に支持されています。農産物の直売所も多く、地元の野菜が楽しめます。',
  '川崎市麻生区': '新百合ヶ丘駅周辺は「芸術のまち」として整備され、映画祭なども開催されます。駅前にはイオンやエルミロードなどの商業施設が充実し、買い物に便利。治安が良く、緑豊かな街並みが広がり、品格のある住宅地として知られています。',
  '相模原市緑区': '相模湖や津久井湖など、豊かな自然に囲まれたエリアです。リニア中央新幹線の新駅（橋本駅）設置が予定されており、将来性が期待されています。橋本駅周辺は商業施設も多く便利。アウトドア好きや、自然の中でのびのび暮らしたい人に最適です。',
  '相模原市中央区': '相模原市役所やJAXA相模原キャンパスがある行政・研究の中心地。JR横浜線（相模原駅・矢部駅・淵野辺駅）が利用可能。国道16号沿いにはロードサイド店舗が充実しており、車での生活が便利です。桜並木が美しい「市役所さくら通り」は必見。',
  '相模原市南区': '小田急線（相模大野駅・小田急相模原駅）が利用でき、新宿方面へのアクセスが良好。相模大野駅周辺はステーションスクエアやボーノなどの大型商業施設があり、買い物客で賑わいます。「相模原麻溝公園」にはふれあい動物広場があり、家族連れに人気です。',
  '横須賀市': '米海軍基地と海上自衛隊の基地がある「基地の街」。ドブ板通りにはアメリカンなバーやスカジャン専門店が並び、異国情緒たっぷりです。「猿島」へのフェリーや「ソレイユの丘」など、観光スポットも豊富。海と緑に囲まれた独自の文化を楽しめます。',
  '平塚市': '「湘南ひらつか七夕まつり」で有名な街。JR東海道線始発列車もあり、座って都心へ通勤可能。駅ビル「ラスカ」や「ららぽーと湘南平塚」があり、買い物環境は抜群です。湘南ベルマーレの本拠地でもあり、スポーツ観戦も楽しめます。',
  '鎌倉市': '古都・鎌倉の歴史と、湘南の海が共存する憧れのエリア。鶴岡八幡宮や大仏などの名所はもちろん、おしゃれなカフェや雑貨店も多数。江ノ電が走る風景は絵になります。週末は観光客で賑わいますが、平日は静かで文化的な暮らしが送れます。',
  '藤沢市': '江の島を擁する湘南の中心都市。JR、小田急、江ノ電が利用でき、交通利便性も高いです。テラスモール湘南がある辻堂エリアは再開発で大人気。サーフィンなどのマリンスポーツを楽しむ人が多く、開放的で明るい雰囲気が漂う街です。',
  '小田原市': '小田原城の城下町として栄え、新幹線も停車する西の玄関口。海と山に囲まれ、新鮮な魚介類やかまぼこなどのグルメが豊富です。都心への通勤圏内でありながら、温泉地・箱根へのアクセスも良く、ワークライフバランスの取れた生活が叶います。',
  '茅ヶ崎市': 'サザンオールスターズゆかりの地として知られ、ハワイアンな雰囲気が漂う街。「サザンビーチちがさき」など海が身近にあり、スローライフを楽しむ人が多いです。自転車利用率が高く、平坦な道が多いので移動も楽。独自のカルチャーが根付いています。',
  '逗子市': '「逗子マリーナ」があるリゾート感あふれる街。JR横須賀線と京急線が利用でき、始発列車もあるため都心への通勤も快適です。披露山公園からの相模湾の眺めは絶景。落ち着いた高級住宅街が多く、海を眺めながらゆったり暮らしたい人に人気です。',
  '三浦市': '三崎マグロで有名な港町。城ヶ島や油壺などの景勝地があり、自然の美しさは格別です。京急線（三崎口駅）の終点があり、座って通勤可能。農業も盛んで、新鮮な野菜と魚が手に入ります。都会の喧騒を離れ、自然と共に生きる暮らしがここにあります。',
  '秦野市': '丹沢山地の麓に位置し、「名水百選」に選ばれた美味しい水が湧き出る街です。小田急線（秦野駅）からロマンスカーで新宿へ快適アクセス。登山やハイキングの拠点としても人気。「県立秦野戸川公園」など、自然を活かした公園が多く整備されています。',
  '厚木市': '小田急線本厚木駅周辺は商業施設や飲食店が密集し、非常に賑やかです。「シロコロ・ホルモン」などのB級グルメも有名。一方で、郊外には飯山温泉や七沢温泉などの温泉地があり、気軽にリフレッシュできます。利便性とレジャーの両方を楽しめる街です。',
  '大和市': '小田急線と相鉄線が交差する大和駅、東急田園都市線の中央林間駅などがあり、交通アクセスが非常に良い街です。「シリウス」という文化創造拠点は、図書館やホールが入る複合施設で市民に大人気。平坦な地形で生活しやすく、ベッドタウンとして発展しています。',
  '伊勢原市': '大山（雨降山）の麓に広がる街で、登山客で賑わいます。小田急線（伊勢原駅）が利用可能。東海大学医学部付属病院があり、医療環境が充実しています。秋には果物狩りも楽しめ、自然の恵みを感じられる住環境です。',
  '海老名市': '小田急・相鉄・JRの3路線が乗り入れる交通の要衝。「ららぽーと海老名」や「ビナウォーク」などの大型商業施設があり、県央エリアのショッピングの中心地です。駅周辺の開発が進む一方、いちご狩りができる農園などもあり、都市と農業が共存しています。',
  '座間市': '「ひまわりまつり」で知られ、夏には55万本のひまわりが咲き誇ります。小田急線や相鉄線が利用可能。米軍キャンプ座間があり、国際交流も盛ん。「県立座間谷戸山公園」は里山の自然がそのまま残されており、バードウォッチングなどが楽しめます。',
  '南足柄市': '「金太郎」の伝説が残る街。大雄山線が走り、のどかな風景が広がります。アサヒビールの工場があり、水が綺麗なことでも知られます。「道の駅 足柄・金太郎のふるさと」は地元の特産品が揃う人気スポット。自然の中で静かに暮らしたい人におすすめです。',
  '綾瀬市': '鉄道駅はありませんが（海老名駅や長後駅などを利用）、コミュニティバスが充実しています。ものづくりの街として知られ、工業団地があります。「綾瀬スポーツ公園」などの運動施設が整備されており、車移動が中心のライフスタイルの人に適しています。',

  // --- 千葉県 ---
  '千葉市中央区': '千葉県庁や千葉市役所がある行政の中心地。千葉駅周辺はペリエ千葉やそごうなどの商業施設が充実し、モノレールが空を行き交います。千葉公園では大賀ハスが楽しめます。都市機能と「千葉ポートタワー」などのベイエリアの魅力が融合したエリアです。',
  '千葉市花見川区': '花見川沿いのサイクリングロードや緑地が多く、自然環境に恵まれています。JR総武線（幕張駅・新検見川駅）や京成線が利用可能。大規模な団地が多く、古くからベッドタウンとして発展してきました。静かで落ち着いた住環境です。',
  '千葉市稲毛区': '千葉大学などのキャンパスが集まる文教地区。JR総武線（稲毛駅）は快速停車駅で、東京駅まで約35分とアクセス良好。「稲毛海浜公園」には日本初の人工海浜があり、夏はプールや海水浴で賑わいます。教育環境とレジャー環境が整っています。',
  '千葉市若葉区': '千葉市で最も面積が広く、豊かな自然が残るエリアです。「千葉市動物公園」はレッサーパンダの風太くんで有名。加曽利貝塚などの史跡もあります。千葉モノレールが走り、のどかな風景を眺めながらの移動も楽しいものです。',
  '千葉市緑区': '「おゆみ野」や「あすみが丘」などのニュータウンが整備され、美しい街並みが広がります。JR外房線（鎌取駅・土気駅）が利用可能。「昭和の森」は県内最大級の公園で、四季折々の自然を楽しめます。子育て世帯に非常に人気の高いエリアです。',
  '千葉市美浜区': '幕張メッセやZOZOマリンスタジアムがある「幕張新都心」を擁する区です。計画的に整備された街並みは電柱がなく広々としています。タワーマンションや高級ホテルが立ち並び、ベイエリアならではの開放的で洗練された暮らしが叶います。',
  '銚子市': '関東最東端に位置し、初日の出が日本一早い街として有名です。日本屈指の水揚げ量を誇る銚子漁港があり、新鮮な魚介類が安く手に入ります。銚子電鉄が走るレトロな風景や、屏風ヶ浦の絶景など、観光資源も豊富。海風を感じる暮らしができます。',
  '市川市': '江戸川を挟んで東京都に隣接し、都心へのアクセスは抜群。JR総武線、京成線、都営新宿線などが利用可能。文豪が愛した街としても知られ、市川真間周辺は桜並木が美しい高級住宅街です。「ニッケコルトンプラザ」などの商業施設も充実しています。',
  '船橋市': '「ふなっしー」で知名度抜群の街。JR総武線、京成線、東武線など多数の路線が乗り入れ、交通利便性は県内トップクラス。「ららぽーとTOKYO-BAY」やIKEAがあり、買い物天国です。「アンデルセン公園」はテーマパークランキングで上位に入る人気スポット。',
  '館山市': '房総半島の南端に位置し、温暖な気候と美しい海が魅力。「海のまち」としてダイビングやサーフィンが楽しめます。移住者支援に力を入れており、二拠点居住やスローライフを求める人に人気。新鮮な海の幸と里山の恵みを享受できる環境です。',
  '木更津市': '東京湾アクアラインの玄関口。「三井アウトレットパーク 木更津」があり、県外からも多くの人が訪れます。都心への高速バスが充実しており、座って通勤することも可能。盤洲干潟などの自然も残り、潮干狩りも楽しめます。発展著しいエリアです。',
  '松戸市': '「共働き子育てしやすい街ランキング」で常に上位に入る、子育て支援先進都市。JR常磐線や新京成線が利用可能。松戸駅周辺は商業施設が充実し、ラーメン激戦区としても有名。「21世紀の森と広場」など、自然と触れ合える公園も整備されています。',
  '野田市': '醤油の街として知られ、キッコーマンの本社があります。東武アーバンパークラインが走り、柏や大宮へアクセス可能。「清水公園」はフィールドアスレチックやキャンプ場があり、家族連れに大人気。落ち着いた住環境と歴史ある街並みが魅力です。',
  '茂原市': '天然ガス生産量が日本一。JR外房線（茂原駅）の特急停車駅で、東京駅まで約1時間。「茂原公園」は「日本さくら名所100選」に選ばれており、春は多くの花見客で賑わいます。七夕祭りも関東有数の規模。自然豊かで物価も安く、暮らしやすい街です。',
  '成田市': '日本の空の玄関口「成田国際空港」がある国際都市。成田山新勝寺の門前町としての歴史も持ち、参道には鰻屋が並びます。京成線やJR線で都心へアクセス可能。空港関連の雇用も多く、活気があります。公津の杜エリアは美しい街並みで人気です。',
  '佐倉市': '城下町の面影を残す「歴史のまち」。国立歴史民俗博物館や佐倉ふるさと広場の風車など、文化的なスポットが多数。京成線特急停車駅で、都心への通勤も便利。ユーカリが丘はニュータウンとして整備され、子育て環境が抜群に良いです。',
  '東金市': '九十九里浜への玄関口。春には「東金桜まつり」が開催され、八鶴湖畔の桜が見事です。JR東金線が利用可能。道の駅 みのりの郷東金では新鮮な植木や野菜が手に入ります。のどかな田園風景が広がり、ゆったりとした時間が流れる街です。',
  '旭市': '九十九里浜の最北端に位置し、夏は海水浴客で賑わいます。農業と漁業が盛んで、食の宝庫。総合病院の「旭中央病院」があり、医療体制が充実しているのが大きな安心材料。刑部岬からの景色は「日本の夕陽百選」に選ばれています。',
  '習志野市': '「音楽のまち」として知られ、学校の吹奏楽部が全国レベルです。JR総武線（津田沼駅）周辺はパルコやモリシアなどの商業施設が集積し、非常に便利。谷津干潟はラムサール条約登録地で、野鳥観察が楽しめます。文教地区の雰囲気と利便性が共存しています。',
  '柏市': '「千葉の渋谷」と呼ばれる柏駅周辺は、高島屋やマルイ、若者向けショップが立ち並び、常に賑わっています。「柏の葉キャンパス」エリアはスマートシティとして開発され、ららぽーとや大学、研究機関が集まる最先端の街。新旧の魅力が混在する刺激的なエリアです。',
  '勝浦市': '日本三大朝市の一つ「勝浦朝市」が有名。夏は涼しく冬は暖かい避暑地・避寒地として知られ、100年以上猛暑日を記録していないことでも話題に。「勝浦タンタンメン」はB級グルメの王様。海中公園やサーフスポットもあり、海好きにはたまらない環境です。',
  '市原市': '日本一のゴルフ場数を誇る街。臨海部は京葉工業地帯の中核ですが、内陸部は養老渓谷などの豊かな自然が広がります。小湊鐵道のトロッコ列車は観光客に大人気。「市原ぞうの国」もあり、家族で楽しめるスポットが豊富です。',
  '流山市': '「母になるなら、流山市。」のキャッチコピーで知られ、子育て世帯の流入数が全国トップクラス。つくばエクスプレス（流山おおたかの森駅）周辺は「流山おおたかの森S・C」があり、緑豊かで洗練された街並み。都心へのアクセスも最速20分と抜群です。',
  '八千代市': '東葉高速鉄道が通り、大手町まで直通アクセスが可能。村上駅周辺には「フルルガーデン八千代」などの大型商業施設があります。「京成バラ園」は世界有数の規模を誇り、シーズンには多くの人が訪れます。新川沿いの遊歩道は散歩やジョギングに最適です。',
  '我孫子市': '手賀沼のほとりに位置し、白樺派の文人たちに愛された街。JR常磐線（我孫子駅）は千代田線直通で、始発列車も多いため座って通勤できます。手賀沼公園や親水広場など、水辺の自然環境が素晴らしく、野鳥の楽園でもあります。落ち着いた住環境です。',
  '鴨川市': '「鴨川シーワールド」がある南房総のリゾート地。温暖な気候で、花摘みやイチゴ狩りが楽しめます。亀田総合病院という高度医療機関があり、安心感があります。サーフィンのメッカとしても知られ、海と共に暮らすライフスタイルが実現できます。',
  '鎌ケ谷市': '日本ハムファイターズのファーム球場があり、梨の産地としても有名です。新京成線、東武野田線、北総線の3路線が交わる交通の結節点。都心へも船橋へもアクセス良好。駅周辺のショッピングモールと、のどかな果樹園風景が共存する街です。',
  '君津市': '製鉄所がある工業都市の顔と、房総丘陵の豊かな自然を持つ顔を併せ持ちます。「濃溝の滝（亀岩の洞窟）」は幻想的な風景でSNSで話題に。東京湾アクアラインへのアクセスが良く、都心への高速バスも充実。マザー牧場も近く、休日の楽しみが尽きません。',
  '富津市': '富津岬やマザー牧場、鋸山など、観光スポットが目白押し。「はかりめ丼（穴子丼）」などのグルメも魅力。潮干狩りや海水浴など、海のアクティビティが日常的に楽しめます。自然の中で子育てをしたい人や、アウトドア派に最適な環境です。',
  '浦安市': '東京ディズニーリゾートがある街として世界的に有名。新浦安エリアは計画的に整備された美しい街並みで、パームツリーが並ぶリゾートのような雰囲気。都心へのアクセスも抜群。液状化対策などの防災対策も進められており、高い人気を維持しています。',
  '四街道市': 'JR総武本線（四街道駅）で千葉駅まで約10分、東京駅まで約50分とアクセス良好。駅周辺はマンションや住宅が立ち並びますが、少し離れると田園風景が広がります。物価や地価が比較的安く、コストパフォーマンスの良いベッドタウンとして人気です。',
  '袖ケ浦市': '「東京ドイツ村」があり、冬のイルミネーションは圧巻です。アクアラインへのアクセスが良く、袖ケ浦バスターミナルからは都心や空港へのバスが頻繁に出ています。海沿いの公園「袖ケ浦海浜公園」からは東京湾を一望でき、のびのびと暮らせる街です。',
  '八街市': '落花生の生産量が日本一で、街のいたるところに落花生畑が広がります。JR総武本線（八街駅）が利用可能。強風時に砂埃が舞う「やちぼこり」という言葉がありますが、防風林の整備などで対策が進んでいます。のどかな農村風景と手頃な家賃が魅力です。',
  '印西市': '「住みよさランキング」で長年1位を獲得し続けるニュータウン。千葉ニュータウン中央駅周辺は、イオンモールやジョイフル本田などの超大型商業施設が並び、道路も広々としています。北総線で都心へアクセス可能（運賃は高めですが）。データセンターが集積する街でもあります。',
  '白井市': '梨の生産量が県内トップクラス。北総線（白井駅・西白井駅）が利用可能。千葉ニュータウンの一部として整備され、緑豊かな公園や遊歩道が多いのが特徴。静かで落ち着いた環境で、子育て世帯に適しています。',
  '富里市': 'スイカの産地として有名で、「スイカロードレース」が開催されます。鉄道駅はありませんが（成田駅や公津の杜駅を利用）、東関東自動車道のICがあり車移動が便利。成田空港に近く、空港関連の仕事に従事する人が多く住んでいます。',
  '南房総市': '房総半島の最南端。黒潮の影響で冬でも暖かく、花畑が広がります。道の駅が非常に多く、地元の新鮮な食材が手に入ります。海女漁や捕鯨などの伝統文化も。都会とは違う時間の流れを感じられる、癒しのエリアです。',
  '匝瑳市': '植木の街として知られ、日本有数の植木生産地です。JR総武本線（八日市場駅）が利用可能。九十九里浜に面しており、夏は海水浴客で賑わいます。「八日市場の盆踊り」は県指定無形民俗文化財。自然と伝統が息づく街です。',
  '香取市': '「佐原」地区は「北総の小江戸」と呼ばれ、小野川沿いの歴史的な街並みは重要伝統的建造物群保存地区に選定されています。香取神宮は関東屈指のパワースポット。水郷地帯の美しい風景と歴史文化が調和した、情緒あふれる街です。',
  '山武市': '九十九里浜のほぼ中央に位置し、サーフィンや海水浴の人気スポット。イチゴ狩りも盛んです。JR総武本線（成東駅）が利用可能。成東城跡公園はツツジの名所。自然豊かで開放的な環境で、スローライフを楽しめます。',
  'いすみ市': '「住みたい田舎ベストランキング」で首都圏エリア1位を獲得したこともある移住人気地。イセエビの水揚げ量が日本トップクラス。いすみ鉄道が走る里山風景と、サーフスポットの海の両方が楽しめます。オーガニックな取り組みも盛んです。',
  '大網白里市': '九十九里浜に面し、都心への通勤圏内（JR外房線大網駅）でありながら、海のある暮らしが叶います。駅周辺は住宅開発が進み、商業施設も充実。永田ドライブインなどレトロなスポットも。サーファーやファミリー層に人気のベッドタウンです。',

  // --- 大阪府 ---
  '大阪市都島区': '京橋駅周辺は大阪有数の繁華街で、飲食店や商業施設が密集しています。一方で、大川沿いの「桜之宮公園」は桜の名所として知られ、水と緑が豊かな環境。都心へのアクセスと住環境のバランスが良く、ファミリー層にも人気です。',
  '大阪市福島区': '「グルメの街」として知られ、路地裏には隠れ家的な名店がひしめき合っています。梅田まで徒歩圏内という好立地で、オフィス街と住宅街が混在。治安も良く、単身者からファミリーまで幅広い層に支持される人気のエリアです。',
  '大阪市此花区': '「ユニバーサル・スタジオ・ジャパン（USJ）」があることで世界的に有名。ベイエリアの開発が進み、新しいマンションが増えています。JRゆめ咲線で西九条へ出れば、大阪市内各地へのアクセスもスムーズ。下町情緒も残る親しみやすい街です。',
  '大阪市西区': 'おしゃれなカフェや雑貨店が並ぶ「堀江」や、緑豊かな「靱公園」があり、洗練された都会の暮らしが楽しめます。心斎橋や難波も徒歩圏内。感度の高い若者やクリエイター、ペットを飼う人々に特に人気の高いエリアです。',
  '大阪市港区': '「海遊館」や「天保山大観覧車」があるベイエリアの中心地。弁天町駅周辺は「大阪ベイタワー」などの高層ビルが立ち並びます。地下鉄中央線とJR環状線が利用でき、交通アクセスも良好。海風を感じながら開放的な生活が送れます。',
  '大阪市大正区': '沖縄からの移住者が多く、「リトル沖縄」として独自の文化が根付いています。IKEA鶴浜などの大型商業施設も立地。京セラドーム大阪があり、イベント開催時は賑わいます。川に囲まれた地形から渡船が日常の足として活躍しています。',
  '大阪市天王寺区': '「あべのハルカス」や「天王寺ミオ」などの商業施設が集まる天王寺駅周辺と、四天王寺や一心寺などの寺社が並ぶ歴史的なエリアが共存しています。文教地区としても知られ、有名進学校が多く、教育熱心なファミリー層に人気です。',
  '大阪市浪速区': '「なんばパークス」などの商業施設や、電気街「でんでんタウン」、シンボル「通天閣」がある新世界など、大阪の魅力が凝縮されたエリアです。JR難波駅周辺（OCAT）は再開発で綺麗になり、タワーマンションも増加中。利便性は抜群です。',
  '大阪市西淀川区': '梅田へのアクセスが良い割に家賃が手頃な穴場エリア。JR東西線（御幣島駅など）や阪神なんば線が利用可能。淀川の河川敷は広大で、ジョギングやバーベキューを楽しむ人で賑わいます。平坦な地形で自転車移動も楽です。',
  '大阪市東淀川区': '新大阪駅に近く、新幹線利用に便利。阪急京都線（淡路駅・上新庄駅）沿線は大学キャンパスもあり、学生が多く活気があります。物価が安く、生活しやすい環境。淡路駅周辺は大規模な再開発が進行中で、今後の発展が期待されます。',
  '大阪市東成区': '中小企業の町工場が多く、「ものづくりの街」として知られます。地下鉄中央線・千日前線・JR環状線が利用でき、交通アクセスは非常に良好。下町の人情味あふれる商店街があり、生活コストを抑えつつ便利に暮らせます。',
  '大阪市生野区': 'コリアンタウンがあり、韓国グルメやコスメを求める観光客で賑わいます。異文化が日常に溶け込んだ独特の雰囲気。家賃相場が比較的安く、レトロな長屋をリノベーションしたカフェなども増えています。',
  '大阪市旭区': '「千林商店街」は大阪三大商店街の一つで、活気と安さは圧巻。地下鉄谷町線（千林大宮駅）や京阪本線（千林駅・森小路駅）が利用可能。淀川河川公園も近く、のんびりとした下町の暮らしを楽しめます。',
  '大阪市城東区': '「鴫野」「蒲生四丁目」などは治安が良く、ファミリー層に人気。区内を複数の川が流れ、水辺の風景が広がります。JRおおさか東線や地下鉄長堀鶴見緑地線など多数の路線が通り、京橋へのアクセスも抜群。人口密度が高い活気ある街です。',
  '大阪市阿倍野区': '天王寺駅周辺の繁華街から少し離れると、帝塚山などの閑静な高級住宅街が広がります。路面電車（阪堺電車）が走るレトロな風景も魅力。文教地区でもあり、落ち着いた環境で子育てをしたい層に支持されています。',
  '大阪市住吉区': '全国の住吉神社の総本社「住吉大社」があり、初詣には多くの人が訪れます。南海本線・高野線、JR阪和線が利用可能。帝塚山エリアは屋敷が並ぶ高級住宅街。歴史と伝統を感じながら、静かに暮らせるエリアです。',
  '大阪市東住吉区': '「長居公園」はヤンマースタジアム長居や植物園があり、スポーツやイベントの拠点です。駒川商店街は活気があり、日常の買い物が楽しい場所。JR阪和線や地下鉄谷町線が利用でき、天王寺へのアクセスも良好です。',
  '大阪市西成区': 'かつてのイメージから大きく変わりつつあるエリア。星野リゾートの進出などで注目を集めています。天下茶屋駅周辺は交通の便が良く、スーパーも充実して住みやすいと評判。物価や家賃の安さは大阪市内でもトップクラスです。',
  '大阪市淀川区': '「新大阪駅」を擁し、出張や旅行に最強の立地。十三駅周辺は飲食店がひしめく繁華街で、独特のディープな魅力があります。阪急3路線が集まる十三駅は、神戸・京都・宝塚方面へのアクセスも抜群。花火大会のメッカでもあります。',
  '大阪市鶴見区': '「花博記念公園鶴見緑地」があり、四季折々の花や自然を楽しめます。「三井アウトレットパーク 大阪鶴見」もあり、買い物環境も充実。地下鉄長堀鶴見緑地線で心斎橋まで直通。ファミリー層に非常に人気の高いエリアです。',
  '大阪市住之江区': 'ボートレース住之江やインテックス大阪があるベイエリア。南港ポートタウン（ニュートラム沿線）は計画的に整備された住宅地で、公園や学校が多く子育て環境が良好。四つ橋線（住之江公園駅）は始発駅で、座って通勤できます。',
  '大阪市平野区': '大阪市内で最も人口が多い区。瓜破（うりわり）や喜連（きれ）などの難読地名が多いことでも知られます。地下鉄谷町線が通り、天王寺や梅田へアクセス可能。家賃相場が手頃で、昔ながらの長屋や文化住宅も残る、人情味ある街です。',
  '大阪市北区': 'JR大阪駅・梅田駅を中心とする西日本最大の繁華街「キタ」。百貨店、高級ホテル、オフィスビルが林立し、グランフロント大阪などの再開発も続いています。中崎町のようなレトロでおしゃれなエリアや、天神橋筋商店街もあり、多様な楽しみ方ができます。',
  '大阪市中央区': '大阪城や道頓堀、心斎橋など、大阪のシンボルが集まるエリア。本町や淀屋橋はビジネス街、ミナミはエンタメの街と、場所によって表情が異なります。タワーマンションが増え、職住近接を求める人々に選ばれています。',
  '堺市堺区': '堺市の中心で、堺東駅周辺には市役所や高島屋があり賑わっています。「仁徳天皇陵古墳」などの百舌鳥古墳群は世界遺産。歴史的な街並みと都市機能が調和しており、難波へも南海高野線で約12分とアクセス抜群です。',
  '堺市南区': '泉北ニュータウンが広がる計画的な街。緑道や公園が整備され、美しい街並みが魅力です。泉北高速鉄道で難波まで直通アクセス可能。「ハーベストの丘」などの自然体験スポットもあり、ゆったりとした環境で子育てできます。',
  '堺市北区': '地下鉄御堂筋線（北花田駅・新金岡駅・なかもず駅）が利用でき、梅田や難波へダイレクトにアクセスできる利便性が最大の魅力。「イオンモール堺北花田」などの商業施設も充実。大泉緑地などの大きな公園もあり、住環境は非常に良好です。',
  '豊中市': '「千里ニュータウン」の一部を含み、転勤族に人気のベッドタウン。北大阪急行（地下鉄御堂筋線直通）や阪急宝塚線が利用可能。服部緑地などの公園が多く、教育環境も良いため、子育て世帯からの支持が厚いエリアです。',
  '池田市': '「インスタントラーメン発祥の地」であり、カップヌードルミュージアムがあります。五月山公園には動物園があり、ウォンバットに会えます。阪急宝塚線で梅田まで急行で約20分。大阪国際空港（伊丹空港）もあり、空の旅も身近です。',
  '吹田市': '「太陽の塔」がある万博記念公園は、広大な緑地とエキスポシティ（大型商業施設）が融合した人気スポット。JR、阪急、地下鉄が利用でき、交通利便性は抜群。アサヒビールの工場もあり、産業と住宅が調和した活気ある街です。',
  '高槻市': 'JR京都線と阪急京都線の2路線が利用でき、大阪と京都のちょうど中間に位置するため、どちらへもアクセス良好。駅周辺は百貨店や商店街が充実し、非常に便利です。摂津峡などの自然もあり、ハイキングなども楽しめます。',
  '枚方市': '「ひらかたパーク（ひらパー）」でおなじみの街。京阪本線（枚方市駅）は特急停車駅で、大阪・京都へのアクセスが便利。駅周辺はT-SITEなどの商業施設がおしゃれにリニューアルされました。大学キャンパスも多く、学園都市の側面もあります。',
  '茨木市': 'JRと阪急の両駅が利用でき、立命館大学のキャンパスがある文教都市。「茨木童子」の伝説も。イオンモール茨木などの商業施設が充実。万博記念公園にも近く、整った住環境と利便性の高さから、ファミリー層に人気の北摂エリアです。',
  '八尾市': '「河内音頭」発祥の地。近鉄大阪線（近鉄八尾駅）周辺にはアリオ八尾やリノアスなどの大型商業施設があり、買い物に困りません。ものづくりの街としても有名。久宝寺緑地などの公園もあり、活気と住みやすさを兼ね備えています。',
  '寝屋川市': '京阪本線（寝屋川市駅）が利用でき、大阪市内へのアクセスが良好。駅周辺は商店街やスーパーが充実しており、生活利便性が高いです。成田山不動尊は交通安全祈願で有名。淀川河川公園も近く、自然を感じながら暮らせます。',
  '東大阪市': '「モノづくりのまち」として世界的に有名で、高い技術力を持つ中小企業が集積しています。「花園ラグビー場」はラグビーの聖地。近鉄奈良線やけいはんな線、JRおおさか東線など交通網が発達しており、難波や梅田へのアクセスも便利です。',
  '岸和田市': '「岸和田だんじり祭」で全国的に有名な、熱気あふれる街。南海本線（岸和田駅）は特急停車駅で、難波まで約25分。岸和田カンカンベイサイドモールなどの商業施設もあります。歴史と伝統を大切にするコミュニティが魅力です。',
  '箕面市': '「明治の森箕面国定公園」があり、箕面大滝や紅葉の名所として知られます。北大阪急行の延伸により、箕面萱野駅から梅田まで直通アクセスが可能になり、利便性が飛躍的に向上しました。高級住宅街としても知られ、落ち着いた環境です。',
  '門真市': 'パナソニックの本社がある企業城下町。京阪本線とモノレールが利用可能。「三井アウトレットパーク 大阪門真」と「ららぽーと門真」が開業し、買い物スポットとして大注目されています。運転免許試験場があることでも知られます。',
  '大東市': '「野崎参り」で有名な野崎観音があります。JR学研都市線（住道駅）周辺は、京阪百貨店やオペラパークなどの商業施設が充実。生駒山地の麓に位置し、ハイキングコースも身近。大阪市内へのアクセスも良く、住みやすい街です。',
  '松原市': '「セブンパーク天美」という大型商業施設が開業し、映画やショッピングが楽しめるようになりました。近鉄南大阪線（河内松原駅）から阿部野橋（天王寺）まで準急で約10分。大阪市に隣接しており、ベッドタウンとして人気です。',
  '和泉市': '「ららぽーと和泉」やコストコがあり、買い物環境が抜群に良いエリアです。泉北高速鉄道（和泉中央駅）は始発駅で、難波まで座って通勤可能。新しい街並みと、古くからの歴史ある地域が共存しています。子育て支援も充実。',
  '四條畷市': '「四條畷の戦い」の楠木正行を祀る四條畷神社があります。JR学研都市線（四条畷駅）が利用でき、京橋まで約15分。生駒山地の緑が豊かで、自然環境に恵まれています。イオンモール四條畷もあり、生活利便性も高いです。',
  '交野市': '「星のまち」として知られ、七夕伝説ゆかりの地。京阪交野線とJR学研都市線が利用可能。「ほしだ園地」の「星のブランコ（巨大吊り橋）」は絶景スポット。豊かな自然の中で、のびのびと子育てをしたい人に最適です。',

  // 大阪府（残りのエリア）
  '堺市中区': '泉北ニュータウンの一角を形成しつつ、古い集落も残る多様性のある街。泉北高速鉄道（深井駅など）が利用可能。大型スーパーや病院が揃い、生活利便性は良好。落ち着いた住宅街が広がり、ファミリー層に人気です。',
  '堺市東区': '美原町との合併前からの歴史ある地域。南海高野線（北野田駅など）が利用可能。初芝エリアは学校が多く、教育環境が良好。「ベルヒル農園」など農業体験施設もあり、自然と触れ合いながら暮らせます。',
  '堺市西区': '南海本線（石津川駅など）沿線に広がる住宅街。浜寺公園は明治の森として知られる美しい松林があり、プールやばら庭園も人気。難波へのアクセスも良く、関西国際空港にも近いため、旅行や出張が多い人にも便利な立地です。',
  '堺市美原区': '堺市の中で最も新しい区。富田林市と隣接し、のどかな田園風景が広がります。近鉄南大阪線（河内松原駅）が最寄りで、車での移動が中心。家賃相場が手頃で、静かな環境を求める人に適しています。',
  '泉大津市': '毛布の産地として有名で、繊維産業が盛ん。南海本線（泉大津駅）は特急停車駅で、難波まで約30分。「テクスピア大阪」などの商業施設があり、駅前は整備されています。海が近く、開放的な雰囲気が魅力です。',
  '貝塚市': '水間観音や貝塚御坊など歴史的な寺社が多い街。南海本線（貝塚駅）と水間鉄道が利用可能。「イオンモール堺鉄砲町」も近く、買い物環境が良好。奥水間の山間部は自然豊かで、温泉やハイキングが楽しめます。',
  '守口市': '京阪本線（守口市駅）と地下鉄谷町線が利用でき、大阪市内へのアクセスが抜群。駅周辺には京阪百貨店やイオンがあり、商業施設が充実。パナソニック発祥の地でもあり、企業関連の住宅や社宅も多いエリアです。',
  '泉佐野市': '「関西国際空港」の玄関口。海外旅行や出張が多い人には最高の立地です。南海本線（泉佐野駅）やJR阪和線（日根野駅）が利用可能。「りんくうプレミアム・アウトレット」は西日本最大級の規模。海鮮市場も充実しています。',
  '富田林市': '「寺内町」は江戸時代の街並みが残る重要伝統的建造物群保存地区。近鉄長野線（富田林駅）や南大阪線が利用可能。PL教団の本部「PL塔」があり、花火芸術で有名。自然と歴史が調和した落ち着いた街です。',
  '河内長野市': '金剛山の麓に広がる自然豊かな街。南海高野線や近鉄長野線が利用でき、難波まで約30分。観心寺や金剛寺などの古刹も多く、ハイキングや温泉も楽しめます。大阪市内へ通勤しながら田舎暮らしを楽しみたい人に最適です。',
  '柏原市': 'ぶどうの産地として有名で、秋にはぶどう狩りが盛ん。JR大和路線や近鉄大阪線が利用でき、天王寺や難波へのアクセスも良好。亀の瀬や玉手山公園など自然環境も豊か。静かな住宅街が広がる住みやすい街です。',
  '羽曳野市': '世界遺産「百舌鳥・古市古墳群」の一部があり、応神天皇陵などの巨大古墳が点在。近鉄南大阪線（古市駅）が利用可能。ぶどうやいちじくの産地でもあります。歴史ロマンを感じながら暮らせる街です。',
  '摂津市': '大阪モノレールや阪急京都線（摂津市駅など）が利用でき、新大阪や梅田へのアクセスが良好。「ららぽーとEXPOCITY」も近く、買い物環境が充実。工業団地もあり、働く場所も多い住宅・産業の複合都市です。',
  '高石市': '南海本線（高石駅）や羽衣線が利用可能。「高石海浜公園」は釣りやバーベキューが楽しめる人気スポット。浜寺公園も近く、緑豊かな環境。堺市や大阪市に近いベッドタウンとして発展しています。',
  '藤井寺市': '「藤井寺」は西国三十三所の札所で、歴史ある寺社が多い街。近鉄南大阪線（藤井寺駅）で阿倍野橋まで約15分。古墳も多く残り、歴史を感じられます。コンパクトな街で生活しやすく、落ち着いた雰囲気が魅力です。',
  '泉南市': '関西国際空港に近く、「りんくう公園」には美しいマーブルビーチが広がります。JR阪和線（和泉砂川駅など）が利用可能。「イオンモールりんくう泉南」は西日本最大級の規模。海辺の暮らしと都市機能を両立できます。',
  '大阪狭山市': '「狭山池」は日本最古のダム式ため池とされ、桜の名所。南海高野線（大阪狭山市駅）が利用可能。市域がコンパクトで、住宅街が整然と広がります。教育環境が良く、ファミリー層に人気の落ち着いた街です。',
  '阪南市': '大阪府最南端に位置し、「せんなん里海公園」などビーチが多い海の街。南海本線（尾崎駅など）が利用可能。「山中渓」は桜の名所で、ハイキングコースも充実。自然に囲まれたゆったりとした暮らしが送れます。',

  // --- 愛知県 ---
  '名古屋市千種区': '東山動植物園や星ヶ丘テラスがあり、洗練された雰囲気と豊かな自然が共存する人気の区です。覚王山エリアはおしゃれなカフェや雑貨店が多く、散策が楽しい街。文教地区としても知られ、教育環境を重視するファミリー層に支持されています。',
  '名古屋市東区': 'ナゴヤドーム（バンテリンドーム）や徳川園がある歴史と文化の街。白壁・主税町エリアは武家屋敷の面影を残す高級住宅街です。栄や名駅へのアクセスも良く、都会的な暮らしと落ち着いた住環境の両方を享受できます。',
  '名古屋市北区': '名城公園や庄内川の河川敷など、緑豊かなスポットが多いエリアです。地下鉄名城線や上飯田線が利用でき、栄や大曽根へのアクセスが良好。北区役所周辺や黒川エリアは飲食店やスーパーが充実しており、生活しやすい環境です。',
  '名古屋市西区': '名古屋駅の北側に位置し、「ノリタケの森」や「イオンモール Nagoya Noritake Garden」などの再開発エリアが注目されています。円頓寺商店街のようなレトロな街並みも魅力。庄内緑地公園は広大で、休日のレジャーに最適です。',
  '名古屋市中村区': 'リニア中央新幹線の開業に向けて再開発が進む「名古屋駅」を擁する、東海地方の玄関口。超高層ビル群と、駅西側の昔ながらの商店街が対照的です。交通利便性は最強で、出張が多いビジネスマンや、都会の刺激を求める人に最適です。',
  '名古屋市中区': '名古屋最大の繁華街「栄」や「大須商店街」、官庁街を擁する都心部。久屋大通公園（レイヤードヒサヤオオドリパーク）は都会のオアシスとしてリニューアルされました。職住近接が可能で、ショッピングやグルメを日常的に楽しめます。',
  '名古屋市昭和区': '名古屋大学や南山大学などがある「学生の街」であり、高級住宅街としても知られる八事エリアを擁します。鶴舞公園は桜の名所。落ち着いた雰囲気とアカデミックな空気が漂い、治安も良いため、安心して暮らせるエリアです。',
  '名古屋市瑞穂区': 'パロマ瑞穂スポーツパークがあり、Jリーグ名古屋グランパスのホームタウンの一つ。山崎川の桜並木は「日本さくら名所100選」に選ばれた絶景です。閑静な住宅街が広がり、地下鉄桜通線と名城線が利用できるため利便性も高いです。',
  '名古屋市熱田区': '三種の神器の一つを祀る「熱田神宮」があり、緑豊かな杜が広がります。名鉄・JR・地下鉄が利用できる金山総合駅に近く、交通アクセスは抜群。白鳥庭園や名古屋国際会議場もあり、歴史と文化、自然が調和した街です。',
  '名古屋市中川区': '名古屋駅へのアクセスが良い割に家賃が手頃なエリア。中川運河沿いは「キャナルリゾート」などの再開発でおしゃれなスポットに変貌中。あおなみ線や近鉄、JR、地下鉄が利用でき、車移動もしやすい平坦な地形です。',
  '名古屋市港区': '「レゴランド・ジャパン」や「ららぽーと名古屋みなとアクルス」、「名古屋港水族館」など、大型レジャー施設が集結するベイエリア。再開発により活気あふれる街になりました。海風を感じながら、休日は家族で一日中楽しめます。',
  '名古屋市南区': '日本ガイシホールがあり、コンサートやイベントで賑わいます。JR東海道線、名鉄、地下鉄桜通線が通り、名古屋駅や金山駅へのアクセスが良好。呼続公園などの緑地もあり、下町情緒と利便性が共存する住みやすいエリアです。',
  '名古屋市守山区': '名古屋市内で最も自然が豊かな区の一つ。「東谷山フルーツパーク」や小幡緑地があり、四季折々の自然を楽しめます。ゆとりーとラインやJR中央線、名鉄瀬戸線が利用可能。コストコ守山倉庫店もオープンし、買い物の利便性が向上しました。',
  '名古屋市緑区': '「大高緑地」などの広大な公園があり、子育て世帯に大人気のエリア。JR東海道線（大高駅・南大高駅）や地下鉄桜通線（徳重駅）が利用可能。「イオンモール大高」などの商業施設も充実しており、新しい住宅が増え続けている活気ある街です。',
  '名古屋市名東区': '転勤族が多く住むエリアとして知られ、社宅やマンションが多いです。地下鉄東山線（藤が丘駅・一社駅）で栄・名駅へ直通アクセス。藤が丘駅周辺はおしゃれな店が多く、並木道が美しい街並み。「牧野ヶ池緑地」もあり、住環境は抜群です。',
  '名古屋市天白区': '天白川が流れ、農業センター（delaふぁーむ）のしだれ梅が有名。地下鉄鶴舞線（植田駅・平針駅）が利用でき、豊田市方面への通勤にも便利。大学キャンパスも多く、学生とファミリーが共存する活気ある街です。',
  '豊橋市': '愛知県南東部の中核都市。新幹線停車駅であり、東京・大阪方面へのアクセスも良好。路面電車が走る街並みは風情があります。「のんほいパーク（豊橋総合動植物公園）」は動物園・植物園・遊園地が一体となった人気スポット。手筒花火発祥の地でもあります。',
  '岡崎市': '徳川家康生誕の地であり、岡崎城や八丁味噌の蔵など歴史的な魅力にあふれています。名鉄（東岡崎駅）やJR（岡崎駅）が利用可能。「イオンモール岡崎」は県内屈指の規模。乙川沿いの桜並木や花火大会など、四季を通じて楽しめる街です。',
  '一宮市': '「モーニング発祥の地」として知られ、喫茶店文化が根付いています。JR東海道線（尾張一宮駅）で名古屋駅まで快速で約10分という驚異的なアクセスの良さ。駅ビルや商店街も充実しており、ベッドタウンとして非常に人気があります。',
  '春日井市': '「サボテンのまち」として有名。JR中央線（勝川駅・春日井駅）で名古屋駅までアクセス良好。勝川駅周辺は再開発で綺麗になり、住みやすさが向上しました。落合公園などの大きな公園もあり、子育て支援も充実しています。',
  '豊田市': '「クルマのまち」として世界的に有名な企業城下町。豊田市駅周辺は百貨店や映画館、スタジアムなどが集積し、都市機能が非常に充実しています。一方で、香嵐渓などの豊かな自然も市内にあり、紅葉の季節は多くの観光客で賑わいます。',
  '安城市': '「日本のデンマーク」と呼ばれ、農業公園「デンパーク」があります。JR東海道線（安城駅・三河安城駅）が利用でき、三河安城駅には新幹線も停車。名古屋へのアクセスも良く、住みよさランキングで上位に入る人気の街です。',
  '刈谷市': 'トヨタグループの主要企業が集まる産業都市。JR東海道線（刈谷駅）は快速停車駅で名古屋まで約20分。「刈谷ハイウェイオアシス」は観覧車や温泉があり、一般道からも利用できる人気スポット。財政が豊かで公共サービスが充実しています。',
  '小牧市': '小牧山城（小牧山）がシンボル。名古屋高速や東名高速のICがあり、車でのアクセスが非常に便利です。県営名古屋空港にも近く、空の旅も身近。子育て支援に力を入れており、新しい図書館「ラピオ」などが市民に親しまれています。',
  '稲沢市': '「国府宮はだか祭」で有名な国府宮神社があります。JR東海道線（稲沢駅）で名古屋駅まで約10分。「リーフウォーク稲沢」などのショッピングモールがあり、買い物に便利。植木・苗木の産地としても知られ、緑豊かな環境です。',
  '東海市': '製鉄所がある工業都市ですが、聚楽園公園の大仏や大池公園など、緑も豊富です。名鉄常滑線（太田川駅）周辺は再開発で芸術劇場などが整備され、綺麗になりました。名古屋駅まで特急で約15分とアクセスも良好です。',
  '長久手市': '「日本一若いまち」として知られ、平均年齢が若く活気があります。「愛・地球博記念公園（モリコロパーク）」には「ジブリパーク」が開業し、世界中から注目されています。IKEAやイオンモールもあり、おしゃれで便利な暮らしが叶います。',
  '日進市': '名古屋市の東側に隣接し、地下鉄鶴舞線（赤池駅）や名鉄豊田線が利用可能。「プライムツリー赤池」などの商業施設が人気。大学が多く、アカデミックな雰囲気と田園風景が調和した、住み心地の良いベッドタウンです。',
  '豊川市': '日本三大稲荷の一つ「豊川稲荷」の門前町。B級グルメ「豊川いなり寿司」が有名です。名鉄とJRが利用でき、豊橋や名古屋へのアクセスも可能。本宮山などの自然もあり、歴史と自然を感じながら暮らせる街です。',
  '江南市': '藤の名所「曼陀羅寺公園」があり、春には藤まつりで賑わいます。名鉄犬山線（江南駅）で名古屋駅まで特急で約20分。平坦な地形で自転車移動が楽。ベッドタウンとして住宅開発が進み、住みやすい環境が整っています。',

  // 愛知県（残りのエリア）
  '瀬戸市': '「瀬戸焼」で有名な陶磁器の街。瀬戸蔵や窯垣の小径など、焼き物文化を体感できるスポットが多数。名鉄瀬戸線（尾張瀬戸駅）が利用可能。山に囲まれた自然豊かな環境で、工芸好きには特におすすめの街です。',
  '半田市': 'ミツカンの本社があり、「ミツカンミュージアム」では酢の歴史を学べます。JR武豊線や名鉄河和線が利用可能。「半田運河」は蔵が並ぶレトロな景観。春の山車まつりは有名で、活気ある伝統文化が根付いています。',
  '津島市': '「津島神社」は尾張津島天王祭で知られ、ユネスコ無形文化遺産に登録。名鉄津島線（津島駅）が利用可能。歴史ある街並みと田園風景が広がり、のどかな雰囲気。家賃相場も手頃で、落ち着いて暮らせます。',
  '碧南市': '「へきなん」と読む、海沿いの工業都市。名鉄三河線が利用可能。「明石公園」は桜の名所で、観覧車もあります。釣りやマリンスポーツが楽しめる海辺の環境と、温暖な気候が魅力です。',
  '西尾市': '「抹茶の街」として有名で、西尾茶は全国的なブランド。名鉄西尾線・蒲郡線が利用可能。一色のうなぎも特産品。三河湾に面し、海の幸が豊富。歴史ある城下町の風情と、海の自然を楽しめます。',
  '蒲郡市': '「蒲郡温泉郷」があり、三河湾を望む景観が美しいリゾート地。JR東海道線と名鉄蒲郡線が利用可能。「ラグーナテンボス」はテーマパークと温泉が融合したエンタメスポット。海辺の暮らしを満喫できます。',
  '犬山市': '「国宝犬山城」や「明治村」「リトルワールド」など観光資源が豊富。名鉄犬山線が利用可能。木曽川の鵜飼いも有名。歴史と文化が息づき、観光客で賑わいながらも、落ち着いた住環境が整っています。',
  '常滑市': '「常滑焼」の産地で、やきもの散歩道は情緒あふれる観光スポット。中部国際空港（セントレア）があり、空の旅が身近。名鉄常滑線が利用可能。招き猫の生産でも有名で、独特の文化が魅力です。',
  '大府市': '「健康都市」を掲げ、ウォーキングコースや健康施設が充実。JR東海道線（大府駅）が利用可能で、名古屋まで快速で約15分。トヨタ系企業も多く、工業と住宅が調和。住みよさランキングでも高評価の街です。',
  '知多市': '知多半島の中央に位置し、新舞子マリンパークは人工海浜があり、ウィンドサーフィンやBBQで賑わう人気スポット。名鉄常滑線と車でのアクセスが良く、自然と都市機能が調和。梅の名所「佐布里池」周辺は散策に最適で、四季折々の自然を感じながら、のびのびと暮らせます。',
  '知立市': 'かつての東海道の宿場町で、交通の要衝。名鉄名古屋本線・三河線が交わる知立駅は高架化事業が進行中で、さらなる発展が期待されます。「知立神社」のかきつばたや「大あんまき」も有名。名古屋へのアクセスが良く、国道1号・23号も近いため、電車・車ともに利便性が高い街です。',
  '尾張旭市': '名古屋市に隣接し、通勤・通学に便利なベッドタウン。名鉄瀬戸線で栄まで直通。「愛知県森林公園」は広大な敷地に植物園や運動施設があり、市民の憩いの場。「紅茶のまち」としても知られ、美味しい紅茶が楽しめるカフェが点在。閑静な住宅街で子育て環境も良好です。',
  '高浜市': '日本一の生産量を誇る「三州瓦」の産地。名鉄三河線が利用可能。コンパクトな市域にスーパーや病院が揃い、平坦な地形で自転車移動も楽。「かわら美術館」や海沿いの遊歩道など、散策スポットも充実。衣浦港の工業地帯に近く、職住近接を求める人にも適しています。',
  '岩倉市': '県内で最も面積が小さい市ですが、名鉄犬山線（岩倉駅）で名駅・伏見など都心へ約15分とアクセス抜群。五条川の桜並木は「日本さくら名所100選」に選ばれ、春には多くの人で賑わいます。生活利便施設がコンパクトにまとまり、子育て世帯や若者に人気の高いエリアです。',
  '豊明市': '織田信長が今川義元を破った「桶狭間の戦い」の古戦場伝説地がある歴史の街。名鉄名古屋本線（前後駅・豊明駅）が利用可能。藤田医科大学病院という高度医療機関があり安心。中京競馬場があることでも知られます。緑豊かで静かな住環境と、名古屋への近さが魅力です。',
  '田原市': '渥美半島に位置し、三方を海に囲まれたリゾートのような街。「伊良湖岬」や「恋路ヶ浜」は絶景スポットとして有名。農業産出額が全国トップクラスで、新鮮な野菜や果物が手に入ります。サーフィンの聖地としても知られ、海のあるスローライフを楽しみたい人に最適です。',
  '愛西市': '木曽川下流の水郷地帯で、レンコンの生産が盛ん。「道の駅 立田ふれあいの里」では蓮根グルメが楽しめます。名鉄津島線・尾西線が利用可能。「船頭平閘門」などの治水遺産も。広大な田園風景と豊かな水辺の自然に囲まれ、ゆったりとした時間が流れる街です。',
  '清須市': '織田信長の天下取りの出発点「清洲城」がシンボル。JR東海道線と名鉄名古屋本線が利用でき、名古屋駅まで約10分という驚異的な便利さ。五条川や庄内川が流れ、河川敷は散策コースに最適。キリンビール名古屋工場もあり、産業と歴史が融合した活気ある街です。',
  '北名古屋市': '名古屋市の北側に隣接し、地下鉄鶴舞線直通の名鉄犬山線が利用可能で、伏見・丸の内方面への通勤も便利。平坦な地形で、「師勝」「西春」エリアを中心に住宅開発が進んでいます。スーパーやドラッグストアが多く、生活コストを抑えつつ便利に暮らせる人気のエリアです。',
  '弥富市': '日本有数の金魚の産地として知られ、金魚すくいの大会も開催されます。近鉄・JR・名鉄の3路線が利用でき、名古屋・三重方面へのアクセスが良好。伊勢湾岸道のICもあり車移動も便利。「海南こどもの国」などの公園も充実しており、ファミリー層に適した住環境です。',
  'みよし市': 'トヨタ自動車の工場があり、財政力が豊かで公共施設や子育て支援が充実。名鉄豊田線と地下鉄鶴舞線がつながっており、名古屋・豊田の両方へアクセス可能。「三好公園」や「保田ヶ池公園」ではカヌーやスポーツが楽しめます。緑が多く、整備された美しい街並みが魅力です。',
  'あま市': '名古屋駅まで電車で約15分という近さにありながら、家賃相場が手頃な穴場エリア。名鉄津島線が利用可能。甚目寺観音や七宝焼アートヴィレッジなど文化的なスポットも。平坦な地形で宅地開発が進み、新しい住宅と田園風景が混在する、静かで住みやすい街です。',

  // --- 福岡県 ---
  '福岡市博多区': '九州の陸の玄関口「博多駅」と空の玄関口「福岡空港」を擁する、交通とビジネスの拠点。キャナルシティ博多や中洲の屋台街など、観光スポットも満載。新幹線通勤も可能で、バリバリ働くビジネスマンに最適なエネルギッシュな街です。',
  '福岡市中央区': '九州最大の繁華街「天神」や、おしゃれな店が並ぶ「大名」「薬院」があるトレンド発信地。大濠公園や舞鶴公園などの広大な緑地もあり、都会の利便性と豊かな自然環境が奇跡的に共存しています。「住みたい街」として圧倒的な人気を誇ります。',
  '福岡市東区': '「海の中道海浜公園」や「マリンワールド海の中道」があり、レジャー環境が抜群。香椎・千早エリアは再開発でタワーマンションや商業施設が整備され、近代的な街並みに。JRと西鉄が並走しており、博多・天神へのアクセスも良好です。',
  '福岡市西区': '「姪浜」は地下鉄空港線の始発駅で、天神・博多・空港へ座って一本でアクセス可能。「マリノアシティ福岡」などのアウトレットモールも人気。九州大学の伊都キャンパスがあり、学園都市として発展中。海も山も近く、自然環境は最高です。',
  '福岡市南区': '西鉄天神大牟田線（大橋駅など）沿線に広がる住宅街。大橋駅は特急停車駅で、天神まで約5分という近さ。駅ビルがリニューアルされ、さらに便利になりました。平尾や高宮などはおしゃれなカフェやパン屋が多く、女性に人気のエリアです。',
  '福岡市城南区': '福岡大学があり、学生が多く活気ある街。地下鉄七隈線（別府駅・七隈駅）の延伸により、博多駅へのアクセスが飛躍的に向上しました。油山などの自然も身近で、閑静な住宅街が広がっています。家賃相場も比較的リーズナブルです。',
  '福岡市早良区': '「西新」は商店街が活気にあふれ、文教地区としても有名で修猷館高校などがあります。「福岡タワー」や「福岡PayPayドーム」がある百道浜エリアは、近未来的な景観とビーチが広がる人気のウォーターフロント。多様な魅力を持つ区です。',
  '北九州市小倉北区': '北九州市の中心で、小倉駅には新幹線が停車します。小倉城や旦過市場、リバーウォーク北九州など、観光・商業スポットが集積。「あるあるCity」などポップカルチャーの発信地でもあります。都市機能がコンパクトにまとまった住みやすい街です。',
  '北九州市八幡西区': '黒崎駅を中心とした副都心エリアと、折尾などの学園都市エリアがあります。JR鹿児島本線や筑豊電鉄が利用可能。住宅地が多く、ベッドタウンとして機能しています。コストコ北九州倉庫店もあり、買い物環境も充実しています。',
  '北九州市門司区': '「門司港レトロ」地区は、大正ロマン漂う歴史的建造物が並ぶ人気の観光地。関門海峡を望む景色は絶景です。焼きカレーなどのグルメも有名。九州の鉄道の起点としての歴史を持ち、落ち着いた雰囲気の中で暮らせます。',
  '久留米市': '福岡県第三の都市で、JR久留米駅には新幹線が停車します。ゴム産業の街として発展し、ブリヂストンの創業地。ラーメンや焼き鳥などのB級グルメが豊富で、食のレベルが高い街です。筑後川が流れ、医療機関も多いため、安心して暮らせます。',
  '春日市': '福岡市に隣接し、日本一人口密度が高い市（東京23区を除く）として知られる人気のベッドタウン。JR（春日駅）と西鉄（春日原駅）が利用でき、天神・博多へのアクセスが抜群。「春日公園」などの大きな公園もあり、子育て環境が非常に良いです。',
  '大野城市': '福岡市の南に位置し、西鉄（下大利駅など）とJR（大野城駅）が並行して走る交通至便な街。九州自動車道のICもあり、車での移動も便利。まどかぴあなどの文化施設も充実。地形が細長く、どこに住んでも駅に近いのが特徴です。',
  '筑紫野市': '二日市温泉という歴史ある温泉地があり、日常的に温泉を楽しめます。JR（二日市駅）と西鉄（紫駅・西鉄二日市駅）が利用可能。「イオンモール筑紫野」は県内最大級の規模で、休日は多くの人で賑わいます。自然と利便性のバランスが良い街です。',
  '糸島市': '「輝く小さな街」ランキングで世界3位に選ばれたこともある、今最も注目されるエリア。美しい海岸線にはおしゃれなカフェや工房が点在し、サーファーや移住者に大人気。福岡市内へも電車で通える距離で、ロハスな生活が実現できます。',
  '宗像市': '世界遺産「神宿る島」宗像・沖ノ島と関連遺産群がある歴史ある街。JR鹿児島本線（赤間駅・東郷駅）で博多・小倉の両方へアクセス可能。教育大があり、文教地区の雰囲気も。ベッドタウンとして整備されており、住環境は良好です。',
  '福津市': '「宮地嶽神社」の「光の道」が嵐のCMで有名になりました。福間駅周辺は区画整理が進み、新しいマンションや商業施設が増加中。イオンモール福津もあり便利。福間海岸はウインドサーフィンのメッカで、海辺の暮らしを楽しめます。',
  '太宰府市': '「太宰府天満宮」の門前町として、年間を通して多くの参拝客が訪れます。西鉄太宰府線が利用可能。九州国立博物館もあり、歴史と文化の薫り高い街。令和ゆかりの地としても話題に。緑豊かで落ち着いた住環境です。',
  '飯塚市': '筑豊地方の中心都市。「シュガーロード」の経由地で、ひよ子本舗吉野堂など有名菓子店発祥の地。近畿大学産業理工学部などのキャンパスがあり、学生も多いです。家賃相場が安く、自然に囲まれたのんびりとした生活が送れます。',
  '大牟田市': 'かつての炭鉱の街で、世界遺産の宮原坑などがあります。西鉄とJRが乗り入れる大牟田駅が中心。「大牟田動物園」は動物福祉の取り組みで全国的に注目されています。独自の食文化や祭りがあり、地元愛の強い街です。',
  '柳川市': '「川下り」で有名な水郷の街。掘割が巡る美しい景観は必見です。北原白秋の生誕地でもあります。西鉄天神大牟田線（西鉄柳川駅）が利用可能。うなぎのせいろ蒸しは絶品。観光地の賑わいと、水辺の静けさが共存しています。',
  '行橋市': '北九州市のベッドタウンとして発展。JR日豊本線（行橋駅）は特急停車駅で、小倉や博多へアクセス可能。東九州自動車道の開通でさらに便利になりました。周防灘に面し、カキなどの海産物も豊富。住みよさランキングでも評価が高い街です。',

  // 福岡県（残りのエリア）
  '北九州市若松区': '洞海湾に面した港湾工業地帯と、響灘に面したビーチが共存。筑豊電鉄や若戸大橋でアクセス。「グリーンパーク」は大規模な公園で、カンガルーにも会えます。風力発電所など環境エネルギー産業も盛ん。海辺の開放的な暮らしが魅力です。',
  '北九州市戸畑区': '北九州市で最も面積が小さい区ですが、コンパクトシティとして機能的。JR戸畑駅は快速・特急の一部が停車し、小倉・博多へ便利。「戸畑祇園大山笠」はユネスコ無形文化遺産。図書館や美術館が集まる文教エリアもあり、落ち着いた住環境と利便性が両立しています。',
  '北九州市小倉南区': '北九州市で最大の面積を誇り、都市と自然が共存。北九州モノレールで小倉駅へ直結し、通勤・通学に便利。日本三大カルスト「平尾台」や菅生の滝など自然スポットが豊富。新興住宅地も多く、ファミリー層に人気のベッドタウンです。',
  '北九州市八幡東区': '世界遺産「官営八幡製鐵所」の関連施設があるものづくりの街。「スペースLABO」や「いのちのたび博物館」など文化施設が充実。皿倉山からの夜景は「新日本三大夜景」。ショッピングモールもあり、歴史、文化、自然、買い物がバランスよく揃っています。',
  '直方市': '遠賀川が流れる筑豊の中心都市。JR・平成筑豊鉄道・筑豊電鉄が乗り入れ、北九州方面へのアクセスが良好。春には河川敷にチューリップが咲き誇ります。イオンモール直方があり、買い物も便利。のどかな環境と都市への近さが魅力の街です。',
  '田川市': '炭鉱節発祥の地であり、ユネスコ記憶遺産の山本作兵衛の炭鉱画で知られます。ランドマークの「二本煙突」や「伊田竪坑櫓」ライトアップは幻想的。「田川ホルモン鍋」などのソウルフードも魅力。物価や家賃が安く、個性的な魅力を持つ街です。',
  '八女市': '最高級玉露「八女茶」の産地として名高い、歴史と文化の街。白壁の町並み保存地区にはカフェや雑貨店が増え、観光客で賑わいます。伝統工芸の仏壇や提灯も有名。豊かな自然と、情緒ある古い町並みの中で、スローライフを楽しみたい人に最適です。',
  '筑後市': '九州新幹線「筑後船小屋駅」があり、博多や鹿児島へのアクセスが可能。プロ野球ソフトバンクホークスのファーム本拠地「タマホームスタジアム筑後」があり、スポーツが身近。県営筑後広域公園などの大規模公園も整備され、活気ある田園都市です。',
  '大川市': '約480年の歴史を持つ日本一の家具産地。職人の技が息づき、インテリアにこだわる人にはたまらない街です。筑後川下流の平坦な地形で、昇開橋は重要文化財かつ映えスポット。新鮮な魚介類や海苔も美味しく、食も充実しています。',
  '豊前市': '福岡県の東端に位置し、大分県との県境。「豊前神楽」は国の重要無形民俗文化財。周防灘の「豊前海一粒かき」やカニは絶品。求菩提山や次郎坊天狗の伝説など修験道の歴史も。海と山の恵みを享受しながら、静かに暮らせるエリアです。',
  '中間市': '北九州市と福岡市の両方にアクセスしやすいベッドタウン。世界遺産「遠賀川水源地ポンプ室」があります。遠賀川河川敷は季節の花々が美しく、市民の憩いの場。スーパーや病院がコンパクトにまとまっており、車がなくても比較的暮らしやすい街です。',
  '小郡市': '交通の便が良く、福岡市の通勤圏として急速に発展。「カエル寺（如意輪寺）」は風鈴の名所で、インスタ映えスポットとして人気。西鉄電車を使えば天神まで約30分。宝満川沿いのサイクリングロードなどもあり、利便性と健康的な暮らしが叶います。',
  '古賀市': '博多駅までJR快速で約20分とアクセス抜群。「食のまち」として食品加工団地があり、直売所などのイベントが盛ん。古賀グリーンパークや海岸線でのレジャーも充実。子育て支援にも力を入れており、若い世代の移住が増えている注目の街です。',
  'うきは市': '「フルーツ王国」として、年中フルーツ狩りが楽しめます。「筑後吉井」の白壁の町並みにはおしゃれなカフェやショップが続々オープン。棚田の風景など日本の原風景が残ります。古民家リノベーションなども盛んで、感度の高い移住者に人気です。',
  '宮若市': 'トヨタ自動車関連企業が多く立地する工業都市で、財政が安定。「脇田温泉」や「所田温泉」があり、日常的に温泉を楽しめます。彼岸花の名所やホタルの舞う川など自然豊か。福岡市・北九州市の中間に位置し、両方面へアクセス可能です。',
  '嘉麻市': '遠賀川の源流に位置し、水と緑が豊かな街。ボルダリング施設やカヌー体験など、アウトドアアクティビティが充実。ブランド牛「嘉穂牛」の産地。キャンプ場もあり、自然の中でアクティブに遊び、暮らしたい人におすすめのエリアです。',
  '朝倉市': '「三連水車」や「秋月城跡」など観光名所が多く、「筑前の小京都」と称されます。原鶴温泉はW美肌の湯として有名。2017年の豪雨災害からの復興が進み、新しいコミュニティも形成されています。歴史、自然、温泉のある豊かな暮らしが実現できます。',
  'みやま市': 'セロリや高菜漬け、みかんなど農産物の宝庫。有明海に面し、干潟の風景が広がります。「清水寺本坊庭園」は国指定名勝。九州新幹線「筑後船小屋駅」にも近く便利。広大な田園風景の中で、食と自然に恵まれた穏やかな生活が送れます。',
  '那珂川市': '2018年に市制施行した新しい市。新幹線博多南線を使えば、博多駅までなんと8分・330円で行ける驚異の利便性。駅周辺は都会的ですが、南部には五ケ山ダムやキャンプ場など大自然が広がります。利便性と自然のバランスが最高の街です。',
};

// 特徴を自動的に割り当て（家賃に基づく）
function assignFeatures(rentByRoomType: RentByRoomType, areaName: string): string[] {
  // 定義済みの特徴があればそれを使用
  if (AREA_FEATURES[areaName]) {
    return AREA_FEATURES[areaName];
  }

  const features: string[] = [];
  
  // 有効な家賃のみで平均を計算
  const validRents = [rentByRoomType.oneRoom, rentByRoomType.oneLDK].filter((r): r is number => r !== null);
  
  if (validRents.length === 0) return ['cost_performance'];

  const avgRent = validRents.reduce((a, b) => a + b, 0) / validRents.length;

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

    // データ行をパース（例: "千代田区 15.18 万円" または "千代田区 -"）
    const match = trimmed.match(/^(.+?)\s+([\d.-]+)\s*(万円)?/);
    if (match) {
      const areaName = match[1].trim();
      const rentStr = match[2];
      
      let rent: number | null = null;
      if (rentStr !== '-') {
        rent = parseFloat(rentStr) * 10000; // 万円を円に変換
        rent = Math.round(rent);
      }

      if (!areas.has(areaName)) {
        areas.set(areaName, {});
      }
      const areaData = areas.get(areaName)!;
      areaData[currentRoomType] = rent;
      
      const displayRent = rent ? `${rent.toLocaleString()}円` : '-';
      console.log(`  ✓ ${areaName}: ${currentRoomType} = ${displayRent}`);
    }
  }

  // Area オブジェクトに変換
  const result: Area[] = [];
  for (const [areaName, rentData] of areas.entries()) {
    // 4つの間取りデータが揃っているもののみ（nullも許容）
    if (rentData.oneRoom === undefined || rentData.oneLDK === undefined || rentData.twoLDK === undefined || rentData.threeLDK === undefined) {
      console.warn(`⚠️  ${areaName}: データ不完全（スキップ）`);
      continue;
    }

    const rentByRoomType: RentByRoomType = {
      oneRoom: rentData.oneRoom ?? null,
      oneLDK: rentData.oneLDK ?? null,
      twoLDK: rentData.twoLDK ?? null,
      threeLDK: rentData.threeLDK ?? null,
    };

    // 有効な家賃のみで平均を計算
    const validRents = [rentByRoomType.oneRoom, rentByRoomType.oneLDK, rentByRoomType.twoLDK, rentByRoomType.threeLDK].filter((r): r is number => r !== null);
    
    const averageRent = validRents.length > 0
      ? Math.round(validRents.reduce((a, b) => a + b, 0) / validRents.length)
      : 0;

    const coords = COORDINATES[areaName] || { lat: 35.6762, lng: 139.6503, station: '最寄駅' };

    // min/max も有効な値から計算
    const minRent = validRents.length > 0 ? Math.min(...validRents) : 0;
    const maxRent = validRents.length > 0 ? Math.max(...validRents) : 0;

    // 詳細説明を取得
    const description = AREA_DESCRIPTIONS[areaName] || `${areaName}エリア。`;

    result.push({
      name: areaName,
      averageRent,
      minRent,
      maxRent,
      latitude: coords.lat,
      longitude: coords.lng,
      nearestStation: coords.station,
      distanceToStation: 10,
      description,
      features: assignFeatures(rentByRoomType, areaName), // assignFeatures も null 対応が必要
      rentByRoomType,
    });
  }

  return result;
}

// メイン処理
function main() {
  const dataDir = path.join(process.cwd(), 'data');
  const detailsDir = path.join(dataDir, 'details');
  
  if (!fs.existsSync(detailsDir)) {
    fs.mkdirSync(detailsDir, { recursive: true });
  }

  // 既存の prefectures.json を読み込み
  const prefecturesPath = path.join(dataDir, 'prefectures.json');
  const prefectures: Prefecture[] = JSON.parse(fs.readFileSync(prefecturesPath, 'utf-8'));

  // dataディレクトリ内の *_data.md ファイルを検索
  const files = fs.readdirSync(dataDir).filter(file => file.endsWith('_data.md'));
  
  if (files.length === 0) {
    console.log('⚠️ データファイル (*_data.md) が見つかりません');
    return;
  }

  console.log(`🔍 ${files.length} 個のデータファイルが見つかりました:`, files);

  for (const file of files) {
    // ファイル名から slug を推測 (例: tokyo_data.md -> tokyo)
    // ただし、oosaka_data.md -> osaka のようなマッピングが必要な場合もある
    // ここでは簡易的にファイル名のプレフィックスを使用し、必要ならマッピングを追加
    let slug = file.replace('_data.md', '');
    
    // 特殊なマッピング
    if (slug === 'oosaka') slug = 'osaka';
    if (slug === 'aiti') slug = 'aichi';

    console.log(`\n📖 ${file} を処理中 (slug: ${slug})...`);
    
    const filePath = path.join(dataDir, file);
    const areas = parseMarkdownData(filePath);
    console.log(`  -> ${areas.length} 件のエリアデータを検出`);
    
    if (areas.length === 0) {
      console.log(`⚠️ ${file}: 有効なエリアデータがありません`);
      continue;
    }

    const prefectureIndex = prefectures.findIndex(p => p.slug === slug);
    
    if (prefectureIndex !== -1) {
      // 間取り別平均家賃を計算
      const rentTotals = { oneRoom: 0, oneLDK: 0, twoLDK: 0, threeLDK: 0 };
      const rentCounts = { oneRoom: 0, oneLDK: 0, twoLDK: 0, threeLDK: 0 };

      areas.forEach(area => {
        if (area.rentByRoomType) {
          if (area.rentByRoomType.oneRoom !== null && area.rentByRoomType.oneRoom > 0) {
            rentTotals.oneRoom += area.rentByRoomType.oneRoom;
            rentCounts.oneRoom++;
          }
          if (area.rentByRoomType.oneLDK !== null && area.rentByRoomType.oneLDK > 0) {
            rentTotals.oneLDK += area.rentByRoomType.oneLDK;
            rentCounts.oneLDK++;
          }
          if (area.rentByRoomType.twoLDK !== null && area.rentByRoomType.twoLDK > 0) {
            rentTotals.twoLDK += area.rentByRoomType.twoLDK;
            rentCounts.twoLDK++;
          }
          if (area.rentByRoomType.threeLDK !== null && area.rentByRoomType.threeLDK > 0) {
            rentTotals.threeLDK += area.rentByRoomType.threeLDK;
            rentCounts.threeLDK++;
          }
        }
      });

      const prefectureRentByRoomType: RentByRoomType = {
        oneRoom: rentCounts.oneRoom > 0 ? Math.round(rentTotals.oneRoom / rentCounts.oneRoom) : 0,
        oneLDK: rentCounts.oneLDK > 0 ? Math.round(rentTotals.oneLDK / rentCounts.oneLDK) : 0,
        twoLDK: rentCounts.twoLDK > 0 ? Math.round(rentTotals.twoLDK / rentCounts.twoLDK) : 0,
        threeLDK: rentCounts.threeLDK > 0 ? Math.round(rentTotals.threeLDK / rentCounts.threeLDK) : 0,
      };

      // 都道府県データ更新
      prefectures[prefectureIndex].rentByRoomType = prefectureRentByRoomType;

      // 詳細データを個別のファイルに保存
      const detailData = {
        ...prefectures[prefectureIndex],
        areas: areas
      };
      
      const detailPath = path.join(detailsDir, `${slug}.json`);
      fs.writeFileSync(detailPath, JSON.stringify(detailData, null, 2), 'utf-8');
      console.log(`💾 data/details/${slug}.json に詳細データを保存しました`);
      
      // 平均家賃を再計算 (全体平均)
      const totalRent = areas.reduce((sum, area) => sum + area.averageRent, 0);
      const newAverageRent = Math.round(totalRent / areas.length);
      prefectures[prefectureIndex].averageRent = newAverageRent;
      console.log(`✅ ${prefectures[prefectureIndex].name}の平均家賃を更新: ${newAverageRent.toLocaleString()}円`);
      console.log(`   (1R: ${prefectureRentByRoomType.oneRoom ? prefectureRentByRoomType.oneRoom.toLocaleString() + '円' : '-'}, 1LDK: ${prefectureRentByRoomType.oneLDK ? prefectureRentByRoomType.oneLDK.toLocaleString() + '円' : '-'}, 2LDK: ${prefectureRentByRoomType.twoLDK ? prefectureRentByRoomType.twoLDK.toLocaleString() + '円' : '-'}, 3LDK: ${prefectureRentByRoomType.threeLDK ? prefectureRentByRoomType.threeLDK.toLocaleString() + '円' : '-'})`);
      
      // 軽量化のため areas を空にする
      prefectures[prefectureIndex].areas = [];
    } else {
      console.error(`❌ slug: ${slug} に対応する都道府県が prefectures.json に見つかりません`);
    }
  }

  // prefectures.json を保存
  fs.writeFileSync(prefecturesPath, JSON.stringify(prefectures, null, 2), 'utf-8');
  console.log('\n💾 prefectures.json (軽量版) を保存しました');
}

main();
