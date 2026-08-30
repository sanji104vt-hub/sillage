# Sillage Phase 5 English SEO opportunity audit

監査日: 2026-08-30 (JST)  
監査対象コミット: `71ec40d`

## 結論

Search ConsoleとGA4は、利用可能なブラウザセッションにGoogleログインがなく、実データを取得できませんでした。したがって、クリック・表示回数・CTR・掲載順位・GA4行動を推測せず、全英語ページを`No Data`に分類します。

Phase 5は分析基盤と技術監査までの **Phase 5A** とし、タイトルや本文のSEO変更、英語ページ追加、イベント追加は行いません。

## データ取得状況

| データ | 期間 | 結果 |
| --- | --- | --- |
| Search Console | 直近7日 | 取得不可（未認証） |
| Search Console | 直近28日 | 取得不可（未認証） |
| GA4 | 直近7日 | 取得不可（未認証） |
| GA4 | 直近28日 | 取得不可（未認証） |

## 英語ページ構成

| Page Type | Pages |
| --- | ---: |
| Brand detail | 6 |
| Brand index | 1 |
| English home | 1 |
| Fragrance detail | 25 |
| Fragrance index | 1 |
| Guide | 5 |
| **Total** | **39** |

共有データは日本語150商品、英語オーバーレイ25商品、英語10ブランド、英語5ガイドです。店舗DBはTokyo 27、Kyoto 18、Osaka 20の合計65件です。

## 技術SEO監査

- 英語HTML: 39ページ
- canonical不一致・noindex・H1異常・sitemap漏れ・en hreflang欠損・title/description重複・内部リンク0件を自動検出
- 技術的な要確認ページ: 0ページ
- 上記の重大な技術不備: 0件

### 本番HTTP照合

- HTTP 200・最終URL一致・canonical一致・title一致: 39/39
- 存在しない英語URL: HTTP 404（期待値404）
- 本番照合エラー: 0件

### 内部リンクが少ないページ（重複リンクは1参照元につき1件として集計）

| URL | Page Type | Inbound pages |
| --- | --- | ---: |
| https://sillage.asutelu.com/en/guides/best-japanese-perfume-brands/ | Guide | 3 |
| https://sillage.asutelu.com/en/brands/le-labo/ | Brand detail | 4 |
| https://sillage.asutelu.com/en/brands/prada/ | Brand detail | 4 |
| https://sillage.asutelu.com/en/brands/tom-ford/ | Brand detail | 4 |
| https://sillage.asutelu.com/en/fragrances/aesop/tacit-eau-de-parfum/ | Fragrance detail | 4 |
| https://sillage.asutelu.com/en/fragrances/chanel/antaeus-eau-de-toilette/ | Fragrance detail | 4 |
| https://sillage.asutelu.com/en/fragrances/chanel/bleu-de-chanel-eau-de-parfum/ | Fragrance detail | 4 |
| https://sillage.asutelu.com/en/fragrances/chanel/pour-monsieur-eau-de-toilette/ | Fragrance detail | 4 |
| https://sillage.asutelu.com/en/fragrances/creed/aventus/ | Fragrance detail | 4 |
| https://sillage.asutelu.com/en/fragrances/dior/fahrenheit-eau-de-toilette/ | Fragrance detail | 4 |

## 計測実装監査

既存GA4 ID `G-60BQRQWB5M`、GSC所有権確認タグ、通常page_viewに加え、次のイベント実装を確認しました。

- `item_view`
- `column_view`
- `city_guide_view`
- `store_map_click`
- `store_official_click`
- `official_click`
- `rakuten_click`

Phase 5の判断に必要なイベントは既に存在するため、新規イベントは追加していません。

## ページ分類

- Winner: 判定不可
- Opportunity: 判定不可
- Emerging: 判定不可
- No Data: 39ページ

GSCの掲載順位8〜30かつ表示回数のあるページを抽出できないため、改善対象を推測で選びません。

## 次の取得条件

次回はSearch ConsoleとGA4へアクセスできる状態で、同じ終了日を使った直近7日・28日を取得します。最低条件は次の両方です。

1. 英語公開ページについて28日分のページ・クエリデータが取得できる
2. 英語ページ合計で100表示以上、または自然検索20クリック以上が確認できる

条件を満たしたら、掲載順位8〜30で表示回数のあるOpportunityを最大5〜10ページに限定し、title・description・導入・内部リンクを改善します。

## Phase 6判断

**Phase 6を開始しない** を推奨します。根拠は、GSCとGA4の実数がなく、A〜Gのどの施策が検索流入や回遊に効くか比較できないためです。

## 出力

- `reports/phase5-gsc-pages.csv`
- `reports/phase5-gsc-queries.csv`
- `reports/phase5-ga4-pages.csv`
- `reports/phase5-seo-opportunities.md`
