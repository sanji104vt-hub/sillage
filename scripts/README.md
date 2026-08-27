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

全商品で約8〜15分。楽天APIの制限に合わせて1.2秒間隔・逐次実行しており、並列化はしない。

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
| `manual` | 商品は特定できたが容量を採用できない | 手入力価格のまま。容量・取得日は表示しない。`priceSizeMismatch` か `priceSizeUnknown` が立つ |
| `manual-stale` | 一度も商品を特定できていない | 手入力価格のまま。容量・取得日は表示しない |

### 取得できなかったときの挙動

ショップ内検索は当たり外れがあり、同じリンクでも実行のたびに数件が成功・失敗を行き来する。
毎回手入力価格へ戻すと、読者から見て価格表示が実行ごとに揺れることになるため、
**過去に取得できていた商品は前回の価格・容量・取得日をそのまま保持する**（`priceSource` は `rakuten` のまま）。

`priceFetchedAt` は更新しないので、取れなくなった商品は取得日が古いまま残る。
取得日を併記する表示なので、これは誤表示ではなく「いつ時点の価格か」が正しく伝わる状態。

連続失敗回数は `priceStaleRuns` に記録し、**4回以上**になった商品はレポートに出す。
継続的に取得できない＝リンク先の商品ページが消えた可能性が高いので、リンク差し替えの検知に使う。

一度も取得できていない商品は、従来どおり手入力価格（`manual-stale`）のまま。

`priceSizeMismatch: true` の商品は、**楽天リンクを単品ページに差し替えるべき商品のリスト**として使う。
複数容量をまとめた販売ページにリンクしていると、楽天APIは最安構成（例: 2ml×10セット）の
価格を返すため、そのまま採用すると価格帯フィルタが実態とずれる。

### 実行後にやること

```bash
node build-fragrance-assets.mjs && node build-home-data.mjs && node build-site-copy.mjs \
  && node build-items.mjs && node build-columns.mjs && node build-internal-links.mjs \
  && node build-kyoto-article.mjs && node build-i18n.mjs && node generate-seo.mjs && node enhance-static-seo.mjs
node validate-fragrances.mjs
node validate-i18n.mjs
node validate-kyoto-guide.mjs
node validate-stores.mjs
node validate-tax-free-guide.mjs
```

店舗ガイドの元データは `data/stores.json` の1ファイルに集約する。京都・東京・大阪を別JSONへ複製せず、`city` と `brands` で絞り込む。免税制度の根拠と更新日は `data/tax-free-system.json` で版管理する。英語対応、免税、個別商品の在庫は公式確認できない限り推測しない。

`data/fragrances.json` を書き換えただけではサイトに反映されない。ビルドまで実行すること。

### エンドポイントのバージョン

```
https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701
```

`scripts/lib/rakuten.mjs` の1箇所で定義し、価格取得と週次監査の両方が使う。

**楽天はエンドポイントのバージョンを予告して廃止する。**
2026-08-17 に `20220601` が完全廃止され、全件が
`HTTP 400 API Configuration not found` になった。認証エラーではないので
原因が分かりにくい。同じ症状が出たら、まず現行バージョンを確認すること。

- 公式ドキュメント: https://webservice.rakuten.co.jp/documentation/ichiba-item-search
  （ページタイトルにバージョンが載っている）
- 廃止の告知: 楽天ウェブサービスブログ https://rakuten-webservice.tumblr.com/

### 認証情報の渡し方

`.env.local`（git管理外）に置き、読み込んでから実行する。

```bash
set -a; . ./.env.local; set +a
```

アクセスキーは秘密情報なので、コマンドライン引数やコミットに直接書かない。

### やってはいけないこと

- **Cloudflare Workers のリクエスト処理中に楽天APIを呼ばない。** subrequest 上限に当たる（潮見で実績あり）。
  サイトは書き戻された静的JSONを読むだけにする
- 並列実行しない。楽天APIは概ね1秒1リクエスト
- `purchaseLinks` を書き換えない。価格取得のために `url=` を読むのは可

---

## audit/ — 週次の健全性監査

150商品のリンク・画像・内部整合性を毎週チェックし、深刻度「高」があったときだけ
GitHub Issue を起票する。**検知と報告だけを行い、`data/` は一切書き換えない。**

