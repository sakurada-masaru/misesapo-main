/**
 * 顧客関連ページ用の簡易認証スクリプト
 * 各ページでこのスクリプトを読み込むことで、パスワード保護を有効化します
 */
(function() {
  'use strict';
  
  // 認証設定
  const AUTH_KEY = 'client_page_authenticated';
  const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8時間
  const CLIENT_PASSWORD = 'misesapo1234'; // 顧客ページ用パスワード
  
  // DOM要素
  const mainContent = document.getElementById('main');
  if (!mainContent) return; // main要素がない場合は終了
  
  // 認証フォームのHTML
  const authFormHTML = `
    <div class="client-auth-form" id="client-auth-form">
      <div class="auth-card">
        <h2>
          <i class="fas fa-lock"></i>
          認証が必要です
        </h2>
        <p class="auth-description">このページは顧客情報を含むため、パスワード保護されています。</p>
        <form id="client-login-form">
          <div class="form-group">
            <label class="form-label">パスワード</label>
            <input type="password" class="form-input" id="client-password-input" placeholder="パスワードを入力" required autofocus />
          </div>
          <button type="submit" class="btn btn-primary btn-block">
            <i class="fas fa-unlock"></i> 認証
          </button>
        </form>
        <p class="auth-error" id="client-auth-error" style="display: none;"></p>
      </div>
    </div>
  `;
  
  // 認証フォームのスタイル
  const authStyles = `
    <style>
      .client-auth-form {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 60vh;
        padding: 40px 20px;
      }
      .client-auth-form .auth-card {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 40px;
        max-width: 400px;
        width: 100%;
      }
      .client-auth-form h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #111827;
        margin: 0 0 12px 0;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }
      .client-auth-form h2 i {
        color: var(--primary, #ec4899);
      }
      .client-auth-form .auth-description {
        font-size: 0.875rem;
        color: #6b7280;
        text-align: center;
        margin: 0 0 24px 0;
        line-height: 1.6;
      }
      .client-auth-form .form-group {
        margin-bottom: 24px;
      }
      .client-auth-form .form-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
        margin-bottom: 8px;
      }
      .client-auth-form .form-input {
        width: 100%;
        padding: 12px 16px;
        font-size: 1rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        box-sizing: border-box;
      }
      .client-auth-form .form-input:focus {
        outline: none;
        border-color: var(--primary, #ec4899);
        box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
      }
      .client-auth-form .btn-block {
        width: 100%;
        padding: 12px 24px;
        font-size: 1rem;
        font-weight: 600;
      }
      .client-auth-form .auth-error {
        margin-top: 16px;
        padding: 12px;
        background: #fee2e2;
        border: 1px solid #fca5a5;
        border-radius: 8px;
        color: #991b1b;
        font-size: 0.875rem;
        text-align: center;
      }
    </style>
  `;
  
  // 認証チェック関数
  function checkAuthentication() {
    const authData = sessionStorage.getItem(AUTH_KEY);
    if (!authData) return false;
    
    try {
      const { timestamp } = JSON.parse(authData);
      const now = Date.now();
      if (now - timestamp > SESSION_DURATION) {
        sessionStorage.removeItem(AUTH_KEY);
        return false;
      }
      return true;
    } catch (e) {
      sessionStorage.removeItem(AUTH_KEY);
      return false;
    }
  }
  
  // 認証設定関数
  function setAuthentication() {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify({
      timestamp: Date.now()
    }));
  }
  
  // 認証フォームを表示
  function showAuthForm() {
    // スタイルを追加
    if (!document.getElementById('client-auth-styles')) {
      const styleEl = document.createElement('div');
      styleEl.id = 'client-auth-styles';
      styleEl.innerHTML = authStyles;
      document.head.appendChild(styleEl);
    }
    
    // メインコンテンツを非表示
    mainContent.style.display = 'none';
    
    // 認証フォームを追加
    if (!document.getElementById('client-auth-form')) {
      const authDiv = document.createElement('div');
      authDiv.innerHTML = authFormHTML;
      mainContent.parentNode.insertBefore(authDiv.firstElementChild, mainContent);
      
      // フォームイベントリスナーを設定
      const loginForm = document.getElementById('client-login-form');
      const passwordInput = document.getElementById('client-password-input');
      const authError = document.getElementById('client-auth-error');
      
      if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
          e.preventDefault();
          const password = passwordInput.value;
          
          if (password === CLIENT_PASSWORD) {
            setAuthentication();
            authError.style.display = 'none';
            hideAuthForm();
          } else {
            authError.textContent = 'パスワードが正しくありません';
            authError.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
          }
        });
      }
    }
  }
  
  // 認証フォームを非表示
  function hideAuthForm() {
    const authForm = document.getElementById('client-auth-form');
    if (authForm) {
      authForm.remove();
    }
    mainContent.style.display = '';
  }
  
  // 初期化
  if (checkAuthentication()) {
    // 認証済みの場合はコンテンツを表示
    hideAuthForm();
  } else {
    // 未認証の場合は認証フォームを表示
    showAuthForm();
  }
})();

