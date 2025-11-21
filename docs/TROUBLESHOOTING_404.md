# 404エラーのトラブルシューティング

## 🔍 404エラーの確認方法

### 1. ブラウザの開発者ツールで確認

1. **開発者ツールを開く**
   - F12キーを押す
   - または、右クリック → 「検証」

2. **Networkタブを開く**
   - 「Network」タブをクリック

3. **ページをリロード**
   - F5キーを押す
   - または、Ctrl+R（Windows）/ Cmd+R（Mac）

4. **404エラーを確認**
   - ステータスコードが「404」のファイルを探す
   - ファイル名を確認

---

## 🆘 よくある404エラーの原因と対処法

### 1. 静的ファイル（CSS、JS、画像）が見つからない

#### 症状
- `/styles.css` が404
- `/css/header.css` が404
- `/images/logo_144x144.png` が404

#### 対処法

1. **ファイルが存在するか確認**
   ```bash
   ls -la public/styles.css
   ls -la public/css/header.css
   ls -la public/images/logo_144x144.png
   ```

2. **ファイルが存在しない場合**
   - ファイルをコピーまたは作成
   - または、パスを修正

3. **ファイルが存在する場合**
   - サーバーを再起動
   - ブラウザのキャッシュをクリア（Ctrl+Shift+R / Cmd+Shift+R）

---

### 2. HTMLページが見つからない

#### 症状
- `/admin/reports.html` が404
- `/admin/reports/new.html` が404

#### 対処法

1. **ビルドを実行**
   ```bash
   python3 scripts/build.py
   ```

2. **ファイルが存在するか確認**
   ```bash
   ls -la public/admin/reports.html
   ls -la public/admin/reports/new.html
   ```

3. **ファイルが存在しない場合**
   - ビルドエラーを確認
   - `src/pages/` にファイルが存在するか確認

---

### 3. 動的ルート（[id]）が見つからない

#### 症状
- `/admin/reports/{report_id}/edit.html` が404
- `/reports/{report_id}.html` が404

#### 対処法

1. **実際のファイルパスを確認**
   - 動的ルートは `[id]` というディレクトリ名になっている
   - 例: `public/admin/reports/[id]/edit.html`

2. **URLを正しく入力**
   - `{report_id}` を実際のレポートIDに置き換える
   - 例: `/admin/reports/123/edit.html`

---

### 4. レイアウトファイルが見つからない

#### 症状
- ビルド時にエラーが発生
- `@layout('layouts.base')` が見つからない

#### 対処法

1. **レイアウトファイルが存在するか確認**
   ```bash
   ls -la src/layouts/base.html
   ```

2. **ファイルが存在しない場合**
   - レイアウトファイルを作成
   - または、`@layout` ディレクティブを削除

---

## 🔧 一般的な対処法

### 1. ビルドを再実行

```bash
python3 scripts/build.py
```

### 2. サーバーを再起動

```bash
# サーバーを停止（Ctrl+C）
# サーバーを再起動
python3 -m http.server 5173 --directory public
```

### 3. ブラウザのキャッシュをクリア

- **Windows/Linux**: Ctrl+Shift+R
- **Mac**: Cmd+Shift+R

### 4. 開発者ツールで確認

- F12キーで開発者ツールを開く
- 「Network」タブで404エラーを確認
- どのファイルが見つからないか確認

---

## 📝 チェックリスト

- [ ] ビルドが正常に完了しているか
- [ ] 必要なファイルが `public/` ディレクトリに存在するか
- [ ] サーバーが正しいディレクトリ（`public`）で起動しているか
- [ ] ブラウザのキャッシュをクリアしたか
- [ ] 開発者ツールで404エラーの詳細を確認したか

---

## 🆘 それでも解決しない場合

1. **エラーメッセージを確認**
   - ブラウザの開発者ツールの「Console」タブ
   - ビルド時のエラーメッセージ

2. **ファイルパスを確認**
   - 相対パスと絶対パスの違い
   - `base` タグの設定

3. **サーバーのログを確認**
   - ターミナルに表示されるエラーメッセージ

