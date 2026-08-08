# scripts/

Sillage のメンテナンス用スクリプト。ビルドやデプロイの一部ではなく、必要なときに手動で実行する。

---

## fetch-prices.mjs — 参考価格を楽天の実売価格に更新する

購入ボタンのリンク先そのものの現在価格を楽天APIから取得し、`data/fragrances.json` に書き戻す。

### 実行前に必ず確認すること

**1. Sillage のリポジトリルートで実行する**

```bash
cd C:/Users/niji1/Downloads/sillage
```

別サイト（Moilum など）のディレクトリで実行すると `data/fragrances.json` が無いため落ちる。
スクリプト側でも検知して止めるようにしてある。

**2. 環境変数を Sillage のものに設定する**

```bash
export RAKUTEN_APP_ID='（SillageのアプリケーションID）'
export RAKUTEN_ACCESS_KEY='（アクセスキー pk_...）'
export RAKUTEN_ORIGIN='https://sillage.asutelu.com/'
```

**3. 他サイトの環境変数が残っていたら上書きする**

同じターミナルで Moilum や Somni の作業をしていると `RAKUTEN_ORIGIN` がそちらの値のまま残る。
その状態だと楽天APIの認証が通らず、全件が「取得失敗」になる（原因が分かりにくい）。
毎回明示的に上書きすること。Sillage 以外の値ならスクリプトが実行前に止める。

### 実行

```bash
node scripts/fetch-prices.mjs
```

全97件で約8〜10分。楽天APIの制限に合わせて1.2秒間隔・逐次実行しており、並列化はしない。

動作を試すとき:

```bash
node scripts/fetch-prices.mjs --dry-run --slug dior-1
```

| オプション | 意味 |
| --- | --- |
| `--report` | 診断レポートだけ出す（書き込みなし。下記参照） |
| `--dry-run` | ファイルに書き込まない |
| `--limit N` | 先頭N件だけ |
| `--slug xxx` | 特定の商品だけ |

### 診断レポート（--report）

```bash
node scripts/fetch-prices.mjs --report
```

`priceSizeUnknown` / `priceSizeMismatch` が立っている商品について、楽天が実際に何を返しているかを出す。
`data/fragrances.json` は書き換えない。

商品ごとに、掲載 sizes・楽天の `itemName` 全文・抽出した容量・`itemPrice`・素の楽天商品URLを出力する。
`itemName` を全文で出すのは、容量の表記ゆれ（`100mL` / `3.4oz` / `100ml/3.3oz` など）や
セット販売・付属品つきの商品を目で判断するため。

これを見て「この容量なら妥当」と判断できた商品は、`data/fragrances.json` の `sizes` に
その容量を追加すれば、次回の通常実行で実売価格に切り替わる。

### 何をしているか

1. もしも経由リンクの `url=` から楽天の商品URL `/{shop}/{slug}/` を取り出す
2. 楽天APIを検索し、**`itemUrl` がその `/{shop}/{slug}/` を含むものだけ**を採用する
   （楽天のURLスラッグとAPIの `itemCode` は別物のことがあるため、itemCode直引きは当てにならない。
   このURL一致確認が商品取り違えの防波堤）
3. 商品名から容量を読み取り、**`sizes` のいずれかと一致する場合だけ**実売価格として採用する
4. 全件終わってから一時ファイル→リネームで一括書き込みする（途中で止まってもJSONが壊れない）

### 結果の見方（priceSource）

| 値 | 意味 | 表示 |
| --- | --- | --- |
| `rakuten` | 実売価格を取得・容量も一致 | `¥18,380（100ml・2026年8月時点）` と取得時点を併記。JSON-LD の `offers` も出力 |
| `manual` | 商品は特定できたが容量が掲載容量と違う | 手入力価格のまま。容量・取得日は表示しない。`priceSizeMismatch: true` が立つ |
| `manual-stale` | 商品を特定できなかった | 手入力価格のまま。容量・取得日は表示しない |

`priceSizeMismatch: true` の商品は、**楽天リンクを単品ページに差し替えるべき商品のリスト**として使う。
複数容量をまとめた販売ページにリンクしていると、楽天APIは最安構成（例: 2ml×10セット）の
価格を返すため、そのまま採用すると価格帯フィルタが実態とずれる。

### 実行後にやること

```bash
node build-fragrance-assets.mjs && node build-home-data.mjs && node build-site-copy.mjs \
  && node build-items.mjs && node build-columns.mjs && node build-internal-links.mjs \
  && node build-kyoto-article.mjs && node generate-seo.mjs && node enhance-static-seo.mjs
node validate-fragrances.mjs
```

`data/fragrances.json` を書き換えただけではサイトに反映されない。ビルドまで実行すること。

### やってはいけないこと

- **Cloudflare Workers のリクエスト処理中に楽天APIを呼ばない。** subrequest 上限に当たる（潮見で実績あり）。
  サイトは書き戻された静的JSONを読むだけにする
- 並列実行しない。楽天APIは概ね1秒1リクエスト
- `purchaseLinks` を書き換えない。価格取得のために `url=` を読むのは可
