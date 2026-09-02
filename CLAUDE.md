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
