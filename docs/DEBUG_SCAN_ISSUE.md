# スキャン操作のデバッグ

## 🔍 問題

レポートは作成されているのに、個別取得（GET /staff/reports/{report_id}）で404エラーが発生しています。

## 📋 確認事項

### 1. Lambda関数が最新のコードでデプロイされているか

1. **Lambdaコンソールを開く**
   - https://console.aws.amazon.com/lambda/
   - 関数を選択

2. **コードを確認**
   - 「コード」タブを開く
   - `get_report_detail`関数が`Attr`を使用しているか確認
   - `from boto3.dynamodb.conditions import Key, Attr` が含まれているか確認

3. **再デプロイ**
   - 最新の`lambda_function.py`の内容をコピー
   - Lambda関数のコードエディタに貼り付け
   - 「Deploy」ボタンをクリック

### 2. CloudWatch Logsを確認

1. **CloudWatch Logsを開く**
   - Lambda関数の「モニタリング」タブ → 「CloudWatch Logs を表示」

2. **最新のログを確認**
   - `DEBUG: Getting report with ID: ...` というログを探す
   - `DEBUG: Scan response: ...` というログを確認
   - `DEBUG: Items found: ...` というログを確認

3. **エラーログを確認**
   - `DEBUG: Scan error: ...` というログがあるか確認
   - エラーメッセージの内容を確認

### 3. DynamoDBテーブルの確認

1. **DynamoDBコンソールを開く**
   - https://console.aws.amazon.com/dynamodb/
   - `staff-reports`テーブルを選択

2. **アイテムを確認**
   - 「アイテムを探索」タブを開く
   - レポートが実際に保存されているか確認
   - `report_id`の値が正しいか確認

3. **スキーマを確認**
   - 「概要」タブを開く
   - パーティションキーとソートキーを確認
   - ソートキーが`created_at`になっているか確認

---

## 🔧 代替案

### オプション1: テーブルスキーマを変更（推奨）

テーブルを削除して再作成し、`report_id`のみをパーティションキーにします。

詳細は `docs/DYNAMODB_SCHEMA_FIX.md` を参照してください。

### オプション2: スキャン操作を改善

現在のスキャン操作は、テーブルが大きくなると遅くなる可能性があります。テーブルスキーマを変更することを推奨します。

---

## 📝 次のステップ

1. Lambda関数を再デプロイ
2. CloudWatch Logsを確認
3. 再度テストを実行
4. まだエラーが出る場合は、テーブルスキーマを変更することを検討

