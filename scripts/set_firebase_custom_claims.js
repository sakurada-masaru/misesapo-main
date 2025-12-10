/**
 * Firebase Custom Claims設定スクリプト
 * 
 * このスクリプトは、Firebase Authenticationに登録されているユーザーに
 * Custom Claimsでロールを設定します。
 * 
 * 使用方法:
 * 1. Firebase Consoleからサービスアカウントキーを取得
 * 2. scripts/firebase-service-account.json に保存
 * 3. npm install firebase-admin
 * 4. node scripts/set_firebase_custom_claims.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// サービスアカウントキーのパス
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

// サービスアカウントキーが存在するか確認
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ エラー: firebase-service-account.json が見つかりません');
  console.error('');
  console.error('📝 手順:');
  console.error('1. Firebase Console → プロジェクトの設定 → サービスアカウント');
  console.error('2. 「新しい秘密鍵を生成」をクリック');
  console.error('3. ダウンロードしたJSONファイルを scripts/firebase-service-account.json に保存');
  console.error('');
  process.exit(1);
}

// Firebase Admin SDKを初期化
try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin SDKを初期化しました');
} catch (error) {
  console.error('❌ エラー: Firebase Admin SDKの初期化に失敗しました');
  console.error(error);
  process.exit(1);
}

// ユーザーとロールのマッピング
const userRoles = {
  'admin@misesapo.app': 'admin',
  'keiri@misesapo.app': 'admin',
  'worker@misesapo.app': 'staff',
  'design@misesapo.app': 'developer',
  'misesapofeedback@gmail.com': 'concierge',
  'info@misesapo.app': 'master',
  'masarunospec@gmail.com': 'master'
};

/**
 * メールアドレスからユーザーUIDを取得
 */
async function getUserByEmail(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    return user;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}

/**
 * Custom Claimsでロールを設定
 */
async function setUserRole(uid, role) {
  try {
    await admin.auth().setCustomUserClaims(uid, { role: role });
    return true;
  } catch (error) {
    console.error(`❌ エラー: ${uid} にロールを設定できませんでした`);
    console.error(error);
    return false;
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('');
  console.log('🚀 Firebase Custom Claims設定を開始します...');
  console.log('');
  
  const results = {
    success: [],
    notFound: [],
    error: []
  };
  
  // 各ユーザーに対してロールを設定
  for (const [email, role] of Object.entries(userRoles)) {
    console.log(`📧 ${email} → ${role} を設定中...`);
    
    try {
      // ユーザーを取得
      const user = await getUserByEmail(email);
      
      if (!user) {
        console.log(`   ⚠️  ユーザーが見つかりませんでした`);
        results.notFound.push({ email, role });
        continue;
      }
      
      // Custom Claimsを設定
      const success = await setUserRole(user.uid, role);
      
      if (success) {
        console.log(`   ✅ ロールを設定しました (UID: ${user.uid})`);
        results.success.push({ email, role, uid: user.uid });
      } else {
        results.error.push({ email, role });
      }
    } catch (error) {
      console.error(`   ❌ エラーが発生しました: ${error.message}`);
      results.error.push({ email, role, error: error.message });
    }
    
    console.log('');
  }
  
  // 結果を表示
  console.log('📊 結果:');
  console.log(`   ✅ 成功: ${results.success.length}件`);
  console.log(`   ⚠️  ユーザーが見つからない: ${results.notFound.length}件`);
  console.log(`   ❌ エラー: ${results.error.length}件`);
  console.log('');
  
  if (results.success.length > 0) {
    console.log('✅ 正常に設定されたユーザー:');
    results.success.forEach(({ email, role, uid }) => {
      console.log(`   - ${email} (${role}) - UID: ${uid}`);
    });
    console.log('');
  }
  
  if (results.notFound.length > 0) {
    console.log('⚠️  ユーザーが見つからなかったメールアドレス:');
    results.notFound.forEach(({ email, role }) => {
      console.log(`   - ${email} (${role})`);
    });
    console.log('');
    console.log('💡 解決方法:');
    console.log('   Firebase Console → Authentication → Users で、これらのメールアドレスのユーザーが登録されているか確認してください');
    console.log('');
  }
  
  if (results.error.length > 0) {
    console.log('❌ エラーが発生したユーザー:');
    results.error.forEach(({ email, role, error }) => {
      console.log(`   - ${email} (${role})`);
      if (error) {
        console.log(`     エラー: ${error}`);
      }
    });
    console.log('');
  }
  
  console.log('✨ 処理が完了しました');
}

// スクリプトを実行
main().catch((error) => {
  console.error('❌ 予期しないエラーが発生しました:');
  console.error(error);
  process.exit(1);
});

