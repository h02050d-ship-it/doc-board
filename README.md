# doc-board｜書類自動保存ステータスボード

林材木店の領収書・請求書・精算書・納品書の自動ダウンロード管理を視覚化するボード。

- 公開URL: https://h02050d-ship-it.github.io/doc-board/
- 画面は GitHub Pages（このリポジトリ `index.html`）で配信。
- データは GAS の JSON API（`gas/api.gs`）が Gmail の `drive保存済み_*` ラベルから自動集計。

## 構成
- `index.html` … ボード本体。`CONFIG.apiUrl` に GAS Web App の `/exec` URL を入れるとライブ表示。空ならスナップショット（手動データ）表示。
- `gas/api.gs` … `doGet` で JSON を返すデータAPI（画面は出さない）。Web Appとしてデプロイして使う。

## ライブ化の手順
1. `gas/api.gs` をスタンドアロンGASに配置（clasp push 等）。
2. 「デプロイ > ウェブアプリ」：実行＝自分、アクセス＝用途に応じて。`/exec` URL を取得。
3. `index.html` の `CONFIG.apiUrl` にその URL を設定して push。

## 注意
- 公開Pagesのため取引先名が外部から見える。社内限定にするなら、リポジトリ非公開（要GitHub Pro）か、API側 `API_TOKEN` でトークン制にする。

🤖 Generated with [Claude Code](https://claude.com/claude-code)
