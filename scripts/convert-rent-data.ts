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
  // --- 埼玉県 ---
  'さいたま市大宮区': '「埼玉の玄関口」として知られる大宮駅を擁し、新幹線を含む多数の路線が利用可能な交通の要衝です。駅周辺にはルミネ、エキュート、そごう、高島屋などの大型商業施設が立ち並び、ショッピングやグルメには事欠きません。一方で、駅から少し離れると「氷川神社」の広大な杜や「大宮公園」があり、豊かな自然と歴史を感じられる環境も魅力。都会的な利便性と落ち着いた住環境が共存する、県内屈指の人気エリアです。',
  'さいたま市浦和区': '古くから「文教地区」として知られ、公立校のレベルが高いことで有名です。教育熱心なファミリー層からの支持が絶大で、治安も非常に良好。浦和駅周辺にはパルコやアトレ、伊勢丹があり、洗練された街並みが広がります。東京駅や新宿駅へも湘南新宿ライン・上野東京ラインで短時間でアクセスでき、都内通勤者にも最適なベッドタウンです。',
  '川口市': '荒川を挟んで東京都北区に隣接し、京浜東北線で赤羽まで一駅という圧倒的なアクセスの良さが魅力です。川口駅周辺は再開発が進み、アリオ川口やキュポ・ラなどの商業施設、高層マンションが林立しています。一方で、「川口市立グリーンセンター」のような広大な公園もあり、子育て環境も整備されています。「本当に住みやすい街大賞」で上位にランクインするなど、近年注目度が急上昇しているエリアです。',
  '川越市': '「小江戸」と呼ばれる蔵造りの街並みが有名で、年間を通して多くの観光客が訪れる歴史ある街です。川越駅・本川越駅周辺はクレアモール商店街やアトレなどの商業施設が充実しており、生活利便性も抜群。池袋まで東武東上線急行で約30分、新宿へも西武新宿線やJR埼京線でアクセス可能と、都心への通勤圏内でありながら、独自の文化と風情を楽しめる街です。',
  '所沢市': '西武池袋線と西武新宿線の2路線が交差するターミナル駅・所沢駅を中心に発展しています。駅直結の「グランエミオ所沢」などの商業施設に加え、日本最大級のポップカルチャー発信拠点「ところざわサクラタウン」も話題。広大な敷地を誇る「所沢航空記念公園」は市民の憩いの場となっており、自然環境も豊か。都心へのアクセスと住環境のバランスが良く、ファミリー層に人気です。',
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
