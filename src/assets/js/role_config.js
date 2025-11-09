/**
 * ロール設定とページアクセス制御
 */

const ROLE_CONFIG = {
  // ロール定義
  roles: {
    guest: { 
      name: 'ゲスト', 
      password: null,
      displayName: 'ゲスト'
    },
    customer: { 
      name: 'ユーザー（顧客）', 
      password: 'customer1234',
      displayName: 'ユーザー'
    },
    staff: { 
      name: '清掃員', 
      password: 'staff1234',
      displayName: '清掃員'
    },
    sales: { 
      name: 'コンシェルジュ（営業マン）', 
      password: 'sales1234',
      displayName: 'コンシェルジュ'
    },
    admin: { 
      name: '管理者', 
      password: 'admin1234',
      displayName: '管理者'
    },
    developer: { 
      name: '開発者', 
      password: 'misesapo1234',
      displayName: '開発者'
    }
  },
  
  // ロール階層（上位ロールは下位ロールの権限も持つ）
  // 階層: 管理者 > コンシェルジュ（営業マン） > 清掃員・ユーザー（同レベル）
  roleHierarchy: {
    guest: ['guest'],
    customer: ['guest', 'customer'],  // ユーザー（顧客）
    staff: ['guest', 'staff'],        // 清掃員
    sales: ['guest', 'customer', 'staff', 'sales'],  // コンシェルジュ（営業マン）: 清掃員とユーザーの権限も持つ
    admin: ['guest', 'customer', 'staff', 'sales', 'admin'],  // 管理者: すべての権限
    developer: ['guest', 'customer', 'staff', 'sales', 'admin', 'developer']  // 開発者: すべての権限
  },
  
  // ページ別アクセス制御（パスパターン）
  pageAccess: {
    // パブリックページ（全員アクセス可能）
    '/index.html': ['guest', 'customer', 'staff', 'sales', 'admin', 'developer'],
    '/service.html': ['guest', 'customer', 'staff', 'sales', 'admin', 'developer'],
    '/service/': ['guest', 'customer', 'staff', 'sales', 'admin', 'developer'],
    '/signin.html': ['guest', 'customer', 'staff', 'sales', 'admin', 'developer'],
    '/signup.html': ['guest', 'customer', 'staff', 'sales', 'admin', 'developer'],
    '/signup2.html': ['guest', 'customer', 'staff', 'sales', 'admin', 'developer'],
    '/signup3.html': ['guest', 'customer', 'staff', 'sales', 'admin', 'developer'],
    '/reset-password.html': ['guest', 'customer', 'staff', 'sales', 'admin', 'developer'],
    '/contact.html': ['guest', 'customer', 'staff', 'sales', 'admin', 'developer'],
    '/concierge.html': ['guest', 'customer', 'staff', 'sales', 'admin', 'developer'],
    
    // 顧客向けページ（ユーザーと清掃員がアクセス可能、コンシェルジュと管理者も可）
    '/mypage.html': ['customer', 'staff', 'sales', 'admin', 'developer'],
    '/mypage/': ['customer', 'staff', 'sales', 'admin', 'developer'],
    '/cart.html': ['customer', 'staff', 'sales', 'admin', 'developer'],
    '/checkout.html': ['customer', 'staff', 'sales', 'admin', 'developer'],
    '/order/': ['customer', 'staff', 'sales', 'admin', 'developer'],
    '/order-complete.html': ['customer', 'staff', 'sales', 'admin', 'developer'],
    '/order-confirm.html': ['customer', 'staff', 'sales', 'admin', 'developer'],
    
    // 清掃員向けページ（清掃員とユーザーがアクセス可能、コンシェルジュと管理者も可）
    '/staff/': ['staff', 'customer', 'sales', 'admin', 'developer'],
    '/schedule.html': ['staff', 'customer', 'sales', 'admin', 'developer'],
    '/report.html': ['staff', 'customer', 'sales', 'admin', 'developer'],
    '/reports/': ['staff', 'customer', 'sales', 'admin', 'developer'],
    
    // 営業マン向けページ（コンシェルジュと管理者のみ）
    '/sales/': ['sales', 'admin', 'developer'],
    
    // 管理者向けページ（管理者と開発者のみ）
    '/admin/': ['admin', 'developer'],
    
    // 開発者向けページ（開発者のみ）
    '/admin/services/review.html': ['developer']
  }
};

/**
 * パスがパターンにマッチするかチェック
 */
function matchPathPattern(path, pattern) {
  if (pattern === path) {
    return true;
  }
  if (pattern.endsWith('/') && path.startsWith(pattern)) {
    return true;
  }
  if (pattern.endsWith('/*') && path.startsWith(pattern.slice(0, -2))) {
    return true;
  }
  return false;
}

/**
 * ページへのアクセス権限をチェック
 */
function checkPageAccess(path, userRole) {
  // 管理者と開発者はすべてのページにアクセス可能
  if (userRole === 'admin' || userRole === 'developer') {
    return true;
  }
  
  // パスを正規化（クエリパラメータやハッシュを除去）
  const normalizedPath = path.split('?')[0].split('#')[0];
  
  // ページアクセス設定をチェック
  for (const [pattern, allowedRoles] of Object.entries(ROLE_CONFIG.pageAccess)) {
    if (matchPathPattern(normalizedPath, pattern)) {
      // ロール階層を考慮
      const userRoles = ROLE_CONFIG.roleHierarchy[userRole] || [userRole];
      return allowedRoles.some(role => userRoles.includes(role));
    }
  }
  
  // デフォルトはアクセス不可
  return false;
}

/**
 * ロール名を取得
 */
function getRoleDisplayName(role) {
  return ROLE_CONFIG.roles[role]?.displayName || role;
}

// グローバルに公開
window.RoleConfig = {
  ROLE_CONFIG: ROLE_CONFIG,
  matchPathPattern: matchPathPattern,
  checkPageAccess: checkPageAccess,
  getRoleDisplayName: getRoleDisplayName
};

