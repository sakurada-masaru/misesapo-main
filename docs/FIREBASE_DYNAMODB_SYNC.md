# Firebase Authentication と DynamoDB の同期

## 問題

新規登録（`/signup.html`）でFirebase Authenticationにユーザーが作成されますが、DynamoDBの`workers`テーブルには自動的に登録されません。そのため、管理画面（`/admin/users/index.html`）で新規登録ユーザーが表示されません。

## 解決策

### 1. 新規登録時にDynamoDBにも登録（実装済み）

新規登録時に、Firebase AuthenticationとDynamoDBの両方に登録するように修正しました。

**実装場所**: `src/assets/js/auth.js` の `registerWithFirebase` 関数

**動作**:
1. Firebase Authenticationにユーザーを作成
2. DynamoDBの`workers`テーブルにも登録
3. Firebase UIDをDynamoDBに紐付け

### 2. 既存のFirebaseユーザーをDynamoDBに同期

既存のFirebase AuthenticationユーザーをDynamoDBに同期するスクリプトを作成しました。

**スクリプト**: `scripts/sync_firebase_to_dynamodb.py`

**使用方法**:
```bash
# 1. Firebase Admin SDKをインストール
pip install firebase-admin boto3

# 2. Firebaseサービスアカウントキーを取得
# Firebase Console → プロジェクトの設定 → サービスアカウント
# 「新しい秘密鍵を生成」をクリック
# ダウンロードしたJSONファイルを scripts/firebase-service-account.json に保存

# 3. スクリプトを実行
python3 scripts/sync_firebase_to_dynamodb.py
```

**動作**:
1. Firebase Authenticationから全ユーザーを取得
2. 各ユーザーについて：
   - 既にDynamoDBに存在する場合はスキップ
   - メールアドレスで検索して、firebase_uidを追加
   - 存在しない場合は新規作成

## データ構造

### DynamoDB `workers`テーブル

```json
{
  "id": "W1764552147000",  // DynamoDB用のID
  "firebase_uid": "abc123...",  // Firebase UID
  "email": "user@example.com",
  "name": "ユーザー名",
  "phone": "",
  "role": "customer",  // ロール（customer, staff, sales, adminなど）
  "role_code": "99",  // ロールコード
  "department": "",
  "status": "active",
  "created_at": "2025-12-01T00:00:00Z",
  "updated_at": "2025-12-01T00:00:00Z"
}
```

## 今後の改善

1. **Cloud Functionsで自動同期**
   - Firebase Authenticationのユーザー作成時に、Cloud FunctionsでDynamoDBにも自動登録
   - より確実な同期が可能

2. **ロールの自動設定**
   - 新規登録時に、Firebase Custom Claimsにロールを設定
   - Firebase Admin SDKを使用して実装

3. **エラーハンドリングの改善**
   - DynamoDBへの登録に失敗した場合のリトライ機能
   - エラーログの記録

