# Sillage 外国人向け化 Phase 3 公開後監査

## 1. デプロイ情報

- デプロイ日時: 2026-08-26 16:54 JST
- 機能コミット: `7280d24 feat(sillage): add Tokyo fragrance store guide`
- Actions更新コミット: `b2cd996 chore(sillage): update deployment actions runtime`
- GitHub Actions: https://github.com/sanji104vt-hub/sillage/actions/runs/32945048573
- Actions結果: success（24秒）
- Cloudflare Worker Version ID: `f39e94a4-1be8-44db-889c-02a1bceffad9`
- Worker URL: https://sillage.sanji-104vt.workers.dev/
- 正規公開URL: https://sillage.asutelu.com/

Worker入口は正規公開URLへHTTP 301で転送された。

## 2. 公開URL確認

次のURLはHTTP 200、h1 1つ、自己参照canonical、GA4タグ保持を確認した。

- https://sillage.asutelu.com/en/
- https://sillage.asutelu.com/en/guides/perfume-shopping-tokyo/
- https://sillage.asutelu.com/en/guides/perfume-shopping-kyoto/
- https://sillage.asutelu.com/en/guides/best-japanese-perfume-brands/
- https://sillage.asutelu.com/en/brands/le-labo/
- https://sillage.asutelu.com/en/fragrances/le-labo/santal-33/
- https://sillage.asutelu.com/en/fragrances/chanel/bleu-de-chanel-eau-de-parfum/
- https://sillage.asutelu.com/en/fragrances/maison-margiela/replica-jazz-club/
- https://sillage.asutelu.com/en/fragrances/jo-malone-london/wood-sage-and-sea-salt-cologne/
- https://sillage.asutelu.com/en/fragrances/aesop/tacit-eau-de-parfum/

存在しない `/en/guides/phase3-not-found/` はHTTP 404を返した。

## 3. 店舗データ・ガイド

- 共通店舗DB: 45店舗
- 東京: 27店舗
- 京都: 18店舗
- 東京ガイドの店舗カード: 27件
- 東京ガイドのItemList: 27件
- 京都ガイドの店舗カード: 18件
- 京都ガイドのItemList: 18件
- 東京ガイドに架空の日本語hreflangなし
- null、undefined、空の店舗カード表示なし
- 個別商品の在庫を断定する文言なし

## 4. 商品・ブランド導線

- Santal 33、Bleu de Chanel EDP、Replica Jazz Club、Wood Sage & Sea Salt、Tacitで店舗案内を確認した。
- 対象商品に「個別商品の在庫は未確認」の注意書きが表示された。
- Le Laboブランド詳細に「Where to Find Le Labo in Japan」を確認した。
- 公式店舗情報とGoogle Mapsへのリンクを保持した。
- 商品詳細の購入リンクと既存購入計測には変更なし。

## 5. SEO・構造化データ

- 東京・京都ガイドのcanonicalは各ページ自身を参照する。
- 東京・京都ガイドにItemListを確認した。
- 東京ガイドにArticleとBreadcrumbListを確認した。
- sitemapに東京ガイドを確認した。
- 商品ページの既存Product・BreadcrumbListを維持した。
- GA4 `G-60BQRQWB5M` とSearch Console確認タグを維持した。

## 6. レスポンシブ・操作

東京ガイドとSantal 33を375 / 768 / 1024 / 1440pxで実ブラウザ確認した。

- 横スクロールなし
- h1は各ページ1つ
- 長い店名・商品名の画面外はみ出しなし
- 店舗カードと外部リンクが表示される
- `focus-visible`スタイルあり
- `prefers-reduced-motion`対応あり
- コンソールエラー・警告なし
- `null` / `undefined`の画面露出なし

## 7. 外部リンク監査

公開前の公式・Google Maps・情報源73 URLの監査結果:

- ok: 64
- redirect: 4
- blocked: 2
- timeout: 3
- not_found: 0
- rate_limited: 0

403、timeoutはリンク切れと断定せず、手動確認対象として保持した。404/410は0件。

## 8. 発見した問題と修正

### 公開前

- 旧John's Blend公式URLが通常GETで404だったため、同じ公式サイトの現行YOUR MUSKページへ修正した。
- 一部CMSがHEADで404、GETで200を返したため、リンク監査をGET再確認後に判定する方式へ修正した。

### 公開後

重大な表示、URL、構造化データ、計測、レスポンシブ問題は検出されなかった。追加修正は不要。

## 9. Actionsランタイム

- `actions/checkout@v6`
- `cloudflare/wrangler-action@v4`
- Wranglerは既存の`4.103.0`固定を維持

更新後の本番デプロイは成功し、Node 20非推奨警告は検出されなかった。

## 10. Phase 3判定

Phase 3は公開可能かつ本番反映済み。東京ガイドの重大問題はなく、大阪調査へ進むための技術条件は満たした。ただし、Phase 4や大阪追加はこの作業では開始していない。

## 11. ロールバック

問題が発生した場合は、強制pushや履歴書き換えを使わず、`b2cd996`と`7280d24`を新しいrevertコミットで順に取り消し、mainへ通常pushして既存Actionsから再デプロイする。
