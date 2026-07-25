# Sillage 分岐統合・コラム本番デプロイ監査

監査日時: 2026-07-26 00:53 JST  
正規公開URL: https://sillage.asutelu.com/  
Worker URL: https://sillage.sanji-104vt.workers.dev/  
GitHub Actions: https://github.com/sanji104vt-hub/sillage/actions/runs/30164491890

## 1. 分岐前の履歴

- リモート`main`固有: 1コミット
  - `b2f7f94 SEO Phase3-B: 商品表示画像の自ドメイン化`
- ローカル`main`固有: 14コミット
  - `6ea805a refactor(sillage): strengthen beginner column architecture`
  - `113e50e feat(sillage): add beginner fragrance guide columns`
  - 上記を含む14コミット
- 作業開始時の作業ツリーは空でした。
- ローカル履歴は`backup/pre-column-merge-main`へ退避しました。

## 2. 統合方法

1. `backup/pre-column-merge-main`を作成
2. `integration/merge-remote-image-and-columns`を作成
3. `git merge --no-ff origin/main`
4. 自動マージ後に、生成物と生成処理を横断して意味的な退行を監査
5. 修正・全再生成・全検証後、`main`をfast-forward
6. `git push origin main`で通常push

強制push、履歴書き換え、resetは使用していません。

## 3. 競合ファイル

Gitのテキスト競合は0件でした。

ただし、両ブランチが別々に追加・変更していた生成処理の組み合わせにより、以下の意味的な不整合を検出しました。

- 遅延読み込み商品カードが外部画像URLを直接参照
- 商品ページ生成順によりCollectionPage descriptionが欠落
- 一部商品ページのTwitterカード種別が`summary`へ戻る
- モバイル診断結果の1列表示が生成後CSSから欠落
- 画像・比較・監査スクリプトが旧HTML構造を前提

## 4. 競合解消内容

- `public/assets/home.js`
  - 商品画像の第一参照を`/img/products/{slug}.png`へ統一
  - 外部画像はローカル画像失敗時だけのフォールバックとして保持
- `build-fragrance-assets.mjs`
  - 一元管理されたサイト説明を読み込み、CollectionPage JSON-LDへ維持
- `build-items.mjs`
  - 商品ページのTwitterカードを`summary_large_image`へ統一
  - OGP画像メタの不要な改行を除去
- `public/index.html`
  - 768px以下で診断結果商品を1列表示
- 検証・監査スクリプト
  - ローカル商品画像、遅延読み込み構造、可視本文を基準に更新
- ブランドページ
  - 新規コラムへの内部リンクを生成処理から再構築

## 5. 保持したリモート変更

- 全92商品の自ドメイン画像
- 商品詳細、トップ遅延商品カード、Product JSON-LDの自ドメイン画像URL
- 外部画像を使うフォールバック
- 画像alt
- 既存の画像配信・Cloudflare Workers構成

公開トップをスクロール後、92件すべてが`/img/products/`から読み込まれ、画像切れは0件でした。

## 6. 保持したローカル変更

- 総合香水サイトの共通文言
- 全33コラム
- 指定された新規12記事
- コラムカテゴリ・一覧・関連記事・関連商品
- Article、BreadcrumbList、FAQPage
- sitemap登録
- ビジネス記事の新タイトルと定性表示
- トップ初期HTMLの軽量化と遅延読み込み

## 7. pushしたコミット

- マージ: `efa725f242c50edb9b7f6776e6a3d62abf57a365`
- 意味的な統合修正: `452f8635df187d836f3c9735060a982a15532837`
- 監査レポート末尾空白修正: `5e49f7ff74da49506cc50f5f46e4c5489e72366f`

`b2f7f94`、`6ea805a`、`113e50e`はすべて現在の`main`の祖先です。

## 8. GitHub Actions URL

https://github.com/sanji104vt-hub/sillage/actions/runs/30164491890

- ワークフロー: Deploy to Cloudflare Workers
- 結果: success
- Cloudflare Workers deploy: success
- IndexNow通知: success
- 所要時間: 30秒
- 注記: Actions側でNode.js 20非推奨警告が1件ありますが、デプロイ結果には影響していません。

## 9. Worker URL

https://sillage.sanji-104vt.workers.dev/

Worker入口から正規URL`https://sillage.asutelu.com/`へ遷移し、最新版のタイトルとcanonicalを確認しました。

## 10. 正規公開URL

https://sillage.asutelu.com/

通常アクセス、キャッシュ回避クエリ、Worker入口、記事・商品URLへの直接アクセスで同じ版を確認しました。

## 11. 新規12記事のHTTP結果

以下はすべてHTTP 200です。

