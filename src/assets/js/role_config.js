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
      name: '顧客', 
      password: 'customer1234',
      displayName: '顧客'
    },
    staff: { 
      name: '清掃員', 
      password: 'staff1234',
      displayName: '清掃員'
    },
    sales: { 
      name: '営業マン', 
      password: 'sales1234',
      displayName: '営業マン'
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
  roleHierarchy: {
    guest: ['guest'],
    customer: ['guest', 'customer'],
    staff: ['guest', 'staff'],
    sales: ['guest', 'sales'],
    admin: ['guest', 'customer', 'staff', 'sales', 'admin'],
    developer: ['guest', 'customer', 'staff', 'sales', 'admin', 'developer']
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
    
    // 顧客向けページ
    '/mypage.html': ['customer', 'admin', 'developer'],
    '/mypage/': ['customer', 'admin', 'developer'],
    '/cart.html': ['customer', 'admin', 'developer'],
    '/checkout.html': ['customer', 'admin', 'developer'],
    '/order/': ['customer', 'admin', 'developer'],
    '/order-complete.html': ['customer', 'admin', 'developer'],
    '/order-confirm.html': ['customer', 'admin', 'developer'],
    
    // 清掃員向けページ
    '/staff/': ['staff', 'admin', 'developer'],
    '/schedule.html': ['staff', 'admin', 'developer'],
    '/report.html': ['staff', 'admin', 'developer'],
    '/reports/': ['staff', 'admin', 'developer'],
    
    // 営業マン向けページ
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

