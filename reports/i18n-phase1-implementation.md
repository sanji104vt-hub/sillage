# Sillage 外国人向け化 Phase 0〜1 実装報告

## 1. Phase 0 監査結果

- 基準コミット: `99eedc1`
- 商品: 150件
- ブランド: 41件
- 日本語の静的HTML: 234ページ
- 京都店舗データ: 18件
- 商品slug重複・欠損: 0件
- 致命的（critical）: 0件
- 高（high）: 60件
- 中（medium）: 102件

商品ごとの欠損は `reports/i18n-phase0/products.csv`、検出事項は `reports/i18n-phase0/issues.csv` に記録した。商品・ブランド・京都店舗の元データは変更していない。

## 2. 重要度別の主な問題

### 高

- 既存商品に `needsCorrectLink` または価格容量の未解決フラグが残る。英語版では該当楽天リンクを自動的に出さない。
- `data/site-copy.json` の `heroProductLine` は97本のままだが、現在の商品DBは150件。公開トップの件数表示は150件で正常だが、生成元文言として不整合が残る。
- 京都記事の見出し・本文は17店、店舗データとItemList JSON-LDは18件。英語都市ページは作成せず、再確認まで保留した。

### 中

- 公式リンクなし85件、構造化された情報源なし60件、容量なし32件、濃度なし8件。
- 京都店舗名に綴りの手動確認が必要な候補が1件ある。
- 京都店舗18件に個別の情報確認日がない。

### 外部リンク

- 307参照・225ユニークURLを低並列で確認。
- ok 19、redirect 6、blocked 46、timeout 153、manual_review 1、not_found 0。
- 403はリンク切れにせずblocked、タイムアウトは要目視として扱った。
- もしもの計測URLは踏まず、埋め込まれた楽天商品URLを監査した。

## 3. データ構造のBefore / After

### Before

- `data/fragrances.json` が日本語表示と購入情報の唯一のデータ。
- 日本語名と日本語slugしかなく、英語名・英語slug・翻訳辞書の共通構造がなかった。
- 公式参考価格、楽天実売価格、購入リンクが同一商品内に存在するが、外国人向け表示用の市場アダプターがなかった。

### After

- 日本語商品DBをそのまま唯一の正とした。
- `data/i18n/products.en.json` は既存slugをキーにした疎な英語オーバーレイ。150商品を複製していない。
- `data/i18n/brands.en.json` に英語名、日本語名、英語slug、別名を保持。
- `data/i18n/translations.json` に香調・季節・シーン・性別・価格帯・濃度の共通辞書を保持。
- `lib/i18n.mjs` が元商品と翻訳を実行時に統合し、日本向け価格を次の区分で返す。
  - 公式参考価格（JPY、容量、確認日、出典）
  - 楽天実売価格（JPY、容量、取得日）
  - 公式購入リンク
  - 安全確認済み楽天リンク
- `needsCorrectLink` がある楽天リンクは英語出力から除外する。
- もしもHTML・a_id・インプレッションタグ・既存購入URLは変更していない。

## 4. URL・ルーティング

- 英語トップ: `/en/`
- 英語一覧: `/en/fragrances/`
- 英語商品: `/en/fragrances/{brand-slug}/{product-slug}/`
- 末尾スラッシュなし、物理 `index.html` URLは正規URLへ301転送。
- 存在しない英語商品URLは404。
- 既存の日本語URLは変更していない。

## 5. 実装した英語ページ

### 英語トップ

- Japan Fragrance Guideのヒーロー
- Fragrances / Brands / Fragrance Finder / Guides / Cities の5導線
- Phase 1で利用できる商品一覧へのリンク
- 未実装導線は存在しないURLへリンクせずPhase 2表示にした
- 日本語版への言語切替

### 英語商品一覧

- 同じ150商品JSONを読み込み、商品DBを複製しない
- 香調、季節、シーン、性別、日本向け価格帯のフィルター
- データ読み込み中と失敗時の表示
- 完成済み5件は英語商品ページ、その他は既存日本語商品ページへリンク
- 英語名未整備が145件あるため `noindex,follow`

### 英語商品テンプレート

- 英語名、ブランド、日本語商品名、香調、濃度、容量、シーン、季節、Top/Middle/Last
- 公式参考価格と楽天実売価格を混ぜずに表示
- 公式・楽天購入リンクと広告表示
- 情報源、Product、BreadcrumbList、canonical、相互hreflang
- パイロット: Aesop Tacit、Dior Sauvage EDT、Maison Margiela REPLICA Jazz Club、Le Labo Santal 33、Jo Malone London Wood Sage & Sea Salt Cologne

## 6. SEOとインデックス制御

- `/en/` と英語商品5件はindexable。
- `/en/fragrances/` は翻訳未完成のため `noindex,follow`。
- sitemap生成処理はnoindexページを自動除外するよう変更。
- sitemapには英語トップと商品5件だけを追加。
- 日本語トップと対応する日本語商品5件に相互hreflangを追加。
- `x-default` は既存日本語URL。
- GA4 `G-60BQRQWB5M` とSearch Console認証タグを英語ページにも維持。

## 7. 日本語版への影響

- `data/fragrances.json`、`data/brands.json`、商品順、商品slug、購入URLは変更なし。
- 日本語トップへの変更は英語alternateと`EN`リンクだけ。
- 日本語商品は英語ページがある5件へのhreflang追加だけ。
- 既存共有ボタン、比較、診断、もしも広告、クリック計測を維持。
- 日本語トップで「全150件の香水」を確認。

## 8. テスト結果

- 全JavaScript構文検査: OK
- 既存の `validate-*.mjs` 13本: すべてOK
- 商品150ページ: OK
- コラム38本: OK
- もしも4商品原文HTML・画像・価格ボタン・インプレッションタグ: OK
- サイトルート・404: OK
- 英語専用検証: 5商品、150件共通一覧、canonical、hreflang、JSON-LD、noindex、sitemapすべてOK
- ブラウザ: コンソールエラーなし
- 375 / 768 / 1024 / 1440px: 横スクロールなし
- 一覧フィルター: 150件 → Woody 34件 → Woody + Summer 4件 → 解除後150件
- 英語商品画像: 読み込み成功
- 末尾スラッシュなし: 301、存在しない商品: 404
- `git diff --check`: OK

## 9. 残課題と推奨順

1. 京都記事の17店表示と18件データを、出典確認後に一致させる。
2. `data/site-copy.json` の97本表記を150件へ追従させる。
3. `needsCorrectLink` と価格容量未解決の商品を日本語側で先に解消する。
4. 英語名・英語slugを一度に全件作らず、公式ソース確認済みの商品単位で増やす。
5. 英語一覧をindexへ切り替える条件を「英語名・英語URL・購入先・主要項目が一定割合以上」に固定する。
6. 京都店舗に情報確認日と公式URLを追加してから英語都市ページを作る。

## 10. デプロイ状態

- 本番デプロイ: 未実施
- push: 未実施
- 理由: 指示書どおり、Phase 0〜1はローカル実装と監査までに止めた。
- 本番反映前に、英語5商品名・ノート英訳・京都記事不整合・サイトコピー97本表記について最終レビューが必要。
