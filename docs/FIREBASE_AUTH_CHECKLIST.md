# Firebase Authentication 動作確認チェックリスト

## 📋 確認項目

### 1. Firebase設定の確認

#### ✅ 設定ファイルの確認
- [ ] `src/assets/js/firebase-config.js`にFirebase設定情報が正しく記入されているか
- [ ] `public/js/firebase-config.js`がビルドされているか
- [ ] 設定情報に誤字・脱字がないか

**確認方法**:
```bash
cat public/js/firebase-config.js
```

---

### 2. Firebase SDKの読み込み確認

#### ✅ ブラウザの開発者ツールで確認
1. ブラウザでページを開く（例: http://localhost:5173/signin.html）
2. 開発者ツール（F12）を開く
3. Consoleタブで以下を確認：
   - [ ] `[Firebase] Initialized successfully` というメッセージが表示されているか
   - [ ] エラーメッセージがないか

**確認コマンド（ブラウザのConsoleで実行）**:
```javascript
// Firebaseが初期化されているか確認
typeof firebase !== 'undefined'  // true であるべき
typeof window.FirebaseAuth !== 'undefined'  // true であるべき
```

---

### 3. ユーザー登録機能の確認

#### ✅ 新規登録ページで確認
1. http://localhost:5173/signup.html にアクセス
2. メールアドレスとパスワードを入力
3. 登録ボタンをクリック
4. 以下を確認：
   - [ ] 登録が成功するか
   - [ ] エラーメッセージが表示されないか
   - [ ] Firebase Consoleでユーザーが作成されているか

**確認方法**:
- Firebase Console → Authentication → Users でユーザー一覧を確認

---

### 4. ログイン機能の確認

#### ✅ ログインページで確認
1. http://localhost:5173/signin.html にアクセス
2. 登録したメールアドレスとパスワードを入力
3. ログインボタンをクリック
4. 以下を確認：
   - [ ] ログインが成功するか
   - [ ] 適切なページにリダイレクトされるか
   - [ ] エラーメッセージが表示されないか

---

### 5. 認証状態の確認

#### ✅ ログイン後の確認
1. ログイン後、ブラウザのConsoleで以下を確認：
   ```javascript
   // 認証状態を確認
   window.Auth.checkAuth()  // true であるべき
   window.Auth.getCurrentRole()  // ロールが返されるか
   window.Auth.getAuthData()  // ユーザー情報が返されるか
   ```

2. sessionStorageを確認：
   - [ ] `misesapo_auth` に認証情報が保存されているか
   - [ ] `misesapo_user` にユーザー情報が保存されているか

**確認方法（ブラウザのConsoleで実行）**:
```javascript
// sessionStorageを確認
JSON.parse(sessionStorage.getItem('misesapo_auth'))
JSON.parse(sessionStorage.getItem('misesapo_user'))
```

---

### 6. ログアウト機能の確認

#### ✅ ログアウトの確認
1. ログイン後、ログアウトボタンをクリック
2. 以下を確認：
   - [ ] ログアウトが成功するか
   - [ ] ログインページにリダイレクトされるか
   - [ ] sessionStorageがクリアされているか

**確認方法（ブラウザのConsoleで実行）**:
```javascript
// ログアウト後
window.Auth.checkAuth()  // false であるべき
sessionStorage.getItem('misesapo_auth')  // null であるべき
```

---

### 7. エラーハンドリングの確認

#### ✅ エラーケースの確認
1. **存在しないユーザーでログイン**:
   - [ ] 適切なエラーメッセージが表示されるか
   - [ ] 日本語のエラーメッセージが表示されるか

2. **間違ったパスワードでログイン**:
   - [ ] 適切なエラーメッセージが表示されるか

3. **既に登録されているメールアドレスで登録**:
   - [ ] 適切なエラーメッセージが表示されるか

---

### 8. Firebase Consoleでの確認

#### ✅ Firebase Consoleで確認
1. https://console.firebase.google.com/ にアクセス
2. プロジェクト「misesapo-system」を選択
3. Authentication → Users で以下を確認：
   - [ ] 登録したユーザーが表示されているか
   - [ ] ユーザーのメールアドレスが正しいか
   - [ ] メール確認の状態が表示されているか

---

### 9. ネットワーク接続の確認

#### ✅ ネットワークタブで確認
1. ブラウザの開発者ツール → Networkタブを開く
2. ログインまたは登録を実行
3. 以下を確認：
   - [ ] Firebase APIへのリクエストが送信されているか
   - [ ] レスポンスが正常に返ってきているか（200 OK）
   - [ ] エラー（4xx, 5xx）が発生していないか

---

### 10. フォールバック機能の確認

#### ✅ Firebaseが使えない場合の確認
1. ブラウザのConsoleで以下を実行：
   ```javascript
   // Firebaseを無効化（テスト用）
   window.FirebaseAuth = null;
   ```
2. ログインを試みる
3. 以下を確認：
   - [ ] クライアントサイド認証（users.js）にフォールバックするか
   - [ ] エラーメッセージが適切に表示されるか

---

## 🐛 よくある問題と解決方法

### 問題1: "Firebase SDK is not loaded"

**原因**: Firebase SDKが読み込まれていない

**解決方法**:
- `base.html`にFirebase SDKのスクリプトタグが含まれているか確認
- ネットワーク接続を確認
- ブラウザのキャッシュをクリア

---

### 問題2: "auth/operation-not-allowed"

**原因**: メール/パスワード認証が有効化されていない

**解決方法**:
1. Firebase Console → Authentication → Sign-in method
2. 「メール/パスワード」を有効化

---

### 問題3: "auth/invalid-api-key"

**原因**: APIキーが正しくない

**解決方法**:
- `firebase-config.js`の設定情報を確認
- Firebase Consoleから正しい設定情報をコピー

---

### 問題4: ログイン後、ロールが取得できない

**原因**: Custom Claimsが設定されていない

**解決方法**:
- デフォルトロール（`customer`）が使用される
- 管理者ロールを設定する場合は、Cloud Functionsを使用

---

## ✅ 確認完了チェックリスト

- [ ] Firebase設定が正しく反映されている
- [ ] Firebase SDKが正しく読み込まれている
- [ ] ユーザー登録が動作する
- [ ] ログインが動作する
- [ ] ログアウトが動作する
- [ ] 認証状態が正しく保存されている
- [ ] エラーハンドリングが適切に動作する
- [ ] Firebase Consoleでユーザーが確認できる

---

## 🎉 確認完了後

すべての項目が確認できたら、Firebase Authenticationの実装は完了です！

次のステップ：
- ロール管理（Custom Claims）の実装
- パスワードリセット機能の実装
- メール確認機能の実装

