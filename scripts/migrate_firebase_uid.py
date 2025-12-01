#!/usr/bin/env python3
"""
既存ユーザーのFirebase UIDをDynamoDBに紐付けるマイグレーションスクリプト

使用方法:
1. Firebase Consoleからサービスアカウントキーを取得
2. scripts/firebase-service-account.json に保存
3. pip install firebase-admin boto3
4. python3 scripts/migrate_firebase_uid.py
"""

import json
import boto3
import sys
import os
from pathlib import Path

# Firebase Admin SDKのインポート
try:
    import firebase_admin
    from firebase_admin import credentials, auth
except ImportError:
    print("❌ エラー: firebase-admin がインストールされていません")
    print("   pip install firebase-admin を実行してください")
    sys.exit(1)

# DynamoDBクライアントの初期化
dynamodb = boto3.resource('dynamodb', region_name='ap-northeast-1')
workers_table = dynamodb.Table('workers')

# Firebase Admin SDKの初期化
script_dir = Path(__file__).parent
service_account_path = script_dir / 'firebase-service-account.json'

if not service_account_path.exists():
    print("❌ エラー: firebase-service-account.json が見つかりません")
    print("")
    print("📝 手順:")
    print("1. Firebase Console → プロジェクトの設定 → サービスアカウント")
    print("2. 「新しい秘密鍵を生成」をクリック")
    print("3. ダウンロードしたJSONファイルを scripts/firebase-service-account.json に保存")
    print("")
    sys.exit(1)

try:
    cred = credentials.Certificate(str(service_account_path))
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    print("✅ Firebase Admin SDKを初期化しました")
except Exception as e:
    print(f"❌ エラー: Firebase Admin SDKの初期化に失敗しました: {e}")
    sys.exit(1)

def get_firebase_user_by_email(email):
    """メールアドレスからFirebaseユーザーを取得"""
    try:
        user = auth.get_user_by_email(email)
        return user
    except auth.UserNotFoundError:
        return None
    except Exception as e:
        print(f"   ⚠️  エラー: {email} の取得に失敗: {e}")
        return None

def update_worker_firebase_uid(worker_id, firebase_uid):
    """DynamoDBのworkerにfirebase_uidを追加"""
    try:
        workers_table.update_item(
            Key={'id': worker_id},
            UpdateExpression='SET firebase_uid = :uid, updated_at = :updated_at',
            ExpressionAttributeValues={
                ':uid': firebase_uid,
                ':updated_at': datetime.utcnow().isoformat() + 'Z'
            }
        )
        return True
    except Exception as e:
        print(f"   ❌ エラー: DynamoDBの更新に失敗: {e}")
        return False

def main():
    print("")
    print("🚀 Firebase UID紐付けマイグレーションを開始します...")
    print("")
    
    # DynamoDBから全workerを取得
    try:
        response = workers_table.scan()
        workers = response.get('Items', [])
        print(f"📊 DynamoDBから {len(workers)} 件のworkerを取得しました")
    except Exception as e:
        print(f"❌ エラー: DynamoDBからの取得に失敗: {e}")
        sys.exit(1)
    
    results = {
        'success': [],
        'not_found': [],
        'already_linked': [],
        'error': []
    }
    
    # 各workerに対してFirebase UIDを紐付け
    for worker in workers:
        worker_id = worker.get('id')
        email = worker.get('email', '').strip()
        firebase_uid = worker.get('firebase_uid', '').strip()
        
        if not email:
            print(f"⚠️  {worker_id}: メールアドレスが設定されていません")
            results['not_found'].append({'id': worker_id, 'reason': 'no_email'})
            continue
        
        # 既にfirebase_uidが設定されている場合はスキップ
        if firebase_uid:
            print(f"✓  {worker_id} ({email}): 既にfirebase_uidが設定されています")
            results['already_linked'].append({'id': worker_id, 'email': email})
            continue
        
        print(f"📧 {worker_id} ({email}): Firebase UIDを検索中...")
        
        # Firebaseからユーザーを取得
        firebase_user = get_firebase_user_by_email(email)
        
        if not firebase_user:
            print(f"   ⚠️  Firebaseにユーザーが見つかりませんでした")
            results['not_found'].append({'id': worker_id, 'email': email, 'reason': 'not_in_firebase'})
            continue
        
        # DynamoDBにfirebase_uidを追加
        if update_worker_firebase_uid(worker_id, firebase_user.uid):
            print(f"   ✅ firebase_uidを紐付けました: {firebase_user.uid}")
            results['success'].append({
                'id': worker_id,
                'email': email,
                'firebase_uid': firebase_user.uid
            })
        else:
            results['error'].append({'id': worker_id, 'email': email})
        
        print("")
    
    # 結果を表示
    print("📊 結果:")
    print(f"   ✅ 成功: {len(results['success'])}件")
    print(f"   ⚠️  既に紐付け済み: {len(results['already_linked'])}件")
    print(f"   ⚠️  見つからない: {len(results['not_found'])}件")
    print(f"   ❌ エラー: {len(results['error'])}件")
    print("")
    
    if results['success']:
        print("✅ 正常に紐付けられたユーザー:")
        for item in results['success']:
            print(f"   - {item['email']} (ID: {item['id']}, Firebase UID: {item['firebase_uid']})")
        print("")
    
    if results['not_found']:
        print("⚠️  Firebaseに存在しないユーザー:")
        for item in results['not_found']:
            reason = item.get('reason', 'unknown')
            if reason == 'no_email':
                print(f"   - ID: {item['id']} (メールアドレス未設定)")
            else:
                print(f"   - {item.get('email', 'N/A')} (ID: {item['id']})")
        print("")

if __name__ == '__main__':
    from datetime import datetime
    main()

