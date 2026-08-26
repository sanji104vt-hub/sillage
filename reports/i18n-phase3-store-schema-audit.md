# Sillage 外国人向け化 Phase 3 店舗データ事前監査

- 監査日: 2026-08-26
- 監査対象: 京都ガイドで公開中の18店舗
- 現行データ: `data/kyoto-shops.json` と `data/i18n/kyoto-shops.en.json`

## 結論

京都18店舗は、店舗ID、日英店名、日英住所、エリア、座標、最寄り駅、営業時間、公式URL、Google Maps URLを組み合わせれば全件を共通店舗DBへ移行できる。一方、都市、店舗種別、取扱ブランド、情報源、英語対応、免税、確認日が単一レコードにまとまっておらず、東京データを同じ方式で追加すると重複管理になる。

Phase 3では `data/stores.json` を唯一の店舗DBとし、京都と東京を `city` で分類する。京都の公開件数、店舗順、既存URL、座標、Google Maps URLは維持する。

## 現行フィールドの充足状況

| フィールド | 京都18件 | 現状 | 移行方針 |
|---|---:|---|---|
| 店舗ID | 18/18 | `slug` | `id`へ名称変更し値を維持 |
| 店名（日本語） | 18/18 | 本体JSON | `nameJa` |
| 店名（英語） | 18/18 | 英語オーバーレイ | `nameEn` |
| 住所（日本語） | 18/18 | 本体JSON | `addressJa` |
| 住所（英語） | 18/18 | 英語オーバーレイ | `addressEn` |
| 都市 | 0/18 | ファイル名から暗黙判定 | `city: "kyoto"`を明示 |
| エリア | 18/18 | 英語オーバーレイ | `area` |
| 座標 | 18/18 | 緯度・経度が別項目 | `coordinates`へ統合 |
| 最寄り駅 | 18/18 | 英語オーバーレイ | `nearestStation` |
| 営業時間 | 18/18 | 本体JSON | `openingHours` |
| 定休日 | 1/18 | 未確認はnull | `closedDays`、未確認はnull |
| 公式URL | 18/18 | 英語オーバーレイ | `officialUrl` |
| Google Maps URL | 18/18 | 本体JSON | 値を変更せず維持 |
| 英語対応 | 0/18 | 画面側で一律Not confirmed | `englishSupport: null` |
| 免税 | 0/18 | 画面側で一律Not confirmed | `taxFree: null` |
| 店舗種別 | 18/18 | `category` | 共通語彙の`storeType`へ変換 |
| 取扱ブランド | 0/18 | 構造化なし | 公式確認できる直営・専門店のみ追加 |
| 確認日 | 18/18 | 英語ファイル全体に1日付 | 各店舗の`verifiedAt`へ移行 |
| 情報源 | 0/18 | 公式URLのみ | `sources`配列へ公式ページを記録 |

## 重複管理の原因

1. 日本語記事は本体JSONだけを読み、英語ガイドは本体JSONと英語オーバーレイを結合している。
2. 同じ店舗の確認日と情報源を店舗単位で検証できない。
3. 都市フィールドがないため、東京・大阪を追加するたびに都市専用ファイルと専用処理が増える。
4. 商品・ブランドから店舗へつなぐための取扱ブランドIDがない。

## 共通DBの必須フィールド

`id`、`nameJa`、`nameEn`、`city`、`area`、`addressJa`、`addressEn`、`coordinates`、`nearestStation`、`openingHours`、`closedDays`、`officialUrl`、`googleMapsUrl`、`englishSupport`、`taxFree`、`storeType`、`brands`、`availabilityLevel`、`verifiedAt`、`sources`を使用する。

`englishSupport`と`taxFree`は、公式情報がない場合に推測せずnullを保持し、画面では「Not confirmed」と表示する。取扱ブランドだけを確認できた店舗は`availabilityLevel: "brand-confirmed"`とし、個別商品の在庫があるとは表現しない。