```bash
export RAKUTEN_APP_ID='...' RAKUTEN_ACCESS_KEY='...'
export RAKUTEN_ORIGIN='https://sillage.asutelu.com/'
node scripts/audit/run.mjs            # 通常実行（Issueも起票）
node scripts/audit/run.mjs --no-issue # Issueを立てずに確認だけ
node scripts/audit/run.mjs --limit 8  # 先頭8件で試す
```

所要時間は約9分（楽天API 149件を1.2秒間隔で逐次照合するため）。

### なぜ死活監視では足りないか

過去に起きた事故はいずれも「楽天APIは正常に応答し、リンクも生きていた」状態だった。

- ジェントルマン ブシの画像がシャツだった
- フォーハーのリンクがピュア ムスク（別ライン）だった
- テスター品・箱なし品を掴んでいた

だから商品名の一致まで見る。`data/brand-aliases.json` がその照合表で、
ブランド名の英字↔カナ、および掲載名と楽天名が別表記の組み合わせを持つ。

### 検査項目

| 分類 | 内容 |
| --- | --- |
| A | 楽天リンク：商品の存在 / 商品名の一致 / 除外語 / 価格急変 / 容量変化 |
| B | 死活：商品画像・意匠画像・商品ページ・ブランドページ・コラム・OGP・favicon |
| C | 内部：12バリデータ / 件数の一致 / 空ボタン / 内部フラグ漏れ / a_id / GA4測定ID |

### 深刻度の考え方

「高」だけが Issue になる。毎週同じものを鳴らすと通知が形骸化するため、
恒常的な状態は「中」に落とし、**状態が変わったとき**だけ「高」にする。

取得失敗（A1）は前週からの遷移で判断する。

| 前週 | 今週 | 深刻度 | 意味 |
| --- | --- | --- | --- |
| `rakuten` | 取得失敗 | **高** | 先週まで取得できていた商品が消えた可能性 |
| `manual-stale` | 取得失敗 | 中 | 取得できない状態が継続している |
| 記録なし | 取得失敗 | 中 | 初回のため消失か揺れか判断できない |

ショップ内検索は当たり外れがあり、同じリンクでも実行ごとに成功・失敗が
入れ替わる。単発の失敗を「高」にすると誤検知が続くため、この設計にしている。

その他、`needsCorrectLink` が付いた既知の商品は「高」を「中」に落とす。

### 楽天API側が落ちているとき

半数以上が取得失敗になった場合は、商品が一斉に消えたのではなくAPI側の問題と判断し、
**商品ごとの警告を出さずに1件にまとめる**。同時に `reports/state.json` を更新しない。

これが無いと、前週 `rakuten` だった126件がすべて「高」になり、巨大な誤報になる。
さらに全件を `manual-stale` として記録してしまうと、翌週以降の遷移判定の土台が失われる。

2026-08-18 に実際に起きた（認証は通るのに `HTTP 400 API Configuration not found` が返る）。
レポートには楽天が返した文言をそのまま載せるので、原因の切り分けに使える。

### 商品名の照合

3段階で見る。どれかで一致すれば正常とみなす。

1. 日本語の語の重なり（掲載名の2文字以上の語の半数以上が含まれるか）
2. `_productNameAliases` の例外辞書（A*MEN / エンジェル メン など）
3. **ローマ字化した掲載名と英語商品名の重なり**

3 は「Versace Eros Energy by Versace for Men」のように商品名が全て英語の
出品のためにある。掲載名をローマ字に直し、最長共通部分列で語ごとに比較する。
転写は不可逆なので完全一致は期待せず、語の半数が重なるかで判断する。

別ラインを掴んでいるケース（フォー ハー → ピュア ムスク）は一致率0%で
正しく弾けることを実測で確認している。

### 前週との比較

`reports/state.json` に価格・容量・商品名・`priceSource` を記録し、翌週これと
比較する。初回は比較対象がないので記録だけ作る。

### GitHub Actions

`.github/workflows/weekly-audit.yml` が毎週月曜 09:00 JST に実行する。
`workflow_dispatch` で手動実行もできる。

実行には `RAKUTEN_APP_ID` と `RAKUTEN_ACCESS_KEY` の GitHub Secrets が必要。
`RAKUTEN_ORIGIN` はワークフロー内で明示している（他サイトの値が残っていて
認証に失敗した事例があるため）。
