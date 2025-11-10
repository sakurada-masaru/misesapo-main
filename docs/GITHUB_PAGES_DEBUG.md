# GitHub Pages デバッグガイド

## 🔍 問題の確認方法

### 1. GitHub Pagesの設定を確認

**確認場所**: https://github.com/sakurada-masaru/misesapo/settings/pages

**確認事項**:
- [ ] GitHub Pagesが有効化されている
- [ ] ソースが「GitHub Actions」に設定されている
- [ ] ブランチが「main」に設定されている（必要に応じて）
- [ ] カスタムドメインが設定されていない（設定されている場合は確認）

### 2. GitHub Actionsのログを確認

**確認場所**: https://github.com/sakurada-masaru/misesapo/actions

**確認事項**:
1. 最新のワークフロー実行をクリック
2. `build` ジョブをクリック
3. 各ステップのログを確認:
   - `Build static files` が成功しているか
   - エラーメッセージがないか
4. `deploy` ジョブをクリック
5. `Deploy to GitHub Pages` が成功しているか確認

### 3. 実際のページを確認

**URL**: https://sakurada-masaru.github.io/misesapo/

**確認事項**:
- [ ] ページが表示されるか
- [ ] CSSが正しく読み込まれているか（ブラウザのコンソールで確認）
- [ ] 画像が正しく表示されているか
- [ ] リンクが正しく動作するか

### 4. ブラウザのコンソールでエラーを確認

1. ブラウザでページを開く
2. F12キーを押して開発者ツールを開く
3. `Console` タブを確認
4. エラーメッセージを確認

**よくあるエラー**:
- `404 (Not Found)`: ファイルが見つからない
- `Failed to load resource`: リソースの読み込みに失敗
- `CORS error`: クロスオリジンエラー

## 🛠️ トラブルシューティング

### 問題1: ページが表示されない（404エラー）

**原因**:
- GitHub Pagesが有効化されていない
- ビルドが失敗している
- パスが正しくない

**対処法**:
1. GitHub Pagesの設定を確認
2. GitHub Actionsのログを確認
3. `public/index.html` が存在するか確認

### 問題2: CSSや画像が読み込まれない

**原因**:
- ベースパス（`/misesapo/`）が正しく設定されていない
- パスが絶対パス（`/css/style.css`）のままになっている

**対処法**:
1. `public/index.html` の `<base href="/misesapo/" />` を確認
2. CSSや画像のパスが `/misesapo/css/style.css` になっているか確認
3. ビルドスクリプトが正しく実行されているか確認

### 問題3: ページは表示されるが、スタイルが適用されない

**原因**:
- CSSファイルのパスが正しくない
- ビルド時にパスが修正されていない

**対処法**:
1. ブラウザの開発者ツールでCSSファイルの読み込みを確認
2. `public/index.html` のCSSリンクを確認
3. ビルドスクリプトを再実行

## 📋 確認すべきGitHub設定

### GitHub Pagesの設定

以下の情報を共有してください：

1. **GitHub Pagesの設定**
   - ソース: GitHub Actions / Deploy from a branch / その他
   - ブランチ: main / gh-pages / その他
   - カスタムドメイン: 設定されているか

2. **GitHub Actionsの設定**
   - GitHub Actionsが有効化されているか
   - ワークフローの権限設定

3. **リポジトリの設定**
   - リポジトリが公開（Public）か非公開（Private）か
   - ブランチ保護設定

### エラーメッセージ

以下の情報も共有してください：

1. **ブラウザのコンソールエラー**
   - エラーメッセージの全文
   - エラーが発生しているファイル名

2. **GitHub Actionsのログ**
   - 失敗しているステップ
   - エラーメッセージの全文

3. **実際のURL**
   - アクセスしているURL
   - 表示されないページのURL

## 🔧 デバッグ手順

### ステップ1: ローカルでビルドを確認

```bash
cd /Users/sakuradamasaru/Desktop/misesapo-main
GITHUB_REPOSITORY="sakurada-masaru/misesapo" python3 scripts/build.py
```

### ステップ2: ビルド結果を確認

```bash
head -20 public/index.html | grep -E "(base href|href=|src=)"
```

### ステップ3: GitHub Actionsのログを確認

1. https://github.com/sakurada-masaru/misesapo/actions にアクセス
2. 最新のワークフロー実行をクリック
3. エラーメッセージを確認

## 📝 共有してほしい情報

以下の情報を共有していただけると、問題を特定しやすくなります：

1. **GitHub Pagesの設定画面のスクリーンショット**
   - Settings > Pages の画面

2. **GitHub Actionsのログ**
   - 失敗しているステップのログ

3. **ブラウザのコンソールエラー**
   - F12キーで開いたコンソールのエラーメッセージ

4. **実際のURL**
   - アクセスしているURL
   - 表示されないページのURL

5. **期待される動作**
   - どのように表示されるべきか
   - 現在どのように表示されているか

これらの情報を共有していただければ、問題を特定して解決できます。

