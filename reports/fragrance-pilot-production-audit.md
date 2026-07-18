# Sillage 代表10商品 公開後監査レポート

## 1. デプロイ日時

- 初回パイロットデプロイ完了: 2026-07-18 20:10:02 JST
- 表示文言修正デプロイ完了: 2026-07-18 20:18:14 JST
- 最終監査: 2026-07-18 20:20:16 JST

## 2. デプロイ対象コミット

- `393566a chore(sillage): audit fragrance data quality`
- `c98f457 feat(sillage): enrich pilot fragrance data with sources`
- `9ebb538 fix(sillage): correct pilot fragrance detail rendering`

GitHub Actions:

- 初回: https://github.com/sanji104vt-hub/sillage/actions/runs/29642076050 — success
- 修正後: https://github.com/sanji104vt-hub/sillage/actions/runs/29642310796 — success

## 3. 公開URL

- Worker入口: https://sillage.sanji-104vt.workers.dev/
- 正規公開URL: https://sillage.asutelu.com/

Worker入口から正規ドメインへ遷移し、商品ページのcanonicalも正規ドメインを自己参照している。

## 4. 確認した10商品とURL

| 商品ID | 商品 | 公開URL | 結果 |
|---|---|---|---|
| muji-1 | 無印良品 オードトワレ シトラス | https://sillage.asutelu.com/items/muji-1 | OK（欠損項目は非表示） |
| dior-2 | Dior ソヴァージュ EDT | https://sillage.asutelu.com/items/dior-2 | OK |
| ysl-2 | YSL リブレ オーデパルファン | https://sillage.asutelu.com/items/ysl-2 | OK |
| versace-1 | Versace エロス EDT | https://sillage.asutelu.com/items/versace-1 | OK |
| tom-ford-1 | Tom Ford トバコ バニラ | https://sillage.asutelu.com/items/tom-ford-1 | OK |
| maison-margiela-1 | Maison Margiela レプリカ ジャズクラブ | https://sillage.asutelu.com/items/maison-margiela-1 | OK |
| hermes-3 | Hermès テール ド エルメス | https://sillage.asutelu.com/items/hermes-3 | OK |
| guerlain-3 | Guerlain ミツコ | https://sillage.asutelu.com/items/guerlain-3 | OK |
| shiro-1 | SHIRO サボン オードパルファン | https://sillage.asutelu.com/items/shiro-1 | OK |
| aesop-1 | Aesop タシット | https://sillage.asutelu.com/items/aesop-1 | OK |

## 5. 対象外として確認した商品

| 商品ID | 公開URL | 結果 |
|---|---|---|
| 4711-1 | https://sillage.asutelu.com/items/4711-1 | 固定更新日なし。既存情報・楽天リンク・タイムライン・関連商品・タグを維持 |
| chanel-1 | https://sillage.asutelu.com/items/chanel-1 | 固定更新日なし。既存情報・楽天リンク・タイムライン・関連商品・タグを維持 |
| acqua-di-parma-1 | https://sillage.asutelu.com/items/acqua-di-parma-1 | 固定更新日なし。既存情報・楽天リンク・タイムライン・関連商品・タグを維持 |

## 6. 表示確認結果

- 10商品すべてでブランド名、商品名、更新日、情報確認日、購入判断サマリーを確認。
- 公式に確認できた9商品では濃度と容量を表示。国内参考価格を確認できた容量だけ価格を表示。
- 無印良品は濃度、容量、参考価格、購入エリア、情報源を推測表示していない。
- 空欄、`null`、`undefined`、「不明」「未確認」のプレースホルダー表示はない。
- 「Sillage の見立て」ラベルにより編集判断と公式情報を区別している。
- 情報源は折りたたみ表示で、媒体名とページタイトルを表示。生URLと内部のsupports値は本文に露出していない。
- トップページは「全92件の香水」と表示され、初期0件表示はない。
- 商品一覧、Diorブランドページ、アロマティック一覧、ビジネス一覧への遷移を確認。

