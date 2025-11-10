# Firebase Authentication 実装ガイド

## 📋 概要

Firebase Authenticationを使用して、ユーザー登録・ログイン機能を実装します。

---

## 🚀 実装手順

### ステップ1: Firebaseプロジェクトの設定

1. **Firebase Consoleにアクセス**
   - https://console.firebase.google.com/
   - 既存のプロジェクトを選択、または新規作成

2. **Authenticationを有効化**
   - 左メニューから「Authentication」を選択
   - 「始める」をクリック
   - 「Sign-in method」タブで「メール/パスワード」を有効化

3. **Webアプリを登録**
   - プロジェクト設定（⚙️）→「アプリを追加」→「Web」（</>）
   - アプリのニックネームを入力（例: "ミセサポ"）
   - Firebase Hostingは使用しない（チェックを外す）
   - 「アプリを登録」をクリック

4. **設定情報を取得**
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

### ステップ2: Firebase SDKの追加

#### 方法1: CDN経由（推奨）

`src/layouts/base.html`にFirebase SDKを追加：

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
```

#### 方法2: npm経由（ビルドシステムを使用する場合）

```bash
npm install firebase
```

---

### ステップ3: Firebase設定ファイルの作成

`src/assets/js/firebase-config.js`を作成：

```javascript
/**
 * Firebase設定
 * 
 * 注意: このファイルにはFirebase設定情報が含まれます。
 * 本番環境では、環境変数を使用することを推奨します。
 */

(function() {
  'use strict';
  
  // Firebase設定情報（Firebase Consoleから取得）
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  
  // Firebase初期化
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    window.FirebaseAuth = firebase.auth();
  } else {
    console.error('[Firebase] Firebase SDK is not loaded');
  }
})();
```

---

### ステップ4: 認証ロジックの実装

`src/assets/js/auth.js`を修正して、Firebase Authenticationを使用：

```javascript
/**
 * Firebase Authentication統合
 */

// Firebase Authenticationを使用したログイン
async function loginWithFirebase(email, password) {
  try {
    const userCredential = await window.FirebaseAuth.signInWithEmailAndPassword(
      window.FirebaseAuth,
      email,
      password
    );
    
    const firebaseUser = userCredential.user;
    
    // Firebase Custom Claimsからロールを取得
    const idTokenResult = await firebaseUser.getIdTokenResult();
    const role = idTokenResult.claims.role || 'customer';
    
    // ユーザー情報を保存
    const user = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      role: role,
      name: firebaseUser.displayName || email.split('@')[0],
      emailVerified: firebaseUser.emailVerified
    };
    
    setAuthData(role, user.email, user);
    
    return {
      success: true,
      user: user,
      role: role
    };
  } catch (error) {
    console.error('[Auth] Firebase login error:', error);
    return {
      success: false,
      message: getFirebaseErrorMessage(error)
    };
  }
}

// Firebase Authenticationを使用したユーザー登録
async function registerWithFirebase(email, password, name = null) {
  try {
    const userCredential = await window.FirebaseAuth.createUserWithEmailAndPassword(
      window.FirebaseAuth,
      email,
      password
    );
    
    const firebaseUser = userCredential.user;
    
    // 表示名を設定
    if (name) {
      await firebaseUser.updateProfile({
        displayName: name
      });
    }
    
    // メール確認を送信
    await firebaseUser.sendEmailVerification();
    
    return {
      success: true,
      user: {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: name || email.split('@')[0],
        emailVerified: false
      }
    };
  } catch (error) {
    console.error('[Auth] Firebase registration error:', error);
    return {
      success: false,
      message: getFirebaseErrorMessage(error)
    };
  }
}

// Firebaseエラーメッセージを日本語に変換
function getFirebaseErrorMessage(error) {
  const errorMessages = {
    'auth/user-not-found': 'メールアドレスまたはパスワードが正しくありません',
    'auth/wrong-password': 'メールアドレスまたはパスワードが正しくありません',
    'auth/invalid-email': 'メールアドレスの形式が正しくありません',
    'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
    'auth/weak-password': 'パスワードが弱すぎます。6文字以上で入力してください',
    'auth/network-request-failed': 'ネットワークエラーが発生しました。接続を確認してください',
    'auth/too-many-requests': 'ログイン試行回数が多すぎます。しばらく待ってから再度お試しください'
  };
  
  return errorMessages[error.code] || error.message || '認証処理でエラーが発生しました';
}
```

---

### ステップ5: ロール管理（Firebase Custom Claims）

Firebase Custom Claimsを使用して、ユーザーのロールを管理します。

#### Cloud Functionsを使用（推奨）

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

#### 管理者画面からロールを設定

`/admin/users/set-role.html`を作成：

```javascript
async function setUserRole(userId, role) {
  try {
    // Cloud Functionsを呼び出し
    const setUserRole = firebase.functions().httpsCallable('setUserRole');
    await setUserRole({ uid: userId, role: role });
    
    return { success: true };
  } catch (error) {
    console.error('[Admin] Error setting user role:', error);
    return { success: false, message: error.message };
  }
}
```

---

### ステップ6: 既存の認証システムとの統合

`auth.js`の`login()`関数を修正して、Firebaseとクライアントサイド認証の両方に対応：

```javascript
async function login(email, password) {
  // Firebaseが利用可能な場合はFirebaseを使用
  if (window.FirebaseAuth) {
    return await loginWithFirebase(email, password);
  }
  
  // フォールバック: クライアントサイド認証
  // ... 既存のコード ...
}
```

---

### ステップ7: ログイン・登録ページの更新

`src/pages/signin.html`と`src/pages/signup.html`は、既存のコードで動作します（`auth.js`がFirebaseを使用するため）。

---

## 🔒 セキュリティ考慮事項

### 1. APIキーの保護

- Firebase APIキーは公開されても問題ありません（Firebaseのセキュリティルールで保護）
- ただし、Firebase Consoleで「アプリの制限」を設定することを推奨

### 2. セキュリティルール

Firebase Consoleでセキュリティルールを設定：

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### 3. ロール管理

- Custom Claimsを使用してロールを管理
- 管理者のみがロールを変更可能にする

---

## 📝 実装チェックリスト

- [ ] Firebaseプロジェクトの作成
- [ ] Authenticationの有効化（メール/パスワード）
- [ ] Webアプリの登録
- [ ] Firebase設定ファイルの作成
- [ ] Firebase SDKの追加
- [ ] `auth.js`の修正（Firebase統合）
- [ ] ログイン・登録ページのテスト
- [ ] ロール管理機能の実装（Custom Claims）
- [ ] 管理者画面の実装
- [ ] セキュリティルールの設定

---

## 🚀 次のステップ

1. **Firebaseプロジェクトの設定**
2. **Firebase設定ファイルの作成**
3. **認証ロジックの実装**
4. **テスト**

実装を開始しますか？

