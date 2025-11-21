# Firebase認証統合 - レポート機能

## 📋 実装状況

### ✅ 完了したこと

1. **フロントエンド: `getFirebaseIdToken()`関数の実装**
   - `src/pages/admin/reports.html`
   - `src/pages/admin/reports/new.html`
   - `src/pages/admin/reports/[id]/edit.html`
   - `src/pages/reports/[id].html`

### ⚠️ 未実装

1. **バックエンド: Lambda関数でのFirebase Admin SDKによる検証**
   - 現在は簡易的な検証（`mock-token`を許可）
   - Firebase Admin SDKを使用した本格的な検証が必要

---

## 🔧 実装内容

### フロントエンド

`getFirebaseIdToken()`関数を実装しました。この関数は：

1. Firebase Authが利用可能か確認
2. 現在のユーザーを取得
3. IDトークンを取得
4. エラー時は`mock-token`を返す（開発環境用）

```javascript
async function getFirebaseIdToken() {
  try {
    // Firebase Authが利用可能か確認
    if (!window.FirebaseAuth) {
      console.warn('[Reports] Firebase Auth is not available, using mock token');
      return 'mock-token';
    }
    
    // 現在のユーザーを取得
    const currentUser = window.FirebaseAuth.currentUser;
    if (!currentUser) {
      console.warn('[Reports] No authenticated user, using mock token');
      return 'mock-token';
    }
    
    // IDトークンを取得
    const idToken = await currentUser.getIdToken();
    return idToken;
  } catch (error) {
    console.error('[Reports] Error getting Firebase ID token:', error);
    // エラー時はモックトークンを返す（開発環境用）
    return 'mock-token';
  }
}
```

---

## 🚀 次のステップ

### 1. バックエンド: Firebase Admin SDKの統合

Lambda関数でFirebase Admin SDKを使用してIDトークンを検証する必要があります。

#### 必要な作業

1. **Firebase Admin SDKのインストール**
   ```bash
   pip install firebase-admin
   ```

2. **Lambda関数の修正**
   - `verify_firebase_token()`関数を実装
   - Firebase Admin SDKを使用した検証

3. **環境変数の設定**
   - Firebase Admin SDKの認証情報（サービスアカウントキー）

#### 実装例

```python
import firebase_admin
from firebase_admin import credentials, auth

# Firebase Admin SDKの初期化（初回のみ）
if not firebase_admin._apps:
    # サービスアカウントキーを環境変数から取得
    cred = credentials.Certificate(json.loads(os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY')))
    firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token):
    """
    Firebase ID Tokenを検証
    """
    try:
        # IDトークンを検証
        decoded_token = auth.verify_id_token(id_token)
        
        return {
            'verified': True,
            'uid': decoded_token['uid'],
            'email': decoded_token.get('email'),
            'role': decoded_token.get('role', 'customer'),  # Custom Claimsから取得
            'claims': decoded_token
        }
    except Exception as e:
        print(f"Token verification error: {str(e)}")
        return {
            'verified': False,
            'error': str(e)
        }
```

---

## 📝 注意事項

1. **開発環境での動作**
   - 現在は`mock-token`を使用して動作します
   - Firebase認証が利用できない場合も`mock-token`を返します

2. **本番環境での動作**
   - Firebase Admin SDKによる検証が必要です
   - `mock-token`は本番環境では拒否されるべきです

3. **セキュリティ**
   - サービスアカウントキーは環境変数として管理してください
   - Lambda関数の環境変数に設定してください

---

## 🧪 テスト方法

### フロントエンドのテスト

1. **ブラウザでログイン**
   - http://localhost:5173/signin.html にアクセス
   - Firebase認証でログイン

2. **レポートページにアクセス**
   - http://localhost:5173/admin/reports.html
   - ブラウザの開発者ツール（F12）でConsoleを確認
   - `[Reports]` で始まるログを確認

3. **IDトークンの確認**
   - NetworkタブでAPIリクエストを確認
   - `Authorization: Bearer ...` ヘッダーを確認
   - `mock-token`ではなく、実際のFirebase IDトークンが送信されているか確認

---

## 📚 参考資料

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [AWS Lambda環境変数](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)

