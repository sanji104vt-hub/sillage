# Sillage Phase 4 implementation audit

確認日: 2026-08-27 (JST)

## 実装範囲

- 英語商品は25件のまま維持。
- 店舗共通DBへ大阪20店を公式情報源付きで追加。東京27店、京都18店は維持し、合計65店。
- `/en/guides/perfume-shopping-osaka/` を追加。
- `/en/guides/tax-free-perfume-shopping-japan/` を追加。
- 英語トップ、3都市ガイド、英語商品・ブランドページを店舗DBから自動連携。
- Where to Try相当のブランド取扱導線は24/25英語商品。未対応のCreedには根拠のない店舗を追加していない。
- `taxFree` と `englishSupport` は `true = 公式確認済み`、`false = 非対応確認済み`、`null = 未確認` として表示を分離。

## 店舗件数

| 都市 | DB | 表示カード | ItemList |
| --- | ---: | ---: | ---: |
| Tokyo | 27 | 27 | 27 |
| Kyoto | 18 | 18 | 18 |
| Osaka | 20 | 20 | 20 |
| 合計 | 65 | 65 | 65 |

重複検出は、同一百貨店内の別ブランドカウンターを誤検出しないよう、正規化した店名と住所の組み合わせで行った。

## Tax-Free Guide

- `Until October 31, 2026` と `From November 1, 2026` を分離。
- 2026年11月1日以降の税込購入、出国時の税関確認、確認後の返金、購入日から90日以内を明記。
- 免税適用、航空輸送、国際配送を別の規則として説明。
- 購入者自身による海外別送を免税の代替手段として案内していない。
- Last verified: 2026-08-27。
- 公式情報源: Japan National Tourism Organization、Japan Tourism Agency、National Tax Agency、Japan Customs。

## SEO・計測

- 大阪ガイド: 自己canonical、Article、BreadcrumbList、ItemList（20件）。
- 免税ガイド: 自己canonical、Article、BreadcrumbList。
- sitemapへ両URLを生成処理から追加。
- 日本語トップ、英語トップ、大阪ガイド、免税ガイドでGA4 `G-60BQRQWB5M` とGSC認証タグを確認。
- 既存イベント `store_map_click`、`store_official_click`、`city_guide_view` を維持。Tax-Free専用イベントは増やさず通常page_viewを使用。

## ローカル画面確認

Wrangler 4.127.0のローカルWorkerで確認。デプロイ固定版4.103.0はWindowsのローカル実行環境が設定済みcompatibility dateに未対応で、その後workerdが異常終了したため、リポジトリ設定を変えずローカル確認だけ新しいWranglerを使用した。

- 375 / 768 / 1024 / 1440 pxで英語トップ、商品一覧、ブランド一覧、Tokyo/Kyoto/Osaka、Tax-Free、Japanese Brandsの8ページを確認。
- 全対象でH1は1件、横スクロールなし、長い店舗名・CTA・都市リンクのはみ出しなし。
- 大阪ガイドのモバイル表示、Tax-Freeの2期間カードを目視確認。
- 商品5件（Jo Malone、Le Labo、Chanel、Dior、Aesop）とブランド2件（Jo Malone、Le Labo）を375 / 1440 pxで確認。
- 商品から該当都市の店舗アンカーへ遷移し、店舗カード内の公式リンクとGoogle Mapsリンクが有効であることを確認。
- ブラウザコンソールエラー: 0。

## 外部リンク監査

出力: `reports/i18n-phase4-store-link-audit.csv`

| 判定 | 件数 |
| --- | ---: |
| normal | 98 |
| redirect | 4 |
| blocked (403) | 6 |
| timeout | 5 |
| 404 | 0 |
| 410 | 0 |
| 合計 | 113 |

HEADで404/410となるサイトはGETで再確認する実装を維持。403・429・timeoutはリンク切れと断定していない。

## 検証結果

以下の16検証がすべてPASS。

- `validate-columns.mjs`
- `validate-editorial-policy.mjs`
- `validate-featured-brands.mjs`
- `validate-fragrance-trials.mjs`
- `validate-fragrances.mjs`
- `validate-i18n.mjs`
- `validate-kyoto-guide.mjs`
- `validate-moshimo-offers.mjs`
- `validate-problem-columns.mjs`
- `validate-product-comparisons.mjs`
- `validate-purchase-click-tracking.mjs`
- `validate-quiz-recommendations.mjs`
- `validate-site-copy.mjs`
- `validate-site-routes.mjs`
- `validate-stores.mjs`
- `validate-tax-free-guide.mjs`

`git diff --check`: PASS。

## 保護対象

- `data/fragrances.json`、日本語商品slug、楽天リンク、もしも正式HTMLは変更なし。
- `public/index.html` は差分なし。
- Phase 5は未着手。
