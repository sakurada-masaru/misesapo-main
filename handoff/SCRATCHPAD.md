# Scratchpad (雑記帳・ログ置き場)

> ここは一時的なメモ、エラーログ、コードスニペットを貼り付ける場所です。
> 古い情報は適宜削除して構いません。

---
### 2025-12-26: Server Start Error
**Error**: `OSError: [Errno 48] Address already in use`
**Detail**: ポート8000番（おそらく）が既に使用されています。誰か（別のPythonプロセス？）が既にサーバーを起動している可能性があります。
**Action**: `lsof -i` で犯人を特定して kill します。

