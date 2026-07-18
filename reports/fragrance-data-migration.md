# Sillage 商品データ基盤正規化レポート

## 1. 移行前の問題

- 92商品のデータが `public/index.html` のインライン配列にあり、商品単位の差分確認が難しい状態でした。
- 商品slugが `build-items-slugmap.json` の配列順に依存し、並び替えでURLと商品がずれる危険がありました。
- 楽天リンクが旧 `rakuten` と `purchaseLinks.rakuten` に重複し、生成処理ごとに参照先が異なっていました。
- 出典の `sourceType` と `market` に旧表記・未設定が混在していました。

## 2. 新しい構造

- 正規データ: `data/fragrances.json`
- スキーマ: `schemaVersion: 2`
- 商品総数: 92件（順序変更なし）
- 商品識別子: 各商品内の固定 `slug`。別IDは追加せず、既存URLのslugを唯一の識別子として使用します。
- ブラウザ用同期データ: `build-fragrance-assets.mjs` が `public/data/fragrances.js` を生成します。
- 商品詳細: `build-items.mjs` が正規JSONのslugをそのまま使い、92ページを生成します。

## 3. slug移行

- 移行前のindex・ID・slug・ブランド・商品名・URLを `reports/fragrance-id-slug-baseline.csv` に92件保存しました。
- 全92件で配列順、slug、商品詳細URLが一致しました。
- 旧slugmapへの実行時依存をすべて除去しました。

## 4. 楽天リンク正規化

- 全商品に `purchaseLinks.official / amazon / rakuten` を持たせ、未登録は `null` としました。
- 旧楽天URLは文字列・クエリパラメータを変更せず `purchaseLinks.rakuten.url` へ移行しました。
- `verifiedAt` と `type`（`product` または `search`）を正規フィールドに統一しました。
- トップカード・商品詳細・監査・楽天取得処理は正規フィールドだけを参照します。
- 旧 `rakuten` フィールドはデータから削除しました。

## 5. 出典正規化

- 補完済み30商品の32出典を正規化しました。
- `sourceType`: `official`, `official-press`, `authorized-distributor`, `department-store`, `authorized-retailer`, `major-retailer`
- `market`: `JP`, `US`, `UK`, `EU`, `GLOBAL`, `OTHER`
- URL、確認日、媒体名、ページタイトル、`supports` は維持しました。
- 国・市場は既存値とURL上の明示的な地域指定だけから変換し、国内公式と推測して補完していません。

## 6. 移行した処理

- トップ商品一覧・フィルター・商品カード
- 商品詳細92ページ、関連商品、ブランド・香調・シーン・季節リンク
- Product / BreadcrumbList構造化データ
- sitemap / robots生成
- データ監査、リンク監査、パイロット・第2段階レポート
- 楽天API取得先（20260701）と保存先

ブランドページは既存の静的HTMLを維持し、商品詳細からのリンク構造を変更していません。香調・シーン・季節は従来どおりトップの商品一覧へクエリ付きで遷移します。

## 7. 自動比較結果

- 比較対象: 92商品 × 13項目 = 1,196チェック
- 比較項目: 配列順、slug、ブランド、商品名、詳細URL、商品内容、購入URL、出典URL、title、description、canonical、h1、関連商品
- 意図しない差分: 0件
- 詳細: `reports/fragrance-migration-comparison.csv`

## 8. 検証結果

- `node build-fragrance-assets.mjs`: 92件生成
- `node build-items.mjs`: 92商品ページ生成
- `node enhance-static-seo.mjs`: 互換性確認のため実行。今回と無関係な共有UIの生成差分は最終成果物に含めず、商品ページは正規化後の `build-items.mjs` 出力へ戻しました。
- `node generate-seo.mjs`: canonical URL 154件でsitemap生成
- `node validate-fragrances.mjs`: OK
- `node validate-site-routes.mjs`: 92商品、47ブランド、14記事、フィルター、トップ、データアセット、sitemap、リダイレクト、存在しない商品404を確認
- `node compare-fragrance-migration.mjs`: 1,196チェック、意図しない差分0件
- `node audit-fragrance-data.mjs`: 92件監査完了
- `node audit-fragrance-links.mjs`: 139 URL監査。24件OK、81件リダイレクト後OK、34件は403等でblocked
- `npx.cmd --yes wrangler@4.103.0 deploy --dry-run`: 162静的ファイルを読み込み、Workerビルド成功。デプロイは未実行

Aesopの2 URLは `aesop.com` から公式国内ドメイン `aesop.co.jp` へ転送後に403となり、監査上は `domain_mismatch` を併記しています。移行前後の保存URLは一致しており、今回の正規化によるリンク変更ではありません。

## 9. サンプル確認

- 補完済み・国内公式あり: `jo-malone-1`, `dior-2`
- 補完済み・海外公式あり: `tom-ford-2`, `versace-4`
- 欠損ケース: `muji-1`
- 未補完の既存商品: `ck-1`

各サンプルでタイトル、canonical、h1、購入リンク、情報源、関連商品を確認し、移行前比較と一致しました。

## 10. 残る注意点

- 34 URLはアクセス制限により自動監査で到達可否を断定できません。URL形式・保存値・移行前後一致は確認済みです。
- 商品の新規補完を行う際は `data/fragrances.json` のみを編集し、生成・検証・比較を順に実行します。
- 本タスクでは残り62商品の情報補完、プロフィール数値作成、UI変更、push、デプロイを行っていません。
