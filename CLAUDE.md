# Sillage — 作業前に必ず読むこと

このファイルは Sillage リポジトリ固有のルール。全プロジェクト共通のルールは
`C:\Users\niji1\.claude\CLAUDE.md` にある。

---

## 英語版（`public/en/`）を触るときの絶対ルール

### 1. HTMLを直接編集しない

`public/en/` の39ファイルは **`build-i18n.mjs` の生成物**。
このスクリプトは冒頭で出力先を全削除してから作り直す。

```js
rmSync("public/en", { recursive: true, force: true });
```

HTMLを直接編集しても、次のビルドで**跡形もなく消える**。
変更するのは常に生成側。

| 変えたいもの | 直す場所 |
| --- | --- |
| ページの構造・文言・リンク | `build-i18n.mjs` |
| 商品の英訳 | `data/i18n/products.en.json` / `products.phase2.en.json` |
| ブランドの英訳 | `data/i18n/brands.en.json` |
| UIラベル | `data/i18n/translations.json` |
| 店舗データ | `data/stores.json` |
| 免税制度データ | `data/tax-free-system.json` |

### 2. ビルドは必ず全パイプラインで実行する

**`build-i18n.mjs` だけを実行してはいけない。**
`enhance-static-seo.mjs` まで通さないと、英語ページから
**favicon・manifest・theme-color が消える**（これらは後段が付与している）。

```bash
node build-fragrance-assets.mjs && node build-home-data.mjs && node build-site-copy.mjs \
  && node build-items.mjs && node build-columns.mjs && node build-internal-links.mjs \
  && node build-kyoto-article.mjs && node build-i18n.mjs && node generate-seo.mjs \
  && node enhance-static-seo.mjs
```

実行後は `git status` で **削除（`D`）が0件**であることを確認する。
削除が出ていたらパイプラインの通し忘れ。

（2026-08-31 に実際にこれを踏みかけた。差分レビューで気づいて事なきを得た）

---

## 免税ガイドを直すとき

`/en/guides/tax-free-perfume-shopping-japan/` は本文9,700字。
**事実と散文で置き場所が分かれている。**

| 直したいもの | 場所 |
| --- | --- |
| 日付・税率・上限・日数 | `data/tax-free-system.json` |
| 対比表の行 | 同 `comparison` |
| 空港の手順 | 同 `airportSteps` |
| FAQ の質問と回答 | 同 `faq` |
| 出典 | 同 `sources` |
| 説明の散文 | `build-i18n.mjs` の `renderTaxFreeGuide()` |

**FAQ は本文と FAQPage schema を同じ配列から生成している。**
`faq` を直せば両方に反映される。片方だけ直そうとしないこと。

`lib/tax-free-data.mjs` は JSON を読んで渡すだけに保つ。
ここに散文を置くと、JSON と lib のどちらを見ればよいか分からなくなる。

### 税制を書くときの原則

**数値は必ず JSON に置き、`validate-tax-free-guide.mjs` の検査対象にする。**
税制の誤記は読者に実害が及ぶ。バリデータは税率10%/8%、上限50万円、
90日、施行日を固定し、本文に出ていることまで検査している。

**税率を書くなら、全額が戻るとは限らないことを必ずセットで書く。**
新制度では免税店または委託事業者が手数料を差し引くことが想定されており、
10%と書くだけだと「10%戻る」と誤解される。バリデータが
"The refund amount may be less than the full tax amount" の存在を検査している。

**「存在しない」と断定しない。**
現行制度の期限を当初「Not specified for this procedure」と書いたが、
国税庁の資料には「消耗品を購入した日から30日以内に輸出する旨を誓約する書類」
とある。他の公式サイトではこの30日が省かれており運用に揺れがあるため、
`NTA guidance refers to` という形で出典に帰属させた。
バリデータが "Not specified for this procedure" の再出現を禁止している。

**改正で「消耗品」という区分自体が無くなる。**
香水は現行では消耗品だが、2026-11-01 以降は一般物品との区分が撤廃される。
「香水は消耗品」とだけ書くと改正後の説明として不正確になる。

**香水が標準税率である根拠は、制度の構造から導く。**
「香水は10%」と単独で断定せず、軽減税率の対象（酒類・外食を除く飲食料品／
定期購読契約の週2回以上発行の新聞）を示したうえで、そこに含まれないと書く。
こう書けば出典に書かれている内容だけで構成される。

---

## デプロイの仕組み

- `.github/workflows/deploy.yml` が `main` への push で発火
- `wrangler.jsonc` の `assets.directory: "./public"` を**丸ごと全置換**でアップロード
- **ビルドステップは無い。** コミットされた `public/` がそのまま本番になる

つまり、**ビルド結果をコミットし忘れると本番に反映されない**し、
**ファイルを消してコミットすると本番からも消える**。

---

## 触ってはいけないもの

- GA4測定ID `G-60BQRQWB5M`（Moilum の `G-BC0FBSZSWX` と間違えないこと）
- Search Console 検証タグ
- 楽天リンクの `a_id=5718841`（Moilum は `5738711`）
- 購入ボタンの `rel="nofollow sponsored noopener"`
- hreflang の日英対応（商品単位で `/en/fragrances/{brand}/{product}/` ↔ `/items/{slug}`）

---

## 認証情報

`.env.local`（git管理外）に置き、読み込んでから実行する。

```bash
set -a; . ./.env.local; set +a
```

アクセスキーをコマンドライン引数やコミットに直接書かない。

---

## 検証

変更後は16本のバリデータを通す。

```bash
for v in validate-*.mjs; do node "$v" || echo "NG: $v"; done
```

楽天API・リンク・画像の健全性は週次監査が見る。詳細は `scripts/README.md`。
