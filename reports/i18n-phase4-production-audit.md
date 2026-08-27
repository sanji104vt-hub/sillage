# Sillage Phase 4 production audit

監査日: 2026-08-27 (JST)

## Deploy

- Feature commit: `b2f1695` (`feat(sillage): add Osaka and tax-free fragrance guides`)
- GitHub Actions: success
- Actions URL: https://github.com/sanji104vt-hub/sillage/actions/runs/33078262095
- Worker URL: https://sillage.sanji-104vt.workers.dev/
- Canonical production URL: https://sillage.asutelu.com/

## HTTP and routing

HTTP 200を確認:

- https://sillage.asutelu.com/
- https://sillage.asutelu.com/en/
- https://sillage.asutelu.com/en/fragrances/
- https://sillage.asutelu.com/en/brands/
- https://sillage.asutelu.com/en/guides/perfume-shopping-tokyo/
- https://sillage.asutelu.com/en/guides/perfume-shopping-kyoto/
- https://sillage.asutelu.com/en/guides/perfume-shopping-osaka/
- https://sillage.asutelu.com/en/guides/tax-free-perfume-shopping-japan/
- https://sillage.asutelu.com/en/guides/best-japanese-perfume-brands/

その他:

- 存在しない英語Guide: HTTP 404。
- 大阪Guideの末尾スラッシュなしURL: 正規URLへ301。
- 大阪Guideの`index.html`: 正規URLへ301。
- Worker入口: 正規ドメインへ301。
- キャッシュ回避クエリ付き大阪Guide: HTTP 200。

## Stores and ItemList

| 都市 | DB | 公開カード | 公開ItemList | タイトル表示 |
| --- | ---: | ---: | ---: | ---: |
| Tokyo | 27 | 27 | 27 | 27 |
| Kyoto | 18 | 18 | 18 | 18 |
| Osaka | 20 | 20 | 20 | 20 |
| 合計 | 65 | 65 | 65 | 65 |

English products: 25。Where to Try相当のブランド取扱導線: 24/25。

## Product and brand checks

本番商品5件:

- https://sillage.asutelu.com/en/fragrances/jo-malone-london/lime-basil-and-mandarin-cologne/
- https://sillage.asutelu.com/en/fragrances/le-labo/santal-33/
- https://sillage.asutelu.com/en/fragrances/chanel/bleu-de-chanel-eau-de-parfum/
- https://sillage.asutelu.com/en/fragrances/dior/sauvage-eau-de-toilette/
- https://sillage.asutelu.com/en/fragrances/aesop/tacit-eau-de-parfum/

本番ブランド2件:

- https://sillage.asutelu.com/en/brands/jo-malone-london/
- https://sillage.asutelu.com/en/brands/le-labo/

結果:

- Jo MaloneとLe LaboはTokyo / Kyoto / Osakaを表示。
- ChanelとAesopはTokyo / Osakaを表示。
- Diorは根拠のあるOsakaだけを表示。
- 空の都市セクション、在庫断定、`null` / `undefined`表示なし。
- 商品ページの価格、パンくず、短いTax-Freeリンクを確認。
- 商品からJo Malone London Marunouchiの店舗アンカーへ遷移し、該当カードの公式サイトとGoogle Mapsリンクが有効。

## Responsive and console

本番8ページを375pxと1440pxで再確認。

- 横スクロールなし。
- H1は各ページ1件。
- 長い店舗名、CTA、都市リンクのはみ出しなし。
- 大阪店舗カードとTax-Freeの期間カードに崩れなし。
- コンソールエラー: 0。

ローカルでは同8ページを375 / 768 / 1024 / 1440px、商品5件とブランド2件を375 / 1440pxで確認済み。

## SEO and analytics

- 大阪Guide: 自己canonical、Article、BreadcrumbList、ItemList（20件）。
- Tax-Free Guide: 自己canonical、Article、BreadcrumbList。
- sitemapに大阪GuideとTax-Free Guideを収録。
- 日本語トップ、英語トップ、大阪Guide、Tax-Free GuideにGA4 `G-60BQRQWB5M` を保持。
- 各対象にGSC verificationタグを保持。
- `store_map_click`、`store_official_click`、`city_guide_view`を保持。
- 架空review、`aggregateRating`、架空在庫なし。

## Tax-Free facts

- `Until October 31, 2026` と `From November 1, 2026` を分離。
- 2026年11月1日以降の税込購入、出国時税関確認、確認後返金を記載。
- 購入日から90日以内を国税庁・観光庁の公式情報と再照合。
- 免税、航空輸送、国際配送を別規則として説明。
- Last verified: 2026-08-27。
- 公式情報源4件: JNTO、Japan Tourism Agency、National Tax Agency、Japan Customs。

## External links

最終ビルド後に113 URLを再監査。

| 判定 | 件数 |
| --- | ---: |
| normal | 98 |
| redirect | 4 |
| blocked | 6 |
| timeout | 5 |
| 404 | 0 |
| 410 | 0 |

403・timeoutはリンク切れと断定していない。HEADの404/410はGETで再確認する監査方式を維持。

## Severity

- critical: 0
- high: 0
- medium: 0
- low: 11（自動確認がblocked 6 / timeout 5。404/410ではなく、削除対象なし）

## Rollback

問題発生時は履歴を書き換えず、`b2f1695`を`git revert`した新しいコミットをmainへ通常pushし、同じGitHub Actions経由でCloudflareへ反映する。

## Phase 5

Phase 5は未着手。次候補はSearch Console実データ分析、English Fragrance Finder、英語商品25→40、都市エリア別SEO、Japan-exclusive guide、中国語繁体字、韓国語、訪日香水ショッピング旅程。開始判断は別途行う。
