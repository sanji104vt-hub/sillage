# Sillage データ基盤移行・公開後監査

## 1. デプロイ日時

- GitHub Actions開始: 2026年7月18日 21:59:43 JST
- Cloudflare Workersデプロイ完了: 2026年7月18日 22:00:12 JST
- ワークフロー完了: 2026年7月18日 22:00:16 JST

## 2. pushしたコミット

- `35a08a0` `feat(sillage): enrich second fragrance data batch`
- `d1c47e0` `refactor(sillage): normalize fragrance data architecture`
- push前のリモートmain: `23409df`
- デプロイ対象HEAD: `d1c47e0b6d81549970402f37a48bb51844626174`

## 3. GitHub Actionsの結果

- Workflow: `Deploy to Cloudflare Workers`
- Run: https://github.com/sanji104vt-hub/sillage/actions/runs/29645329216
- 結果: success
- Cloudflare Workersへのデプロイ: success
- IndexNow通知: success

## 4. Worker URL

- https://sillage.sanji-104vt.workers.dev/
- 商品詳細URLへのアクセスが正規ドメインの同一slugへ301リダイレクトされることを確認した。

## 5. 正規公開URL

- https://sillage.asutelu.com/
- 商品一覧: https://sillage.asutelu.com/#fragrances
- ブランド一覧: https://sillage.asutelu.com/#brands
- 香調一覧の既存導線例: https://sillage.asutelu.com/?family=aromatic#fragrances
- シーン一覧の既存導線例: https://sillage.asutelu.com/?scene=business#fragrances
- 季節一覧の既存導線例: https://sillage.asutelu.com/?season=spring#fragrances

## 6. 確認した商品URL

### 代表10商品の範囲から

- Dior「ソヴァージュ EDT」: https://sillage.asutelu.com/items/dior-2
- 無印良品「オードトワレ シトラス」: https://sillage.asutelu.com/items/muji-1
- Aesop「タシット」: https://sillage.asutelu.com/items/aesop-1

### 第2段階20商品の範囲から

- Jo Malone「ライムバジル & マンダリン」: https://sillage.asutelu.com/items/jo-malone-1
- Chanel「ブルー ドゥ シャネル EDP」: https://sillage.asutelu.com/items/chanel-4
- Le Labo「アナザー 13」: https://sillage.asutelu.com/items/le-labo-2

### 未補完62商品の範囲から

- CK「CK one」: https://sillage.asutelu.com/items/ck-1
- Brut「クラシック」: https://sillage.asutelu.com/items/brut-1
- Versace「ディラン ブルー」: https://sillage.asutelu.com/items/versace-2

### その他

- ブランドページ: https://sillage.asutelu.com/brand-dior.html
- 存在しないslug: `/items/does-not-exist-sillage-audit` がHTTP 404になることを確認した。

## 7. URL・slug確認結果

- `data/fragrances.json`は正しいJSONとして読み込み可能。
- 商品総数92件、slug 92件、重複0件、欠損0件。
- 商品詳細HTMLは92ページ生成済み。
- 正規ドメイン上の全92商品URLがHTTP 200。
- 公開中の全92商品HTMLは、ローカル生成HTMLとバイト単位で一致。
- 全92ページのcanonicalが自身の正規URLと一致。
- 関連商品リンクは全件で存在するslugを参照。
- sitemapの商品URLは92件、重複0件、欠損0件。
- Worker入口は同じslugを維持して正規ドメインへ転送。
- 存在しないslugはHTTP 404。

## 8. 楽天リンク移行結果

- 商品詳細ページに表示される楽天URLは移行前後比較で変更なし。
- `rafcid`を含む既存アフィリエイトパラメータを維持。
- 商品詳細ページの楽天リンクは `rel="nofollow sponsored noopener noreferrer"` を維持。
- 楽天リンクがない `muji-1` と `brut-1` の商品詳細には購入ボタンも空の購入エリアも表示されない。
- 公式リンクには `noopener noreferrer`、情報源リンクには `noopener noreferrer` が付与され、情報源には `sponsored` が付かない。
- 外部リンク監査は139 URLを検査し、不正形式0件、リンク種別不一致0件。24件は直接200、81件は正常なリダイレクト、34件は外部サイト側のbot制限で自動到達確認不可だった。
- Aesopの公式URLは `aesop.com` から日本向け `aesop.co.jp` へ転送されるが、リンク切れではない。

## 9. 情報源表示結果

