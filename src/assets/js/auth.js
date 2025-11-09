/**
 * 統一認証システム
 * ロールベースのアクセス制御を実装
 * 
 * 注意: role_config.jsが先に読み込まれている必要があります
 */

(function() {
  'use strict';
  
  // role_config.jsから関数を取得（グローバルスコープから）
  const checkPageAccess = window.RoleConfig?.checkPageAccess || function() { return false; };
  const getRoleDisplayName = window.RoleConfig?.getRoleDisplayName || function(role) { return role; };
  
  // 認証設定
  const AUTH_KEY = 'misesapo_auth';
  const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8時間
  
  /**
   * 認証情報を取得
   */
  function getAuthData() {
    try {
      const authData = sessionStorage.getItem(AUTH_KEY);
      if (!authData) return null;
      
      const data = JSON.parse(authData);
      const now = Date.now();
      
      // セッション期限をチェック
      if (now - data.timestamp > SESSION_DURATION) {
        sessionStorage.removeItem(AUTH_KEY);
        return null;
      }
      
      return data;
    } catch (e) {
      return null;
    }
  }
  
  /**
   * 認証情報を保存
   */
  function setAuthData(role, email = null) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify({
      role: role,
      email: email,
      timestamp: Date.now()
    }));
  }
  
  /**
   * 認証情報を削除
   */
  function clearAuthData() {
    sessionStorage.removeItem(AUTH_KEY);
  }
  
  /**
   * 現在のロールを取得
   */
  function getCurrentRole() {
    const authData = getAuthData();
    return authData ? authData.role : 'guest';
  }
  
  /**
   * ログイン
   */
  function login(role, password, email = null) {
    const roleConfig = ROLE_CONFIG.roles[role];
    if (!roleConfig) {
      return { success: false, message: '無効なロールです' };
    }
    
    // パスワードチェック
    if (roleConfig.password && roleConfig.password !== password) {
      return { success: false, message: 'パスワードが正しくありません' };
    }
    
    // 認証情報を保存
    setAuthData(role, email);
    
    return { success: true, role: role };
  }
  
  /**
   * ログアウト
   */
  function logout() {
    clearAuthData();
    // ログインページにリダイレクト
    const basePath = getBasePath();
    window.location.href = basePath === '/' ? '/signin.html' : basePath + 'signin.html';
  }
  
  /**
   * 認証チェック
   */
  function checkAuth() {
    return getAuthData() !== null;
  }
  
  /**
   * ページアクセス権限をチェック
   */
  function checkPageAccessForPath(path) {
    const currentRole = getCurrentRole();
    return checkPageAccess(path, currentRole);
  }
  
  /**
   * ベースパスを取得（GitHub Pages対応）
   */
  function getBasePath() {
    const base = document.querySelector('base');
    if (base && base.href) {
      try {
        const url = new URL(base.href);
        return url.pathname;
      } catch (e) {
        return base.getAttribute('href') || '/';
      }
    }
    const path = window.location.pathname;
    if (path.includes('/misesapo/')) {
      return '/misesapo/';
    }
    return '/';
  }
  
  /**
   * パスを解決（ベースパス付き）
   */
  function resolvePath(path) {
    if (!path || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
      return path;
    }
    const basePath = getBasePath();
    if (path.startsWith('/')) {
      return basePath === '/' ? path : basePath.slice(0, -1) + path;
    }
    return basePath === '/' ? '/' + path : basePath + path;
  }
  
  /**
   * 現在のページへのアクセス権限をチェック
   */
  function checkCurrentPageAccess() {
    const currentPath = window.location.pathname;
    const currentRole = getCurrentRole();
    
    // 管理者と開発者はすべてのページにアクセス可能
    if (currentRole === 'admin' || currentRole === 'developer') {
      return true;
    }
    
    // ログインページとサインアップページは常にアクセス可能
    if (currentPath.includes('/signin.html') || currentPath.includes('/signup')) {
      return true;
    }
    
    // ページアクセス権限をチェック
    if (typeof checkPageAccess === 'function' && !checkPageAccess(currentPath, currentRole)) {
      // アクセス権限がない場合、ログインページにリダイレクト
      const redirectUrl = encodeURIComponent(window.location.href);
      const basePath = getBasePath();
      window.location.href = basePath === '/' 
        ? `/signin.html?redirect=${redirectUrl}` 
        : `${basePath}signin.html?redirect=${redirectUrl}`;
      return false;
    }
    
    return true;
  }
  
  /**
   * ヘッダーナビゲーションの表示/非表示を制御
   */
  function updateHeaderNavigation() {
    const currentRole = getCurrentRole();
    const navDev = document.querySelector('.nav-dev');
    
    // 管理者と開発者以外は開発用ナビゲーションを非表示
    if (navDev) {
      if (currentRole === 'admin' || currentRole === 'developer') {
        navDev.style.display = '';
      } else {
        navDev.style.display = 'none';
      }
    }
    
    // ログイン状態に応じてヘッダーを更新
    const navRight = document.querySelector('.nav-right');
    if (navRight) {
      const authData = getAuthData();
      if (authData) {
        // ログイン済みの場合、ログアウトボタンを表示
        const loginLink = navRight.querySelector('a[href*="signin.html"]');
        if (loginLink) {
          loginLink.textContent = 'ログアウト';
          loginLink.href = '#';
          loginLink.onclick = function(e) {
            e.preventDefault();
            logout();
          };
        }
        
        // ロール表示（オプション）
        const roleDisplay = document.createElement('span');
        roleDisplay.className = 'nav-role';
        const roleName = (typeof getRoleDisplayName === 'function') 
          ? getRoleDisplayName(currentRole) 
          : currentRole;
        roleDisplay.textContent = `(${roleName})`;
        roleDisplay.style.cssText = 'font-size: 0.75rem; color: #6b7280; margin-left: 8px;';
        if (!navRight.querySelector('.nav-role')) {
          navRight.insertBefore(roleDisplay, navRight.firstChild);
        }
      }
    }
  }
  
  // グローバルに公開
  window.Auth = {
    login: login,
    logout: logout,
    checkAuth: checkAuth,
    getCurrentRole: getCurrentRole,
    checkPageAccess: checkPageAccessForPath,
    checkCurrentPageAccess: checkCurrentPageAccess,
    updateHeaderNavigation: updateHeaderNavigation,
    getAuthData: getAuthData
  };
  
  // ページ読み込み時に実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      checkCurrentPageAccess();
      updateHeaderNavigation();
    });
  } else {
    checkCurrentPageAccess();
    updateHeaderNavigation();
  }
})();