1. https://sillage.asutelu.com/columns/how-many-sprays
2. https://sillage.asutelu.com/columns/where-to-apply-perfume
3. https://sillage.asutelu.com/columns/too-much-perfume
4. https://sillage.asutelu.com/columns/why-cant-smell-own-perfume
5. https://sillage.asutelu.com/columns/make-perfume-last-longer
6. https://sillage.asutelu.com/columns/perfume-on-clothes
7. https://sillage.asutelu.com/columns/how-to-test-perfume
8. https://sillage.asutelu.com/columns/perfume-bottle-size
9. https://sillage.asutelu.com/columns/perfume-expiration
10. https://sillage.asutelu.com/columns/perfume-storage
11. https://sillage.asutelu.com/columns/perfume-gift-guide
12. https://sillage.asutelu.com/columns/perfume-decanting

全12記事で次を確認しました。

- canonical自己参照: 12/12
- noindexなし: 12/12
- H1が1つ: 12/12
- Article: 12/12
- BreadcrumbList: 12/12
- sitemap登録: 12/12
- コラム一覧から到達可能: 12/12
- 関連記事リンクあり: 12/12
- 商品リンクあり: 12/12（各3件）
- 内部リンク: 各20件
- Search Console投入可能: 12/12

## 12. トップの総合香水サイト化確認

- title: `Sillage（シヤージュ）｜香調・シーン・季節から選ぶ香水ガイド`
- description: `プチプラからメゾンまで。香調・シーン・季節から、自分に合う香りを見つける総合香水ガイド。`
- OGP title/description: 上記と一致
- H1: 香水92本を香調・シーン・季節で比較する内容
- フッター: `香調・シーン・季節から選ぶ香水ガイド`
- JSON-LD: WebSite、Organization、BreadcrumbList、FAQPage、CollectionPage
- 共通部分の旧メンズ限定文言: 0件

## 13. ビジネス記事確認

URL: https://sillage.asutelu.com/columns/business-fragrance

- H1: `職場の香水は何プッシュ？迷惑にならない選び方とつけ方`
- canonical: URL維持・自己参照
- `清潔感92`、`落ち着き78`: 0件
- 定性表示:
  - 清潔感: 重視
  - 甘さ: 控えめ
  - 拡散: 弱め
  - 量: 1プッシュから

## 14. 商品画像の自ドメイン化確認

- トップ遅延読み込み後: 自ドメイン商品画像92件、画像切れ0件
- 商品詳細確認: https://sillage.asutelu.com/items/dior-2
- 画像URL: `https://sillage.asutelu.com/img/products/dior-2.png`
- canonical、Product、BreadcrumbList: 正常
- ブランド・ノート・購入リンク・情報源: 維持
- 楽天購入リンクの`rel="nofollow sponsored noopener noreferrer"`: 維持
- モバイル横スクロール、可視`null`/`undefined`: なし

## 15. title・description重複結果

- 生成済み全177 HTML: title重複0件、description重複0件
- 公開新規12記事: title重複0件、description重複0件

## 16. sitemap結果

- sitemapの正規URL: 177件
- 生成済みHTMLとの不足・余分: 0件
- 新規12記事掲載: 12/12

## 17. 内部リンク結果

- 生成済み全177 HTMLの内部リンク切れ: 0件
- 新規12記事はコラム一覧から到達可能
- 各記事に関連記事リンク4件、商品リンク3件
- ブランドページ16件へ新規記事の関連導線を再生成

## 18. 発見した問題

### 修正済み

- 自動マージ後の遅延商品カードだけが外部画像を直接使う不整合
- 生成順によるCollectionPage description欠落
- 商品Twitterカード種別の不統一
- モバイル診断結果の列数退行
- 検証スクリプトの旧構造依存
- 既存監査Markdown末尾の余分な空行

### 未解決

- GitHub Actionsで、Node.js 20を対象とする`actions/checkout@v4`と`cloudflare/wrangler-action@v3`への非推奨警告があります。現時点のデプロイは成功しており、今回の統合範囲外のため設定変更はしていません。
- Search ConsoleのURL検査・インデックス登録リクエストは、Search Consoleの認証操作を自動実行していないため未送信です。12件はすべて送信可能な状態です。

## 19. 修正コミット

- `452f863 fix(sillage): preserve column and image changes after merge`
- `5e49f7f fix(sillage): remove trailing audit whitespace`

## 20. Search Consoleへ登録可能なURL一覧

`reports/column-search-console-submission.csv`に12件を記録しました。全件`readyForIndexRequest=true`です。

## 21. ロールバック方法

履歴を書き換えず、次の順序で新しいrevertコミットを作ります。

1. 監査レポートコミットをrevert
2. `5e49f7f`をrevert
3. `452f863`をrevert
4. マージコミット`efa725f`を、保持する親を指定してrevert
5. 通常pushし、GitHub Actionsの完了を確認

`git reset --hard`、`push --force`、`push --force-with-lease`は使用しません。

## 検証補足

- JavaScript・JSON構文: 合格
- 商品データ: 92件、slug重複0
- 商品ページ: 92件生成
- ブランド: 47ページ生成
- コラム: 33件生成
- title/description/canonical/H1/JSON-LD: 合格
- 画像: ローカルPNG 92件、Product JSON-LDも自ドメイン
- 404・内部リンク・sitemap: 合格
- `git diff --check`: 合格
- ブラウザ: 指定4記事×375/768/1024/1440pxの16確認で失敗0
