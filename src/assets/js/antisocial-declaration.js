// パスを解決（GitHub Pages対応）
function resolvePath(path) {
    if (!path || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
        return path;
    }
    
    const hostname = window.location.hostname;
    const isLocalDev = hostname === 'localhost' || 
                      hostname === '127.0.0.1' ||
                      hostname === '';
    
    const isCustomDomain = hostname === 'misesapo.co.jp' || hostname === 'www.misesapo.co.jp';
    
    if (isLocalDev || isCustomDomain) {
        return path.startsWith('/') ? path : '/' + path;
    }
    
    // GitHub Pages（sakurada-masaru.github.io）では/misesapo/を追加
    let resolvedPath;
    if (path.startsWith('/misesapo/')) {
        resolvedPath = path;
    } else if (path.startsWith('/')) {
        resolvedPath = '/misesapo' + path;
    } else {
        resolvedPath = '/misesapo/' + path;
    }
    
    return window.location.origin + resolvedPath;
}

// 反社会的勢力排除宣言ページでは通常ヘッダーを常時表示
document.addEventListener('DOMContentLoaded', function() {
    const normalHeader = document.querySelector('.normal-header');
    if (normalHeader) {
        normalHeader.classList.add('visible');
        // スクロールイベントでクラスを削除しないようにする
        const originalRemove = normalHeader.classList.remove;
        normalHeader.classList.remove = function(...args) {
            if (args[0] !== 'visible') {
                originalRemove.apply(this, args);
            }
        };
    }
    
    // リンクを解決
    document.querySelectorAll('a[href^="/"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//')) {
            link.href = resolvePath(href);
        }
    });
    
    // 画像を解決
    document.querySelectorAll('img[src^="/"]').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('//')) {
            img.src = resolvePath(src);
        }
    });
});