## 7. リンク確認結果

- 公式リンクは監査で採用した公式ドメイン・商品ページURLと一致。
- 公式リンクと情報源リンクは `target="_blank"`、`noopener noreferrer`。情報源リンクに `sponsored` はない。
- 楽天リンクは7商品すべて楽天の商品ページまたは楽天アフィリエイト遷移先へHTTP 200で到達。
- 楽天リンクは `nofollow sponsored noopener noreferrer`。
- 空URL、誤った購入ラベル、情報源内の重複URLは検出されなかった。
- Dior、Versace、Maison Margiela、Hermès、Guerlainの公式サイトは自動HTTP確認に403を返したが、リンク先ドメインと商品URLは正しい。各社のBot対策による応答であり、Sillage側のリンク不具合ではない。

## 8. SEO・構造化データ確認結果

- 代表10商品でtitleとmeta descriptionは各10件すべて一意。
- 各商品はh1が1つ、canonicalは正規公開URLへの自己参照。
- ProductとBreadcrumbListを初期HTMLに出力。
- Productにoffers、aggregateRating、架空の在庫・評価・販売価格を出力していない。
- 濃度、容量、購入判断、情報源は利用可能な場合に初期HTMLへ含まれる。
- 対象外3商品もtitle、canonical、h1、Product、BreadcrumbListを維持。
- 存在しない `/items/this-product-does-not-exist` はHTTP 404。

## 9. モバイル・操作・キャッシュ確認結果

- 375px、768px、1024px、1440pxで横スクロールなし。
- 長い商品名、媒体名、購入ボタンは画面内に収まり、購入ボタン高は約51px以上。
- 情報源のクリック開閉を確認。summary要素にキーボードフォーカスが移り、focus-visibleのアウトラインを確認。
- `prefers-reduced-motion` のCSSルールを確認。
- 通常アクセス、再読み込み、キャッシュ回避クエリ、新規タブからの直接アクセスで修正後HTMLを確認。
- 専用シークレットウィンドウを起動する機能は監査環境にないため、新規の独立タブとキャッシュ回避URLで代替した。
- 操作中に画面上のJavaScriptエラーや機能停止は確認されなかった。監査ブラウザは過去のconsole履歴を直接取得できないため、開発者ツールのconsole履歴確認は未実施。

## 10. 発見した問題

無印良品と海外公式ページを参照した3商品で、注意書きに「未確認」という語が表示され、欠損プレースホルダーと誤解される可能性があった。

## 11. 修正した内容

`9ebb538 fix(sillage): correct pilot fragrance detail rendering`

- 無印良品: 公式商品ページを特定できなかったため販売状況を掲載していない、と説明する文へ変更。
- Versace、Tom Ford、Maison Margiela: 米国公式ページを参照し、日本国内価格は掲載していない、と説明する文へ変更。
- 商品根拠、価格、ノート、購入リンク、対象外商品は変更していない。
- 修正後に92ページ再生成、商品検証、データ監査、再デプロイを実施。

## 12. 全92件展開の可否

商品詳細テンプレートと欠損時表示は公開環境で正常に動作したため、技術面では展開可能。ただし、全92件のデータ補完は下記判断事項を決定するまで開始しないことを推奨する。

判定: **条件付きで展開可。現時点では補完開始を保留。**

## 13. 展開前に残る判断事項

1. 国内公式ページがない商品の採用範囲と、海外公式情報の扱い。
2. 国内参考価格を必須とするか、容量だけの掲載を許容するか。
3. 公式サイトの在庫切れ・Bot対策・URL変更を再確認する頻度。
4. 「おすすめする人」「おすすめしにくい人」の編集基準とレビュー手順。
5. 香りプロフィール数値の根拠と算出方法。
6. 楽天リンクの商品同一性とリンク切れを定期検査する方法。
7. 実機のChrome/Safari開発者ツールによるconsole履歴と、実際のシークレットモードでの最終確認。
