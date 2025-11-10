# Firebase Authentication トラブルシューティング

## 🔴 エラー: `auth/invalid-credential`

### 症状
```
FirebaseError: Firebase: The supplied auth credential is incorrect, malformed or has expired. (auth/invalid-credential).
```

### 原因
1. **ユーザーがFirebaseに登録されていない**
2. **メールアドレスまたはパスワードが間違っている**
3. **メール/パスワード認証が有効化されていない**

### 解決方法

#### 1. Firebase Consoleでメール/パスワード認証を有効化

1. https://console.firebase.google.com/ にアクセス
2. プロジェクト「misesapo-system」を選択
3. 左メニューから「Authentication」を選択
4. 「Sign-in method」タブを選択
5. 「メール/パスワード」をクリック
6. 「有効にする」をオンにする
7. 「保存」をクリック

#### 2. ユーザーを登録する

**方法1: アプリから登録（推奨）**
1. http://localhost:5173/signup.html にアクセス
2. メールアドレスとパスワードを入力
3. 登録ボタンをクリック

**方法2: Firebase Consoleから手動で追加**
1. Firebase Console → Authentication → Users
2. 「ユーザーを追加」をクリック
3. メールアドレスとパスワードを入力
4. 「追加」をクリック

#### 3. ログインを試す

1. http://localhost:5173/signin.html にアクセス
2. 登録したメールアドレスとパスワードを入力
3. ログインボタンをクリック

---

## 🔴 エラー: `auth/operation-not-allowed`

### 症状
```
FirebaseError: Firebase: This operation is not allowed. (auth/operation-not-allowed).
```

### 原因
メール/パスワード認証が有効化されていない

### 解決方法
上記の「1. Firebase Consoleでメール/パスワード認証を有効化」を実行

---

## 🔴 エラー: `auth/invalid-value-(email),-starting-an-object-on-a-scalar-field`

### 症状
```
FirebaseError: Firebase: Error (auth/invalid-value-(email),-starting-an-object-on-a-scalar-field).
```

### 原因
`signInWithEmailAndPassword`の呼び出し方法が間違っている

### 解決方法
既に修正済みです。ブラウザのキャッシュをクリアして再読み込みしてください。

---

## 🔴 エラー: `400 (Bad Request)`

### 症状
```
POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=... 400 (Bad Request)
```

### 原因
1. メールアドレスまたはパスワードが間違っている
2. ユーザーが登録されていない
3. メール/パスワード認証が有効化されていない

### 解決方法
1. Firebase Consoleでメール/パスワード認証を有効化
2. ユーザーを登録
3. 正しいメールアドレスとパスワードでログイン

---

## ✅ 確認チェックリスト

### Firebase Consoleでの確認

- [ ] プロジェクト「misesapo-system」が選択されている
- [ ] Authentication → Sign-in method → 「メール/パスワード」が有効化されている
- [ ] ユーザーが登録されている（Authentication → Users）

### アプリでの確認

- [ ] `firebase-config.js`に正しい設定情報が記入されている
- [ ] ブラウザのConsoleで`[Firebase] Initialized successfully`が表示される
- [ ] ユーザー登録が成功する
- [ ] ログインが成功する

---

## 🐛 デバッグ方法

### 1. ブラウザのConsoleで確認

```javascript
// Firebaseが初期化されているか確認
typeof firebase !== 'undefined'  // true であるべき
typeof window.FirebaseAuth !== 'undefined'  // true であるべき

// 現在のユーザーを確認
window.FirebaseAuth.currentUser  // null または User オブジェクト
```

### 2. ネットワークタブで確認

1. ブラウザの開発者ツール → Networkタブを開く
2. ログインを試す
3. `accounts:signInWithPassword`のリクエストを確認
4. レスポンスのステータスコードを確認（200 OK であるべき）

### 3. Firebase Consoleで確認

1. Firebase Console → Authentication → Users
2. 登録したユーザーが表示されているか確認
3. ユーザーのメールアドレスが正しいか確認

---

## 💡 よくある質問

### Q: ユーザーを登録したのにログインできない

**A**: 以下を確認してください：
1. メールアドレスとパスワードが正しいか
2. メール/パスワード認証が有効化されているか
3. Firebase Consoleでユーザーが登録されているか

### Q: エラーメッセージが英語で表示される

**A**: エラーメッセージは日本語に変換されるように実装されています。もし英語で表示される場合は、ブラウザのキャッシュをクリアして再読み込みしてください。

### Q: Firebase SDKが読み込まれない

**A**: 以下を確認してください：
1. `base.html`にFirebase SDKのスクリプトタグが含まれているか
2. ネットワーク接続が正常か
3. ブラウザのConsoleでエラーが表示されていないか

---

## 📚 参考資料

- [Firebase Authentication ドキュメント](https://firebase.google.com/docs/auth)
- [Firebase Authentication エラーコード](https://firebase.google.com/docs/auth/admin/errors)

