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

// ... (中略) ...

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

    result.push({
      name: areaName,
      averageRent,
      minRent,
      maxRent,
      latitude: coords.lat,
      longitude: coords.lng,
      nearestStation: coords.station,
      distanceToStation: 10,
      description: `${areaName}エリア。`,
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
