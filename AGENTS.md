# Repository Guidelines

## Project Structure & Module Organization
- Root: `README.md`, `AGENTS.md`, `Dockerfile`, `nginx/default.conf.template`。
- Public assets: `public/` に静的ページ（`index.html`, `login.html`, `signup.html`, `report.html`, `mypage.html`, `styles.css`）。
- 現状は静的モック専用。`src/`・`tests/` は未使用（必要になったら追加）。

## Build, Test, and Development Commands
- Local serve (Python): `python3 -m http.server 5173 --directory public`。
- Local serve (Node): `npx serve public`。
- Docker (Nginx): `docker build -t misesapo-mock .` → `docker run --rm -p 8080:8080 misesapo-mock`。
- 現時点でビルド/テストの固定ツールチェーンは未導入。導入時は `README.md` に記載。

## Coding Style & Naming Conventions
- HTML/CSS/JS を前提に、簡潔で読みやすいマークアップを維持。
- インデント: 2 スペース（JS/TS）/ 4 スペース（Python）。HTML/CSS はプロジェクト内で統一。
- 命名: ファイルは `kebab-case`、JS 変数は `camelCase`。一貫性を優先。
- 将来的に導入する場合のツール例: ESLint + Prettier（JS/TS）、Stylelint（CSS）。

## Testing Guidelines
- 静的モック段階では必須テストなし。動作確認はブラウザでの目視と簡易チェック。
- フレームワーク実装に移行後は、ユニット/統合テストを別プロジェクトで整備。

## Commit & Pull Request Guidelines
- Conventional Commits を推奨: `feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`。
- PR には概要・意図・スクリーンショット（UI 変更時）・関連 Issue（例: `Closes #123`）を含める。
- CI 導入時は lint/テスト/ビルドが通ることを前提にマージ。

## Security & Configuration Tips
- 秘密情報はコミットしない。必要なら `.env` と `.env.example` を使い分ける（現状は未使用）。
- 依存の導入は最小限。Docker/Nginx 設定の変更は PR でレビュー。
