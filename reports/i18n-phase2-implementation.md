# Sillage 外国人向け化 Phase 2 実装レポート

- 実装日: 2026-08-26
- 対象: 英語版 `/en/`
- 日本語商品データ: 150件（変更なし）
- 英語商品ページ: 25件（既存5件 + 追加20件）
- 英語ブランド一覧: 10ブランド
- 英語ブランド詳細: 6ブランド（英語商品2件以上のみ）
- 英語ガイド: 2記事

## 1. 選定方法

全150商品を `scripts/audit-i18n-phase2-candidates.mjs` で採点した。公式情報、商品属性、ノート、発売年、価格情報、楽天・もしも導線、確認日、リンク要修正フラグを評価し、英語公開に必要な情報が揃った20商品を追加対象とした。

詳細は次のファイルを参照する。

- `reports/i18n-phase2-candidates.csv`
- `reports/i18n-phase2-selection.md`

## 2. 実装したページ

### 商品

- `/en/fragrances/` に25商品を掲載
- 商品名、ブランド名、日本語商品名、濃度、容量、発売年、香調、ノート、シーン、季節、性別、公式参考価格、楽天掲載価格、購入先、確認日、情報源を既存データから表示
- 欠損項目は表示しない
- 編集判断は `Sillage editorial view` と明示し、ブランド公式情報と区別
- 公式価格と楽天掲載価格を別セクションで表示
- 楽天CTAには `nofollow sponsored noopener noreferrer` を維持

### ブランド

- `/en/brands/`: 英語商品が存在する10ブランドの一覧
- 詳細ページ: Dior、Chanel、Jo Malone London、Le Labo、Tom Ford、Prada
- 英語商品が1件だけのブランドは空の詳細ページを作らず、商品ページへ直接案内

### ガイド

- `/en/guides/perfume-shopping-kyoto/`
  - 検証済みの京都18店舗データを再利用
  - 店名、地域、英語住所、最寄り駅、営業時間、公式情報、Google Mapsを表示
  - 英語対応・免税は確認できないため、全件 `Not confirmed` と表示
- `/en/guides/best-japanese-perfume-brands/`
  - SHIRO、J-Scent、SHOLAYERED、AUX PARADISを掲載
  - ランキングではないことを明記
  - 既存DBにない商品ページは作成していない

## 3. SEO・計測

- 25商品に自己参照canonical、Product、BreadcrumbList、英語OGPを出力
- 6ブランド詳細にCollectionPage、BreadcrumbListを出力
- 2ガイドにArticle、BreadcrumbListを出力し、京都ガイドには18件のItemListを追加
- 日本語25商品と英語25商品の相互hreflangを出力
- 京都ガイドも日本語・英語の相互hreflangを出力
- 対応する日本語ページがない英語ページには架空の日本語hreflangを出力しない
- sitemapへ英語25商品、ブランド、2ガイドを追加
- GA4イベントへ `language` を追加し、英語ガイド・ブランドのページ種別を識別
- GA4 IDとSearch Console確認タグは既存値を維持

## 4. 検証結果

- JavaScript構文検査: 合格
- 正規ビルド10工程: 合格
- 既存バリデータ14本: 合格
- i18n検証: 25商品・10ブランド・2ガイドで合格
- 商品データ: 150件を維持
- もしもHTML: 4商品分の原文・画像・インプレッションタグ一致
- 購入クリック: 日本語150商品・428リンクの既存検証に合格
- `git diff --check`: 合格

## 5. レスポンシブ・操作確認

375px、768px、1024px、1440pxで次を確認した。

- 英語トップ
- 商品一覧
- ブランド一覧
- Diorブランド詳細
- 京都購入ガイド
- 日本ブランドガイド
- Dior Sauvage EDP商品詳細

全幅で横スクロールなし、h1は1つ、`null` / `undefined`の表示なし。商品一覧は25件からWoody 8件へ絞り込み、解除後25件へ戻ることを確認した。キーボードフォーカス、商品画像、公式CTA、楽天CTA、Product構造化データ、コンソールエラーなしも確認した。

## 6. Phase 3へ持ち越す項目

- 残り125商品の一括翻訳・公開
- 英語版の都市ガイド追加
- 英語版の商品診断
- 店舗ごとの英語対応・免税情報（公式確認できた場合のみ）

Phase 2の公開確認が完了するまで、これらは実装しない。
