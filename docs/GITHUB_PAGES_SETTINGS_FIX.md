# GitHub Pages設定の修正方法

## 🔧 問題

GitHub Pagesの設定が「Deploy from a branch」になっているため、GitHub Actionsのワークフローが正しく動作していません。

## ✅ 解決方法

### ステップ1: GitHub Pagesの設定を開く

1. https://github.com/sakurada-masaru/misesapo/settings/pages にアクセス
2. 「Source」セクションを確認

### ステップ2: ソースを「GitHub Actions」に変更

1. 「Source」のドロップダウンをクリック
2. 「GitHub Actions」を選択
3. 「Save」をクリック

### ステップ3: 確認

1. 設定が「GitHub Actions」に変更されたことを確認
2. GitHub Actionsのワークフローが実行されるまで待つ（数分）
3. https://sakurada-masaru.github.io/misesapo/ にアクセスして確認

## 📋 現在の設定

### 現在の設定（間違っている）
- **Source**: Deploy from a branch
- **Branch**: main / gh-pages / その他

### 正しい設定
- **Source**: GitHub Actions
- **Branch**: （設定不要）

## ⚠️ 注意事項

1. **「Deploy from a branch」を選択している場合**
   - GitHub Actionsのワークフローが実行されても、デプロイされません
   - `public/` ディレクトリまたは `gh-pages` ブランチから直接デプロイされます

2. **「GitHub Actions」を選択している場合**
   - `.github/workflows/pages.yml` のワークフローが実行されます
   - ビルドスクリプトが実行され、`public/` ディレクトリが生成されます
   - 生成されたファイルがGitHub Pagesにデプロイされます

## 🔍 確認方法

### 1. GitHub Pagesの設定を確認

1. https://github.com/sakurada-masaru/misesapo/settings/pages にアクセス
2. 「Source」が「GitHub Actions」になっているか確認

### 2. GitHub Actionsのワークフローを確認

1. https://github.com/sakurada-masaru/misesapo/actions にアクセス
2. 「Deploy to GitHub Pages」ワークフローが実行されているか確認
3. 最新の実行が成功しているか確認

### 3. 実際のページを確認

1. https://sakurada-masaru.github.io/misesapo/ にアクセス
2. ページが正しく表示されるか確認

## 🛠️ トラブルシューティング

### 問題: 「GitHub Actions」が選択肢に表示されない

**原因**: GitHub Actionsのワークフローが存在しない、または正しく設定されていない

**対処法**:
1. `.github/workflows/pages.yml` が存在するか確認
2. ワークフローファイルが正しい形式か確認
3. 一度リポジトリにプッシュしてから、再度設定を確認

### 問題: 設定を変更しても反映されない

**対処法**:
1. ブラウザをリフレッシュ
2. 数分待ってから再度確認
3. GitHub Actionsのワークフローを手動で実行

## 📝 次のステップ

1. **GitHub Pagesの設定を変更**
   - Sourceを「GitHub Actions」に変更

2. **GitHub Actionsのワークフローを確認**
   - 最新の実行が成功しているか確認

3. **実際のページを確認**
   - https://sakurada-masaru.github.io/misesapo/ にアクセス
   - ページが正しく表示されるか確認

設定を変更したら、GitHub Actionsのワークフローが自動的に実行されます。数分待ってから、ページが正しく表示されるか確認してください。

