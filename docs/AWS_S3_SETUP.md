# AWS S3 画像アップロード設定ガイド

Firebase Storageの代わりにAWS S3を使用して画像をアップロードする方法です。

## 前提条件

1. AWSアカウントを持っていること
2. AWS CLIがインストールされていること（オプション）

## 手順

### 1. S3バケットの作成

1. **AWS Console** (https://console.aws.amazon.com/) にアクセス
2. **S3** サービスを選択
3. **「バケットを作成」** をクリック
4. バケット名を入力（例: `misesapo-cleaning-manual-images`）
5. リージョンを選択（例: `ap-northeast-1` - 東京）
6. **「パブリックアクセスをブロック」** の設定:
   - **「すべてのパブリックアクセスをブロック」** のチェックを**外す**
   - 警告を確認して「了解しました」にチェック
7. **「バケットを作成」** をクリック

### 2. CORS設定

1. 作成したバケットを選択
2. **「アクセス許可」** タブをクリック
3. **「CORS」** セクションで **「編集」** をクリック
4. 以下の設定をコピー&ペースト:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

5. **「変更を保存」** をクリック

### 3. バケットポリシーの設定（読み取りを許可）

1. **「アクセス許可」** タブの **「バケットポリシー」** セクションで **「編集」** をクリック
2. 以下のポリシーをコピー&ペースト（`YOUR_BUCKET_NAME`を実際のバケット名に置き換え）:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```

3. **「変更を保存」** をクリック

### 4. IAMユーザーの作成（APIキー取得）

1. **IAM** サービスを選択
2. **「ユーザー」** → **「ユーザーを追加」** をクリック
3. ユーザー名を入力（例: `misesapo-s3-uploader`）
4. **「プログラムによるアクセス」** にチェック
5. **「次のステップ: アクセス権限」** をクリック
6. **「既存のポリシーを直接アタッチ」** を選択
7. **「AmazonS3FullAccess」** を検索して選択（または、より制限的なポリシーを作成）
8. **「次のステップ: タグ」** → **「次のステップ: 確認」** → **「ユーザーの作成」**
9. **アクセスキーID** と **シークレットアクセスキー** をコピー（後で使います）

### 5. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成（既に存在する場合は追加）:

```bash
# AWS S3設定
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET_NAME=misesapo-cleaning-manual-images
AWS_S3_REGION=ap-northeast-1
```

**重要**: `.env` ファイルは `.gitignore` に追加してください（機密情報を含むため）

### 6. Pythonライブラリのインストール

```bash
pip3 install boto3 python-dotenv
```

## 使用方法

開発サーバーを起動すると、画像アップロード時に自動的にS3にアップロードされます。

```bash
python3 scripts/dev_server.py
```

## トラブルシューティング

### アクセス拒否エラー

- IAMユーザーの権限を確認
- バケットポリシーが正しく設定されているか確認

### CORSエラー

- S3バケットのCORS設定を確認
- ブラウザのキャッシュをクリア

### 環境変数が読み込まれない

- `.env` ファイルがプロジェクトルートにあるか確認
- `python-dotenv` がインストールされているか確認

