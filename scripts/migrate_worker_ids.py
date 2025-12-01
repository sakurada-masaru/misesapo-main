#!/usr/bin/env python3
"""
Workers（従業員）のIDを新しい形式にマイグレーションするスクリプト
- 古いID形式（数値、W001形式）を新しい形式（W + タイムスタンプ）に変換
- 意味をなしていないユーザー（名前が「ユーザー1」など）を削除
"""

import json
import boto3
from datetime import datetime
import sys

# DynamoDBクライアントの初期化
dynamodb = boto3.resource('dynamodb', region_name='ap-northeast-1')
WORKERS_TABLE = dynamodb.Table('workers')

# APIエンドポイント
API_BASE = 'https://51bhoxkbxd.execute-api.ap-northeast-1.amazonaws.com/prod'

def generate_new_id():
    """新しいIDを生成（W + タイムスタンプ）"""
    return 'W' + str(int(datetime.utcnow().timestamp() * 1000))

def is_invalid_user(user):
    """意味をなしていないユーザーかどうかを判定"""
    name = user.get('name', '').strip()
    
    # 名前が空、または「ユーザー」+ 数字のみの場合は無効
    if not name:
        return True
    
    # 「ユーザー1」「ユーザー2」などのパターンを検出
    if name.startswith('ユーザー') and len(name) <= 5:
        try:
            int(name.replace('ユーザー', ''))
            return True
        except:
            pass
    
    # メールアドレスもなく、名前も意味をなしていない場合
    email = user.get('email', '').strip()
    if not email and len(name) < 2:
        return True
    
    return False

def migrate_workers():
    """WorkersのIDをマイグレーション"""
    print("=== Workers ID マイグレーション開始 ===\n")
    
    # 1. 現在のデータを取得（APIから）
    import urllib.request
    try:
        with urllib.request.urlopen(f"{API_BASE}/workers") as response:
            data = json.loads(response.read().decode())
            workers = data if isinstance(data, list) else data.get('items', data.get('workers', []))
    except Exception as e:
        print(f"APIからデータを取得できませんでした: {e}")
        print("DynamoDBから直接取得を試みます...")
        response = WORKERS_TABLE.scan()
        workers = response.get('Items', [])
    
    print(f"取得したユーザー数: {len(workers)}件\n")
    
    # 2. 無効なユーザーを特定
    invalid_users = []
    valid_users = []
    
    for worker in workers:
        if is_invalid_user(worker):
            invalid_users.append(worker)
        else:
            valid_users.append(worker)
    
    print(f"有効なユーザー: {len(valid_users)}件")
    print(f"削除対象のユーザー: {len(invalid_users)}件")
    
    if invalid_users:
        print("\n削除対象のユーザー:")
        for u in invalid_users:
            print(f"  - ID: {u.get('id')}, 名前: {u.get('name')}, メール: {u.get('email')}")
    
    # 3. 確認
    print("\n=== マイグレーション内容 ===")
    print(f"1. 有効なユーザー {len(valid_users)}件のIDを確認（既に適切な形式の場合はそのまま）")
    print(f"2. 無効なユーザー {len(invalid_users)}件を削除")
    
    # 非対話式で実行（--yes フラグがある場合は確認をスキップ）
    import sys
    if '--yes' not in sys.argv:
        response = input("\n実行しますか？ (yes/no): ")
        if response.lower() != 'yes':
            print("キャンセルしました。")
            return
    
    # 4. 無効なユーザーを削除
    print("\n=== 無効なユーザーを削除中 ===")
    for user in invalid_users:
        old_id = user.get('id')
        try:
            WORKERS_TABLE.delete_item(Key={'id': str(old_id)})
            print(f"✓ 削除: ID {old_id} ({user.get('name', 'N/A')})")
        except Exception as e:
            print(f"✗ 削除失敗: ID {old_id} - {e}")
    
    # 5. 有効なユーザーのIDを確認・更新
    print("\n=== 有効なユーザーのIDを確認中 ===")
    migration_map = {}  # 旧ID -> 新IDのマッピング
    updated_count = 0
    skipped_count = 0
    
    for user in valid_users:
        old_id = str(user.get('id'))
        
        # 既に新しい形式（W + タイムスタンプ）の場合はスキップ
        if old_id.startswith('W') and len(old_id) > 10 and old_id[1:].isdigit():
            skipped_count += 1
            print(f"○ スキップ（既に新形式）: {old_id} ({user.get('name', 'N/A')})")
            continue
        
        # W001形式のIDもそのまま残す（既に適切な形式）
        if old_id.startswith('W') and len(old_id) <= 5:
            skipped_count += 1
            print(f"○ スキップ（W001形式）: {old_id} ({user.get('name', 'N/A')})")
            continue
        
        # 数値IDやその他の形式の場合は新しい形式に変換
        new_id = generate_new_id()
        migration_map[old_id] = new_id
        
        # 新しいIDでデータを更新
        user['id'] = new_id
        user['updated_at'] = datetime.utcnow().isoformat() + 'Z'
        
        # 古いIDのデータを削除
        try:
            WORKERS_TABLE.delete_item(Key={'id': old_id})
        except Exception as e:
            print(f"警告: 古いID {old_id} の削除に失敗: {e}")
        
        # 新しいIDでデータを保存
        try:
            WORKERS_TABLE.put_item(Item=user)
            print(f"✓ 更新: {old_id} -> {new_id} ({user.get('name', 'N/A')})")
            updated_count += 1
        except Exception as e:
            print(f"✗ 更新失敗: {old_id} -> {new_id} - {e}")
    
    # 6. マイグレーションマップを保存
    with open('worker_id_migration_map.json', 'w', encoding='utf-8') as f:
        json.dump(migration_map, f, ensure_ascii=False, indent=2)
    
    print(f"\n=== マイグレーション完了 ===")
    print(f"更新: {updated_count}件")
    print(f"スキップ: {skipped_count}件")
    print(f"削除: {len(invalid_users)}件")
    if migration_map:
        print(f"マイグレーションマップを保存: worker_id_migration_map.json")

if __name__ == '__main__':
    migrate_workers()

