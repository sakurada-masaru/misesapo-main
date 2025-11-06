# EmailJSテンプレート設定ガイド（スクリーンショット対応）

スクリーンショットをメールに含めるためのEmailJSテンプレート設定手順です。

## 現在の設定

- **Service ID**: `service_hx88k5s`
- **Template ID**: `template_alkj896`
- **Public Key**: `pLD_aLYcX2lhiCSRl`

## テンプレート設定手順

### 1. EmailJSダッシュボードにアクセス

1. https://dashboard.emailjs.com/admin/template にアクセス
2. ログインする

### 2. テンプレートを編集

1. テンプレート一覧から `template_alkj896` をクリック
2. 「Edit」をクリック

### 3. HTMLモードを有効にする

1. テンプレート編集画面の上部で「HTML」タブをクリック
   - または「Settings」→「Content Type」を「HTML」に変更

### 4. テンプレート本文を設定

**Subject（件名）:**
```
フィードバック: {{page_title}}
```

**Content（本文）:**
```html
フィードバックが届きました。

<p><strong>ページ:</strong> {{page_title}}</p>
<p><strong>URL:</strong> <a href="{{page_url}}">{{page_url}}</a></p>
<p><strong>日時:</strong> {{timestamp}}</p>

<h3>コメント:</h3>
<p style="white-space: pre-wrap;">{{comment}}</p>

<p><strong>スクリーンショット:</strong> {{has_screenshot}}</p>

{{screenshot_image}}
```

### 5. テンプレート変数の確認

以下の変数が使用可能です：
- `{{page_title}}` - ページタイトル
- `{{page_url}}` - ページURL
- `{{timestamp}}` - 送信日時
- `{{comment}}` - コメント（テキスト）
- `{{has_screenshot}}` - スクリーンショットの有無（「あり」/「なし」）
- `{{screenshot_image}}` - スクリーンショット画像（HTMLの`<img>`タグ）

### 6. 保存

1. 「Save」をクリック
2. 設定が反映されます

## 動作確認

### テスト方法

1. サイトでフィードバックを送信
2. EmailJSダッシュボードの「Logs」で送信履歴を確認
3. メールが届いているか確認
4. スクリーンショットが画像として表示されているか確認

### トラブルシューティング

#### スクリーンショットが表示されない場合

1. **HTMLモードが有効か確認**
   - テンプレート編集画面で「HTML」タブが選択されているか確認
   - 「Settings」で「Content Type」が「HTML」になっているか確認

2. **テンプレート変数が正しいか確認**
   - `{{screenshot_image}}` がテンプレート本文に含まれているか確認
   - 変数名のスペルミスがないか確認

3. **メールクライアントの制限**
   - 一部のメールクライアント（Outlook等）ではbase64画像が表示されない場合があります
   - GmailやApple Mailでは正常に表示されます

4. **EmailJSのログを確認**
   - EmailJSダッシュボードの「Logs」で送信履歴を確認
   - エラーメッセージがないか確認

## 代替案（base64画像が表示されない場合）

もしbase64画像が表示されない場合は、画像ホスティングサービスを使用する方法があります：

1. **Imgur API**を使用してスクリーンショットをアップロード
2. アップロードした画像のURLをメールに含める

この方法を実装する場合は、お知らせください。

