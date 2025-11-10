# Firebase Custom Claims設定ガイド（詳細版）

## 📋 このガイドについて

このガイドでは、Firebase Authenticationに登録されているユーザーに、Custom Claimsでロールを設定する方法を詳しく説明します。

**Custom Claimsとは？**
- Firebase Authenticationの機能の一つ
- ユーザーに追加情報（ロールなど）を設定できる
- セキュアにロールを管理できる

---

## 🎯 目標

Firebase Authenticationに登録されている以下のユーザーに、それぞれのロールを設定します：

| メールアドレス | ロール |
|--------------|--------|
| admin@misesapo.app | admin |
| keiri@misesapo.app | admin |
| worker@misesapo.app | staff |
| design@misesapo.app | developer |
| misesapofeedback@gmail.com | concierge |
| info@misesapo.app | master |
| masarunospec@gmail.com | master |

---

## 📝 ステップ1: サービスアカウントキーを取得

### 1-1. Firebase Consoleにアクセス

1. ブラウザで https://console.firebase.google.com/ を開く
2. プロジェクト「misesapo-system」を選択

### 1-2. プロジェクトの設定を開く

1. 画面左上の⚙️（歯車）アイコンをクリック
2. 「プロジェクトの設定」をクリック

### 1-3. サービスアカウントタブを開く

1. 設定画面の上部にあるタブから「サービスアカウント」をクリック

### 1-4. 新しい秘密鍵を生成

1. 「新しい秘密鍵を生成」ボタンをクリック
2. 確認ダイアログが表示されたら「キーを生成」をクリック
3. JSONファイルがダウンロードされます

**重要**: このJSONファイルには機密情報が含まれています。絶対に他人に共有しないでください。

### 1-5. ファイルを保存

1. ダウンロードしたJSONファイルを開く
2. ファイル名を確認（通常は `misesapo-system-xxxxx-firebase-adminsdk-xxxxx.json` のような名前）
3. このファイルを `scripts/firebase-service-account.json` にリネームして保存

**保存場所の確認**:
- プロジェクトのルートディレクトリ: `/Users/sakuradamasaru/Desktop/misesapo-main/`
- 保存先: `/Users/sakuradamasaru/Desktop/misesapo-main/scripts/firebase-service-account.json`

---

## 📝 ステップ2: Node.jsパッケージをインストール

### 2-1. ターミナルを開く

1. ターミナルアプリを開く
2. プロジェクトのディレクトリに移動:
   ```bash
   cd /Users/sakuradamasaru/Desktop/misesapo-main
   ```

### 2-2. firebase-adminをインストール

以下のコマンドを実行:

```bash
npm install firebase-admin
```

**実行結果の確認**:
- エラーが表示されなければOK
- `node_modules/` フォルダが作成されます

---

## 📝 ステップ3: スクリプトを実行

### 3-1. スクリプトを実行

以下のコマンドを実行:

```bash
node scripts/set_firebase_custom_claims.js
```

### 3-2. 実行結果を確認

スクリプトが正常に実行されると、以下のような結果が表示されます:

```
✅ Firebase Admin SDKを初期化しました

🚀 Firebase Custom Claims設定を開始します...

📧 admin@misesapo.app → admin を設定中...
   ✅ ロールを設定しました (UID: xxxxx)

📧 keiri@misesapo.app → admin を設定中...
   ✅ ロールを設定しました (UID: xxxxx)

...

📊 結果:
   ✅ 成功: 7件
   ⚠️  ユーザーが見つからない: 0件
   ❌ エラー: 0件

✅ 正常に設定されたユーザー:
   - admin@misesapo.app (admin) - UID: xxxxx
   - keiri@misesapo.app (admin) - UID: xxxxx
   ...

✨ 処理が完了しました
```

---

## 🔍 トラブルシューティング

### エラー1: "firebase-service-account.json が見つかりません"

**原因**: サービスアカウントキーファイルが正しい場所に保存されていません

**解決方法**:
1. ダウンロードしたJSONファイルが `scripts/` フォルダにあるか確認
2. ファイル名が `firebase-service-account.json` になっているか確認
3. ファイルのパスを確認: `/Users/sakuradamasaru/Desktop/misesapo-main/scripts/firebase-service-account.json`

### エラー2: "ユーザーが見つかりませんでした"

**原因**: Firebase Authenticationに該当するメールアドレスのユーザーが登録されていません

**解決方法**:
1. Firebase Console → Authentication → Users を開く
2. 該当するメールアドレスのユーザーが登録されているか確認
3. 登録されていない場合は、先にユーザーを登録してください

### エラー3: "Cannot find module 'firebase-admin'"

**原因**: `firebase-admin` パッケージがインストールされていません

**解決方法**:
```bash
npm install firebase-admin
```

### エラー4: "Permission denied" または "権限がありません"

**原因**: サービスアカウントキーに必要な権限がありません

**解決方法**:
1. Firebase Console → プロジェクトの設定 → サービスアカウント
2. 新しい秘密鍵を再生成
3. 再度 `scripts/firebase-service-account.json` に保存

---

## ✅ 設定後の確認

### 確認方法1: ログインしてテスト

1. `/signin.html` にアクセス
2. 設定したメールアドレスとパスワードでログイン
3. ブラウザのコンソール（F12キー）を開く
4. `[Auth] Using role from users.js: admin` のようなメッセージが表示されるか確認
5. ヘッダーに正しいロール名が表示されるか確認

### 確認方法2: Firebase Consoleで確認

1. Firebase Console → Authentication → Users を開く
2. 各ユーザーをクリック
3. 「Custom claims」セクションでロールが設定されているか確認

---

## 🔒 セキュリティ注意事項

1. **サービスアカウントキーは機密情報**
   - `firebase-service-account.json` は絶対にGitにコミットしないでください
   - 既に `.gitignore` に追加済みです

2. **ファイルの保存場所**
   - ローカル環境でのみ使用してください
   - 本番環境では、環境変数やシークレット管理サービスを使用してください

3. **ファイルの共有**
   - このファイルを他人に共有しないでください
   - 共有する必要がある場合は、新しい秘密鍵を生成してください

---

## 📚 参考資料

- [Firebase Admin SDK ドキュメント](https://firebase.google.com/docs/admin/setup)
- [Custom Claims ドキュメント](https://firebase.google.com/docs/auth/admin/custom-claims)

---

## 💡 補足: 現在の実装について

現在の実装では、Firebase Custom Claimsを設定しなくても動作します。理由:

- Firebaseログイン時に `users.js` からロールを取得するため
- `users.js` に登録されているメールアドレスと一致すれば、正しいロールが設定されます

ただし、将来的にはFirebase Custom Claimsでロールを管理することを推奨します。理由:

- `users.js` に依存しない
- よりセキュアな管理が可能
- 複数デバイスでの同期が可能

---

## ✅ チェックリスト

- [ ] ステップ1: サービスアカウントキーを取得
- [ ] ステップ1: `scripts/firebase-service-account.json` に保存
- [ ] ステップ2: `firebase-admin` をインストール
- [ ] ステップ3: スクリプトを実行
- [ ] ステップ3: 実行結果を確認
- [ ] 設定後の確認: ログインしてテスト
- [ ] 設定後の確認: Firebase Consoleで確認

---

## 🎉 完了

すべてのステップが完了したら、Firebase AuthenticationのユーザーにCustom Claimsでロールが設定されています。

これで、Firebaseログイン時に正しいロールでログインできるようになります！

