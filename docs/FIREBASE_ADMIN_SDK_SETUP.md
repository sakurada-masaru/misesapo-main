# Firebase Admin SDK セットアップガイド

## 📋 概要

Lambda関数でFirebase Admin SDKを使用してIDトークンを検証するためのセットアップガイドです。

---

## 🚀 セットアップ手順

### ステップ1: Firebaseサービスアカウントキーの取得

1. **Firebase Consoleにアクセス**
   - https://console.firebase.google.com/
   - プロジェクトを選択

2. **プロジェクト設定を開く**
   - プロジェクト設定（⚙️）をクリック
   - 「サービスアカウント」タブを選択

3. **サービスアカウントキーを生成**
   - 「新しい秘密鍵の生成」をクリック
   - JSONファイルがダウンロードされます
   - **重要**: このファイルは機密情報です。安全に保管してください

---

### ステップ2: Lambda関数の環境変数に設定

#### 方法1: AWS Lambdaコンソールから設定

1. **Lambda関数の設定ページを開く**
   - AWS Lambdaコンソール → 関数を選択 → 「設定」タブ → 「環境変数」

2. **環境変数を追加**
   - 「環境変数を編集」をクリック
   - キー: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - 値: ダウンロードしたJSONファイルの内容をそのまま貼り付け

#### 方法2: AWS CLIから設定

```bash
# JSONファイルの内容を環境変数として設定
aws lambda update-function-configuration \
  --function-name your-function-name \
  --environment Variables="{FIREBASE_SERVICE_ACCOUNT_KEY=$(cat path/to/serviceAccountKey.json | jq -c .)}"
```

---

### ステップ3: Lambda関数のレイヤーにFirebase Admin SDKを追加

#### 方法1: Lambdaレイヤーを使用（推奨）

1. **Firebase Admin SDKを含むレイヤーを作成**
   ```bash
   # 一時ディレクトリを作成
   mkdir -p layer/python
   cd layer/python
   
   # Firebase Admin SDKをインストール
   pip install firebase-admin -t .
   
   # レイヤーをZIP化
   cd ..
   zip -r firebase-admin-layer.zip python/
   
   # Lambdaレイヤーを作成
   aws lambda publish-layer-version \
     --layer-name firebase-admin \
     --zip-file fileb://firebase-admin-layer.zip \
     --compatible-runtimes python3.9 python3.10 python3.11
   ```

2. **Lambda関数にレイヤーを追加**
   - Lambda関数の設定 → 「レイヤー」タブ
   - 「レイヤーを追加」をクリック
   - 作成したレイヤーを選択

#### 方法2: 直接インストール（小規模な場合）

Lambda関数のデプロイパッケージに直接含めることもできますが、パッケージサイズが大きくなるため、レイヤーの使用を推奨します。

---

### ステップ4: Lambda関数のコードを更新

`lambda_function.py`の`verify_firebase_token()`関数を更新します。

```python
import firebase_admin
from firebase_admin import credentials, auth
import json
import os

# Firebase Admin SDKの初期化（初回のみ）
if not firebase_admin._apps:
    try:
        # 環境変数からサービスアカウントキーを取得
        service_account_key = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY')
        if service_account_key:
            cred_dict = json.loads(service_account_key)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully")
        else:
            print("Warning: FIREBASE_SERVICE_ACCOUNT_KEY not set, using mock verification")
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK: {str(e)}")

def verify_firebase_token(id_token):
    """
    Firebase ID Tokenを検証
    """
    # モックトークンの場合は簡易検証（開発環境用）
    if id_token == 'mock-token':
        return {
            'verified': True,
            'uid': 'admin-uid',
            'email': 'admin@example.com',
            'role': 'admin',
            'claims': {}
        }
    
    try:
        # Firebase Admin SDKが初期化されていない場合は簡易検証
        if not firebase_admin._apps:
            print("Warning: Firebase Admin SDK not initialized, using mock verification")
            return {
                'verified': True,
                'uid': 'admin-uid',
                'email': 'admin@example.com',
                'role': 'admin',
                'claims': {}
            }
        
        # IDトークンを検証
        decoded_token = auth.verify_id_token(id_token)
        
        # Custom Claimsからロールを取得
        role = decoded_token.get('role', 'customer')
        
        return {
            'verified': True,
            'uid': decoded_token['uid'],
            'email': decoded_token.get('email'),
            'role': role,
            'claims': decoded_token
        }
    except auth.InvalidIdTokenError as e:
        print(f"Invalid ID token: {str(e)}")
        return {
            'verified': False,
            'error': 'Invalid ID token'
        }
    except auth.ExpiredIdTokenError as e:
        print(f"Expired ID token: {str(e)}")
        return {
            'verified': False,
            'error': 'Expired ID token'
        }
    except Exception as e:
        print(f"Token verification error: {str(e)}")
        return {
            'verified': False,
            'error': str(e)
        }
```

---

## 🔒 セキュリティのベストプラクティス

1. **サービスアカウントキーの管理**
   - 環境変数として管理（AWS Secrets Managerの使用も検討）
   - Gitリポジトリにコミットしない
   - 定期的にローテーション

2. **最小権限の原則**
   - サービスアカウントには必要最小限の権限のみを付与

3. **ログの管理**
   - 機密情報（トークンなど）をログに出力しない

---

## 🧪 テスト方法

### ローカルでのテスト

```python
# テスト用のスクリプト
import json
import os

# 環境変数を設定
os.environ['FIREBASE_SERVICE_ACCOUNT_KEY'] = json.dumps({
    # サービスアカウントキーの内容
})

# Lambda関数をインポート
from lambda_function import verify_firebase_token

# テスト
id_token = "your-firebase-id-token"
result = verify_firebase_token(id_token)
print(result)
```

### Lambda関数でのテスト

1. **テストイベントを作成**
   ```json
   {
     "headers": {
       "Authorization": "Bearer your-firebase-id-token"
     },
     "path": "/staff/reports",
     "httpMethod": "GET"
   }
   ```

2. **Lambda関数をテスト**
   - Lambdaコンソール → 「テスト」タブ
   - テストイベントを選択して実行

---

## 📝 注意事項

1. **コールドスタート**
   - Firebase Admin SDKの初期化は初回のみ実行されます
   - コールドスタート時の初期化時間を考慮してください

2. **エラーハンドリング**
   - トークン検証に失敗した場合は適切なエラーレスポンスを返してください

3. **開発環境**
   - 開発環境では`mock-token`を使用することも可能です
   - 本番環境では必ずFirebase Admin SDKを使用してください

---

## 🆘 トラブルシューティング

### エラー: "Firebase Admin SDK not initialized"

- 環境変数`FIREBASE_SERVICE_ACCOUNT_KEY`が正しく設定されているか確認
- JSONの形式が正しいか確認

### エラー: "Invalid ID token"

- IDトークンが正しく送信されているか確認
- トークンの有効期限を確認

### エラー: "Module not found: firebase_admin"

- Lambdaレイヤーが正しく追加されているか確認
- デプロイパッケージにFirebase Admin SDKが含まれているか確認

---

## 📚 参考資料

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [AWS Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)

