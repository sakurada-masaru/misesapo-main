# Firebase Storage CORS設定ガイド

Firebase Storageへの画像アップロード時にCORSエラーが発生する場合、以下の手順でCORS設定を適用してください。

## 前提条件

1. Google Cloud SDK（gsutil）がインストールされていること
2. Firebaseプロジェクトにアクセス権限があること

## 手順

### 1. Google Cloud SDKのインストール（未インストールの場合）

```bash
# macOSの場合
brew install google-cloud-sdk

# または公式インストーラーを使用
# https://cloud.google.com/sdk/docs/install
```

### 2. Google Cloudにログイン

```bash
gcloud auth login
```

### 3. プロジェクトを設定

```bash
gcloud config set project misesapo-system
```

### 4. CORS設定ファイルの確認

プロジェクトルートの `storage-cors.json` ファイルを確認してください。

### 5. CORS設定を適用

```bash
# バケット名を確認（通常は {project-id}.appspot.com または {project-id}.firebasestorage.app）
gsutil cors set storage-cors.json gs://misesapo-system.firebasestorage.app
```

### 6. CORS設定の確認

```bash
gsutil cors get gs://misesapo-system.firebasestorage.app
```

## トラブルシューティング

### CORSエラーが続く場合

1. **ブラウザのキャッシュをクリア**
   - 強制リロード: `Cmd+Shift+R` (Mac) または `Ctrl+Shift+R` (Windows)

2. **認証トークンを確認**
   - ブラウザのコンソール（F12）で以下を実行:
   ```javascript
   firebase.auth().currentUser?.getIdToken().then(token => console.log('Token:', token))
   ```

3. **セキュリティルールを確認**
   - Firebase Console → Storage → ルール
   - `storage.rules` ファイルの内容が正しくデプロイされているか確認

4. **Firebase Storageのセキュリティルールを再デプロイ**
   ```bash
   firebase deploy --only storage:rules
   ```

## 参考

- [Firebase Storage CORS設定](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
- [gsutil cors コマンド](https://cloud.google.com/storage/docs/gsutil/commands/cors)

