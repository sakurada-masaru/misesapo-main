# Implementation Plan - Customer Karte UI (店舗カルテUI)

## Goal Description
既存の顧客詳細ページ（または一覧からの遷移先）を、医療用電子カルテを模した「店舗カルテ」デザインに刷新します。
建物の健康状態（清潔度、設備状態）を一目で把握できるようにし、管理者（医師役）が適切な処置（清掃指示）を行えるようにします。

## Proposed Changes

### [Frontend] `src/pages/admin/users/`

#### [MODIFY] `src/pages/admin/users/customers.html`
既存の顧客管理画面を「店舗カルテ」デザインに刷新し、実APIと接続します。

1.  **Backend Integration (API)**
    *   **Endpoint**: `misesapo-kartes-api` (Gateway URLを要確認、または `clients_lambda` から呼び出し)
    *   **Action**: `GET /kartes?client_id={id}` または `?store_id={id}` を使用してデータ取得。
    *   **Data**: Mockではなく実データを表示する実装にする（データがない場合はEmpty Stateを表示）。

2.  **Left Sidebar (Patient Info / 基本情報)**
    *   店舗名、住所、責任者名、建物タイプを固定表示。

    *   顔写真（店舗外観写真）を円形または四角で表示。

2.  **Main Content (Medical History / メンテナンス履歴)**
    *   時系列のタイムライン表示。
    *   「定期清掃」「スポット対応」「点検」などのイベントをアイコン付きで表示。
    *   実施前後の写真（Before/After）を表示可能なスペース。
    *   ステータスバッジ（完了、要対応、観察中）。

3.  **Right Panel (Vitals & Notes / バイタル＆申し送り)**
    *   **清潔度メーター**: ゲージチャートやプログレスバーで可視化（例: 85/100点）。
    *   **設備ステータス**: 空調、排水などの状態を信号機カラー（青・黄・赤）で表示。
    *   **Staff Notes (申し送り)**: 付箋風のデザインで、現場スタッフからの特記事項を表示。

### [Style] `src/assets/css/admin-karte.css` (New)
*   医療現場のような清潔感のある白・青ベースの配色。
*   シャドウを活用したカードデザイン。
*   アラートカラー（赤、オレンジ）による視覚的注意喚起。

## Verification Plan

### Manual Verification
*   ブラウザで `http://localhost:5173/admin/users/customers` (または新規パス) にアクセス。
*   レスポンシブ動作の確認（タブレットでの閲覧を想定）。
*   ダミーデータを用いた表示崩れの確認。