- 補完済み商品の情報源セクションは、`details` / `summary`で開閉できる。
- Diorの商品で開閉を実操作し、publisher、ページタイトル、確認日が表示されることを確認。
- 生URL、`supports`、`sourceType`、`market`の内部値は本文へ露出しない。
- 同一URLの重複表示なし。
- 情報源リンクは新しいタブで開き、`noopener noreferrer`を持ち、`sponsored`を持たない。
- 情報源がない未補完商品では空の情報源セクションを出力しない。

## 10. SEO・構造化データ結果

- 全92ページでtitle 92件が一意。
- 全92ページでmeta description 92件が一意。
- 全92ページでh1は1件。
- 全92ページで`Product`と`BreadcrumbList`を出力。
- `aggregateRating`は0件、`offers`は0件で、架空の評価・在庫・販売価格を構造化していない。
- 補完済み商品の濃度、容量、参考価格、購入判断、更新日、情報確認日、情報源は初期HTMLに含まれる。
- 未補完商品に`null`、`undefined`、空文字や固定更新日は表示されない。
- GA4、Search Console、canonicalおよび既存構造化データに移行による差分なし。

## 11. トップ・一覧ページ結果

- トップページはJavaScript実行後に「全92件の香水」を表示し、92商品を描画。
- 初期HTMLの読み込み中表示から0件表示を経由しない。
- ビジネス絞り込みは36件を表示し、`aria-pressed="true"`と選択クラスを付与。リセット後は92件へ戻る。
- アロマティック香調は14件、春は55件、ビジネスは36件を表示。
- Diorブランドページの商品リンクは7件で、既存商品URLを維持。
- 商品順、商品カード数、ブランド・香調・シーン・季節の既存導線は移行前後比較で変更なし。

## 12. モバイル確認結果

- 375px、768px、1024px、1440pxでトップページと商品詳細ページを確認。
- 4幅すべてでドキュメント全体の横スクロールなし。
- 長い商品名、商品画像、購入リンク、媒体名が画面外へはみ出さない。
- 375pxの購入ボタンは横幅324px、高さ51px以上を確保。
- 情報源の開閉、購入リンク、関連商品リンクを操作可能。
- `:focus-visible`の2pxアウトラインと`prefers-reduced-motion: reduce`の抑制ルールを確認。
- ブラウザコンソールのerror / warningは、トップ、商品詳細、Worker経由の各確認で0件。

## 13. 発見した問題

- データ移行による公開HTML、商品URL、表示内容、楽天URLの意図しない変更は0件。
- 既存トップページの商品カードには、楽天リンク未登録の14商品で `href="#"` の「楽天で価格を見る」リンクが残っている。商品詳細テンプレートでは正しく非表示で、移行前後の出力にも差分がないため、今回の「公開表示を変えない」範囲では変更していない。別のUI修正として扱う必要がある。
- GitHub Actions内で利用される一部ActionにNode.js 20廃止予定の警告があるが、今回のデプロイ結果には影響していない。
- シークレットウィンドウ自体は自動ブラウザ環境で作成できないため、キャッシュ回避クエリ、再読み込み、新規タブ直アクセス、および公開HTMLのローカル完全一致で代替確認した。

## 14. 修正コミット

- なし。移行による不具合を検出しなかったため、商品データ・UI・デプロイ設定には追加変更を行っていない。
- 本レポートのみを独立コミットする。

## 15. 移行前後の意図しない差分

- `reports/fragrance-migration-comparison.csv`: 1,196検査、意図しない差分0件。
- 全92商品についてURL、商品順、既存説明、ノート、香調、シーン、季節、楽天URLを比較済み。
- `git diff --check`: 問題なし。

## 16. 残り62商品の補完開始可否

- データ基盤・slug・生成物・公開経路については開始可能。
- 補完は今回固定したschema v2、slug、購入リンク、情報源の構造を維持し、商品単位の根拠確認と移行比較を継続する。
- トップカードの楽天未登録リンクはデータ補完とは切り離し、別コミットで修正することを推奨する。

## 17. ロールバック方法

履歴を書き換えず、`main`上で次の順にrevertコミットを作成してpushする。

1. `git revert d1c47e0`
2. `git revert 35a08a0`
3. `git push origin main`
4. GitHub ActionsのCloudflare Workersデプロイ完了を確認する。

これにより、デプロイ前の公開対象 `23409df` 相当へ安全に戻せる。強制push、reset、履歴書き換えは使用しない。
