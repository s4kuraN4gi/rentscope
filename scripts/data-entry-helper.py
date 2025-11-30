#!/usr/bin/env python3
"""
家賃データ収集ヘルパースクリプト

このスクリプトは、公開されている家賃相場サイトから
手動でデータを収集する際のヘルパーツールです。

使用方法:
1. 対象サイトにアクセス
2. 家賃データを手動でコピー
3. このスクリプトにペースト
4. JSON形式で出力

注意: スクレイピングではなく、手動データ入力を支援するツールです
"""

import json
import sys
from typing import Dict, List

def create_area_template() -> Dict:
    """エリアデータのテンプレートを作成"""
    return {
        "name": "",
        "averageRent": 0,
        "minRent": 0,
        "maxRent": 0,
        "latitude": 0.0,
        "longitude": 0.0,
        "nearestStation": "",
        "distanceToStation": 0,
        "description": "",
        "rentByRoomType": {
            "oneRoom": 0,
            "oneLDK": 0,
            "twoLDK": 0,
            "threeLDK": 0
        }
    }

def create_prefecture_template() -> Dict:
    """都道府県データのテンプレートを作成"""
    return {
        "id": 0,
        "name": "",
        "slug": "",
        "region": "",
        "averageRent": 0,
        "latitude": 0.0,
        "longitude": 0.0,
        "population": 0,
        "description": "",
        "areas": []
    }

def interactive_data_entry():
    """対話式でデータを入力"""
    print("🏠 RentScope データ入力ヘルパー\n")
    
    prefectures = []
    
    while True:
        print("\n" + "="*50)
        pref = create_prefecture_template()
        
        pref["id"] = len(prefectures) + 1
        pref["name"] = input("都道府県名 (例: 東京都): ").strip()
        if not pref["name"]:
            break
            
        pref["slug"] = input("スラッグ (例: tokyo): ").strip()
        pref["region"] = input("地方 (例: 関東): ").strip()
        pref["averageRent"] = int(input("平均家賃 (円): ").strip())
        
        print("\nエリアデータを入力してください")
        areas = []
        
        while True:
            print("\n" + "-"*30)
            area = create_area_template()
            
            area["name"] = input("  エリア名 (例: 港区, 空白で終了): ").strip()
            if not area["name"]:
                break
                
            area["averageRent"] = int(input("  平均家賃: ").strip())
            area["minRent"] = int(input("  最低家賃: ").strip())
            area["maxRent"] = int(input("  最高家賃: ").strip())
            
            print("  間取り別家賃:")
            area["rentByRoomType"]["oneRoom"] = int(input("    ワンルーム: ").strip())
            area["rentByRoomType"]["oneLDK"] = int(input("    1LDK: ").strip())
            area["rentByRoomType"]["twoLDK"] = int(input("    2LDK: ").strip())
            area["rentByRoomType"]["threeLDK"] = int(input("    3LDK: ").strip())
            
            areas.append(area)
        
        pref["areas"] = areas
        prefectures.append(pref)
        
        cont = input("\n別の都道府県を追加しますか? (y/n): ").strip().lower()
        if cont != 'y':
            break
    
    return prefectures

def save_to_json(data: List[Dict], filename: str = "prefectures.json"):
    """データをJSONファイルに保存"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ データを {filename} に保存しました")
    print(f"📊 都道府県数: {len(data)}")
    total_areas = sum(len(p['areas']) for p in data)
    print(f"📍 エリア数: {total_areas}")

def main():
    """メイン処理"""
    print("データ入力方法を選択してください:")
    print("1. 対話式入力")
    print("2. テンプレート出力")
    
    choice = input("\n選択 (1 or 2): ").strip()
    
    if choice == "1":
        data = interactive_data_entry()
        if data:
            save_to_json(data)
    elif choice == "2":
        # テンプレートを出力
        template = [create_prefecture_template()]
        template[0]["areas"] = [create_area_template()]
        print("\n" + json.dumps(template, ensure_ascii=False, indent=2))
        print("\n上記のテンプレートをコピーして使用してください")
    else:
        print("無効な選択です")

if __name__ == "__main__":
    main()
