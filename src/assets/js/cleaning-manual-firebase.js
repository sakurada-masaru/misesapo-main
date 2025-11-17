/**
 * 清掃マニュアル管理 - Firebase統合
 * FirestoreとFirebase Storageを使用
 */

(function() {
    'use strict';
    
    // Firestoreコレクション名
    const FIRESTORE_COLLECTION = 'cleaning-manual';
    const FIRESTORE_DRAFT_COLLECTION = 'cleaning-manual-drafts';
    const STORAGE_PATH = 'cleaning-manual-images';
    
    // 認証が必要なロール
    const ALLOWED_ROLES = ['admin', 'staff', 'concierge', 'developer', 'master'];
    
    /**
     * 認証チェック
     */
    async function checkAuth() {
        return new Promise((resolve) => {
            if (!window.FirebaseAuth) {
                console.log('[CleaningManualFirebase] FirebaseAuth not available');
                resolve({ authenticated: false, user: null, role: null });
                return;
            }
            
            // 現在のユーザーを直接取得
            const currentUser = window.FirebaseAuth.currentUser;
            
            // onAuthStateChangedを使用して、認証状態の変更を監視
            const unsubscribe = window.FirebaseAuth.onAuthStateChanged(async (user) => {
                unsubscribe(); // 一度だけ実行するために解除
                
                if (!user) {
                    console.log('[CleaningManualFirebase] No user authenticated');
                    resolve({ authenticated: false, user: null, role: null });
                    return;
                }
                
                // ロールを取得
                let role = 'customer';
                try {
                    const idTokenResult = await user.getIdTokenResult(true); // forceRefresh: true
                    role = idTokenResult.claims.role || 'customer';
                    console.log('[CleaningManualFirebase] Role from Custom Claims:', role);
                } catch (error) {
                    console.warn('[CleaningManualFirebase] Could not get custom claims:', error);
                }
                
                // Custom Claimsにロールがない場合、または'customer'の場合、users.jsからロールを取得
                if (role === 'customer' && window.Users && window.Users.findUserByEmail) {
                    const userFromUsersJs = window.Users.findUserByEmail(user.email);
                    if (userFromUsersJs && userFromUsersJs.role) {
                        role = userFromUsersJs.role;
                        console.log('[CleaningManualFirebase] Role from users.js:', role);
                    }
                }
                
                const isAuthenticated = ALLOWED_ROLES.includes(role);
                console.log('[CleaningManualFirebase] Auth check result:', {
                    email: user.email,
                    role: role,
                    authenticated: isAuthenticated,
                    allowedRoles: ALLOWED_ROLES
                });
                
                resolve({
                    authenticated: isAuthenticated,
                    user: user,
                    role: role
                });
            });
            
            // 既にログイン済みの場合、すぐにチェック
            if (currentUser) {
                // onAuthStateChangedは非同期で呼ばれるため、少し待つ
                setTimeout(() => {
                    if (currentUser === window.FirebaseAuth.currentUser) {
                        // まだ解決されていない場合のみ処理
                    }
                }, 100);
            }
        });
    }
    
    /**
     * Firestoreからデータを読み込む
     */
    async function loadDataFromFirestore() {
        if (!window.FirebaseFirestore) {
            throw new Error('Firestore is not initialized');
        }
        
        const db = window.FirebaseFirestore;
        const docRef = db.collection(FIRESTORE_COLLECTION).doc('data');
        const doc = await docRef.get();
        
        if (doc.exists) {
            return doc.data();
        } else {
            // 初期データを返す
            return {
                kitchen: [],
                aircon: [],
                floor: [],
                other: []
            };
        }
    }
    
    /**
     * Firestoreにデータを保存（確定版）
     */
    async function saveDataToFirestore(data, isDraft = false) {
        if (!window.FirebaseFirestore) {
            throw new Error('Firestore is not initialized');
        }
        
        const db = window.FirebaseFirestore;
        const collection = isDraft ? FIRESTORE_DRAFT_COLLECTION : FIRESTORE_COLLECTION;
        const docRef = db.collection(collection).doc('data');
        
        const saveData = {
            ...data,
            updatedAt: window.FirebaseFirestore.FieldValue.serverTimestamp(),
            updatedBy: window.FirebaseAuth.currentUser?.email || 'unknown'
        };
        
        await docRef.set(saveData, { merge: true });
        return true;
    }
    
    /**
     * 下書きデータを取得
     */
    async function loadDraftFromFirestore() {
        if (!window.FirebaseFirestore) {
            return null;
        }
        
        const db = window.FirebaseFirestore;
        const docRef = db.collection(FIRESTORE_DRAFT_COLLECTION).doc('data');
        const doc = await docRef.get();
        
        if (doc.exists) {
            return doc.data();
        }
        return null;
    }
    
    /**
     * Firebase Storageに画像をアップロード
     */
    async function uploadImageToStorage(file, fieldName) {
        if (!window.FirebaseStorage) {
            throw new Error('Firebase Storage is not initialized');
        }
        
        const storage = window.FirebaseStorage;
        const storageRef = storage.ref();
        
        // ファイル名を生成（タイムスタンプ + 元のファイル名）
        const timestamp = Date.now();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${timestamp}_${fieldName}_${safeFileName}`;
        const imageRef = storageRef.child(`${STORAGE_PATH}/${fileName}`);
        
        // アップロード
        const snapshot = await imageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        return {
            url: downloadURL,
            path: downloadURL // Firebase StorageのURLを返す
        };
    }
    
    // グローバルに公開
    window.CleaningManualFirebase = {
        checkAuth,
        loadDataFromFirestore,
        saveDataToFirestore,
        loadDraftFromFirestore,
        uploadImageToStorage,
        ALLOWED_ROLES
    };
})();

