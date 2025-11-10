# Firebase Authentication セットアップガイド

## 📋 概要

このガイドでは、Firebase Authenticationを設定して、ミセサポのログイン・登録機能を有効にする手順を説明します。

---

## 🚀 セットアップ手順

### ステップ1: Firebase Consoleでプロジェクトを作成

1. **Firebase Consoleにアクセス**
   - https://console.firebase.google.com/
   - Googleアカウントでログイン

2. **プロジェクトを作成（既存のプロジェクトがある場合はスキップ）**
   - 「プロジェクトを追加」をクリック
   - プロジェクト名を入力（例: "misesapo"）
   - Google Analyticsの設定（任意）
   - 「プロジェクトを作成」をクリック

---

### ステップ2: Authenticationを有効化

1. **Authenticationを開く**
   - 左メニューから「Authentication」を選択
   - 「始める」をクリック

2. **メール/パスワード認証を有効化**
   - 「Sign-in method」タブを選択
   - 「メール/パスワード」をクリック
   - 「有効にする」をオンにする
   - 「保存」をクリック

---

### ステップ3: Webアプリを登録

1. **Webアプリを追加**
   - プロジェクト設定（⚙️）をクリック
   - 「アプリを追加」→「Web」（</>）を選択

2. **アプリの登録**
   - アプリのニックネームを入力（例: "ミセサポ"）
   - **Firebase Hostingは使用しない**（チェックを外す）
   - 「アプリを登録」をクリック

3. **設定情報をコピー**
   - 表示されるFirebase設定情報をコピー：
     ```javascript
     const firebaseConfig = {
       apiKey: "AIza...",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abcdef"
     };
     ```

---

### ステップ4: 設定ファイルを更新

1. **`src/assets/js/firebase-config.js`を開く**

2. **Firebase設定情報を貼り付け**
   - ステップ3でコピーした設定情報を`firebaseConfig`に貼り付け
   - 例：
     ```javascript
     const firebaseConfig = {
       apiKey: "AIzaSyC...",
       authDomain: "misesapo.firebaseapp.com",
       projectId: "misesapo",
       storageBucket: "misesapo.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abcdef"
     };
     ```

3. **保存**

---

### ステップ5: ビルドとテスト

1. **ビルドを実行**
   ```bash
   python3 scripts/build.py
   ```

2. **ローカルサーバーを起動**
   ```bash
   python3 scripts/dev_server.py
   ```

3. **テスト**
   - http://localhost:5173/signup.html にアクセス
   - 新しいアカウントを作成
   - http://localhost:5173/signin.html でログイン

---

## 🔒 セキュリティ設定（推奨）

### APIキーの制限（オプション）

1. **Google Cloud ConsoleでAPIキーを制限**
   - https://console.cloud.google.com/
   - 「APIとサービス」→「認証情報」を選択
   - Firebase APIキーを選択
   - 「アプリケーションの制限」で「HTTPリファラー（ウェブサイト）」を選択
   - 許可されたウェブサイトにドメインを追加（例: `https://your-domain.com/*`）

---

## 👥 ユーザー管理

### 既存ユーザーの移行

既存のユーザー（`users.js`にハードコードされているユーザー）をFirebaseに移行する場合：

1. **Firebase Consoleでユーザーを手動で追加**
   - Authentication → Users → 「ユーザーを追加」
   - メールアドレスとパスワードを入力
   - ユーザーを追加

2. **Custom Claimsでロールを設定**
   - Cloud Functionsを使用（後述）

---

## 🎯 ロール管理（Custom Claims）

### Cloud Functionsを使用したロール設定

1. **Firebase CLIをインストール**
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebaseにログイン**
   ```bash
   firebase login
   ```

3. **Functionsを初期化**
   ```bash
   firebase init functions
   ```

4. **ロール設定関数を追加**
   ```javascript
   // functions/index.js
   const functions = require('firebase-functions');
   const admin = require('firebase-admin');
   admin.initializeApp();
   
   exports.setUserRole = functions.https.onCall(async (data, context) => {
     // 管理者のみが実行可能
     if (!context.auth || !context.auth.token.admin) {
       throw new functions.https.HttpsError('permission-denied', '管理者権限が必要です');
     }
     
     const { uid, role } = data;
     
     await admin.auth().setCustomUserClaims(uid, { role: role });
     
     return { success: true };
   });
   ```

5. **デプロイ**
   ```bash
   firebase deploy --only functions
   ```

---

## 📝 トラブルシューティング

### エラー: "Firebase SDK is not loaded"

**原因**: Firebase SDKが読み込まれていない

**解決方法**:
- `base.html`にFirebase SDKのスクリプトタグが含まれているか確認
- ネットワーク接続を確認

### エラー: "auth/operation-not-allowed"

**原因**: メール/パスワード認証が有効化されていない

**解決方法**:
- Firebase Console → Authentication → Sign-in method
- 「メール/パスワード」を有効化

### エラー: "auth/invalid-api-key"

**原因**: APIキーが正しくない

**解決方法**:
- `firebase-config.js`の設定情報を確認
- Firebase Consoleから正しい設定情報をコピー

---

## ✅ チェックリスト

- [ ] Firebaseプロジェクトを作成
- [ ] Authenticationを有効化
- [ ] メール/パスワード認証を有効化
- [ ] Webアプリを登録
- [ ] `firebase-config.js`に設定情報を記入
- [ ] ビルドを実行
- [ ] テスト（ユーザー登録・ログイン）
- [ ] 既存ユーザーの移行（必要に応じて）
- [ ] ロール管理の設定（必要に応じて）

---

## 🎉 完了

Firebase Authenticationの設定が完了しました！

これで、ユーザーは：
- メールアドレスとパスワードで登録できる
- ログインできる
- 複数デバイスで同期される
- パスワードリセット機能が利用できる

---

## 📚 参考資料

- [Firebase Authentication ドキュメント](https://firebase.google.com/docs/auth)
- [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)

