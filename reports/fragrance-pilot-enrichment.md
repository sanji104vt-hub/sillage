# Sillage 代表10商品データ補完レポート

## 選定した10商品と理由

1. **muji-1 — 無印良品「オードトワレ シトラス」**
   - 必須対象。プチプラのシトラスで、楽天リンクなし・公式商品ページ未確認の欠損ケースを検証するため。
2. **dior-2 — Dior「ソヴァージュ EDT」**
   - 関連商品導線で露出が多い主要ブランドのアロマティック。EDTと国内公式価格を検証するため。
3. **ysl-2 — YSL「リブレ オーデパルファン」**
   - フローラルの主要商品。EDPと複数容量、公式楽天リンクを持つケースを検証するため。
4. **versace-1 — Versace「エロス EDT」**
   - フルーティ系の主要商品。EDTと海外公式情報、日本の楽天リンクを併存させるケースのため。
5. **tom-ford-1 — Tom Ford「トバコ バニラ」**
   - 露出が多いグルマン。EDP・複数容量・楽天リンクなしの高価格帯ケースのため。
6. **maison-margiela-1 — Maison Margiela「レプリカ ジャズクラブ」**
   - 露出が多いアンバー。EDTと複数容量、公式ノート構成が充実したケースのため。
7. **hermes-3 — Hermès「テール ド エルメス」**
   - 露出が多いウッディ。EDT・国内公式価格・楽天リンクなしのケースのため。
8. **guerlain-3 — Guerlain「ミツコ」**
   - 歴史的なシプレ。EDP・国内公式価格・公式在庫切れ表示のケースのため。
9. **shiro-1 — SHIRO「サボン オードパルファン」**
   - 露出が多い国産ムスク。EDP・国内公式価格・公式在庫切れ表示のケースのため。
10. **aesop-1 — Aesop「タシット」**
   - 露出が多いアクアティック。EDP・国内公式価格・複数容量展開の一部確認ケースのため。

10ブランド・10香調に分散し、楽天リンクあり7件／なし3件、EDT・EDPの両方を含めました。

## 商品ごとの補完結果

| 商品ID | ブランド | 商品名 | 補完できた項目 | 補完できなかった項目 |
|---|---|---|---|---|
| muji-1 | 無印良品 | オードトワレ シトラス | おすすめする人、おすすめしにくい人、商品固有の注意点、プロフィール構造、情報確認日 | 香水濃度、容量・参考価格、購入リンク、情報源 |
| dior-2 | Dior | ソヴァージュ EDT | 香水濃度、容量・参考価格、おすすめする人、おすすめしにくい人、商品固有の注意点、プロフィール構造、購入リンク、情報源、情報確認日 | なし |
| ysl-2 | YSL | リブレ オーデパルファン | 香水濃度、容量・参考価格、おすすめする人、おすすめしにくい人、商品固有の注意点、プロフィール構造、購入リンク、情報源、情報確認日 | なし |
| versace-1 | Versace | エロス EDT | 香水濃度、容量・参考価格、おすすめする人、おすすめしにくい人、商品固有の注意点、プロフィール構造、購入リンク、情報源、情報確認日 | なし |
| tom-ford-1 | Tom Ford | トバコ バニラ | 香水濃度、容量・参考価格、おすすめする人、おすすめしにくい人、商品固有の注意点、プロフィール構造、購入リンク、情報源、情報確認日 | なし |
| maison-margiela-1 | Maison Margiela | レプリカ ジャズクラブ | 香水濃度、容量・参考価格、おすすめする人、おすすめしにくい人、商品固有の注意点、プロフィール構造、購入リンク、情報源、情報確認日 | なし |
| hermes-3 | Hermès | テール ド エルメス | 香水濃度、容量・参考価格、おすすめする人、おすすめしにくい人、商品固有の注意点、プロフィール構造、購入リンク、情報源、情報確認日 | なし |
| guerlain-3 | Guerlain | ミツコ | 香水濃度、容量・参考価格、おすすめする人、おすすめしにくい人、商品固有の注意点、プロフィール構造、購入リンク、情報源、情報確認日 | なし |
| shiro-1 | SHIRO | サボン オードパルファン | 香水濃度、容量・参考価格、おすすめする人、おすすめしにくい人、商品固有の注意点、プロフィール構造、購入リンク、情報源、情報確認日 | なし |
| aesop-1 | Aesop | タシット | 香水濃度、容量・参考価格、おすすめする人、おすすめしにくい人、商品固有の注意点、プロフィール構造、購入リンク、情報源、情報確認日 | なし |

プロフィールは全10件に構造だけを追加し、5軸の数値は評価基準未策定のためすべて null のままです。

## 使用した情報源

- dior-2: [Dior — ソヴァージュ オードゥ トワレ](https://www.dior.com/ja_jp/beauty/products/%E3%82%BD%E3%83%B4%E3%82%A1%E3%83%BC%E3%82%B8%E3%83%A5-%E3%82%AA%E3%83%BC%E3%83%89%E3%82%A5-%E3%83%88%E3%83%AF%E3%83%AC-Y0685240.html)（concentration / sizes）
- ysl-2: [Yves Saint Laurent Beauty — LIBRE Eau de Parfum](https://www.yslbeauty.com/int/fragrance/fragrance-for-her/libre/libre-eau-de-parfum/WW-50424YSL.html)（concentration / sizes / notes）
- versace-1: [Versace — Eros EDT 100 ml](https://www.versace.com/us/en/men/accessories/fragrances-body-care/eros/eros-edt-100-ml-blue/R740010-R100MLS_RTU_TU_RNUL__.html)（concentration / sizes / notes）
- tom-ford-1: [Tom Ford Beauty — Tobacco Vanille Eau de Parfum](https://www.tomfordbeauty.com/products/tobacco-vanille-eau-de-parfum)（concentration / sizes / notes）
- maison-margiela-1: [Maison Margiela Fragrances — REPLICA Jazz Club](https://www.maisonmargiela-fragrances.us/fragrances/replica/replica-jazz-club/MM008.html)（concentration / sizes / notes）
- hermes-3: [Hermès — オー ド トワレ《テール ドゥ エルメス》50 ml](https://www.hermes.com/jp/ja/product/%E3%82%AA%E3%83%BC-%E3%83%89-%E3%83%88%E3%83%AF%E3%83%AC-%E3%80%8A%E3%83%86%E3%83%BC%E3%83%AB-%E3%83%89%E3%82%A5-%E3%82%A8%E3%83%AB%E3%83%A1%E3%82%B9%E3%80%8B-V107189V0/)（concentration / sizes）
- guerlain-3: [Guerlain — ミツコ - オーデパルファン](https://www.guerlain.com/jp/ja-jp/p/les-legendaires-mitsouko---eau-de-parfum-024104.html)（concentration / sizes / notes）
- shiro-1: [SHIRO — サボン オードパルファン](https://shiro-shiro.jp/item/12702.html)（concentration / sizes）
- aesop-1: [Aesop — イソップのフレグランス｜タシット オードパルファム](https://www.aesop.com/jp/c/fragrance/)（concentration / sizes）

詳細は reports/fragrance-pilot-sources.csv に、1商品・1情報源を1行として収録しています。

## 公式リンクを見つけられなかった商品

- muji-1 — 無印良品「オードトワレ シトラス」
  - 現行の公式商品ページを確認できなかったため、濃度・容量・公式購入リンク・出典は欠損のままです。

## データ構造上の問題

- 商品データが public/index.html の大きなインライン配列にあり、商品単位の差分確認とスキーマ検証が難しい構造です。
- 商品IDが配列順と build-items-slugmap.json に依存しており、並び替え時にIDがずれる可能性があります。
- 既存の楽天URLと新しい purchaseLinks.rakuten が移行期間中は重複します。全件展開前に正規フィールドを一本化する必要があります。
- 既存の price は文字列の概算値で、確認日・容量・出典を持ちません。確認済み価格は sizes 内へ分離しました。
- sourceTypeは今回すべてブランド公式のため表示側で「公式」としています。正規取扱店を使う段階で列挙値を正式に定義する必要があります。

## 全92件へ展開する際に必要な工程の分類

### 自動化できる項目

- データ構造、日付形式、URL形式、容量・価格の数値検証
- 同一容量、出典URL、編集文言の重複検出
- 商品ページ生成、空セクション抑止、構造化データと内部リンクの回帰検査
- 補完前後の対象商品ID比較と、対象外商品への意図しないフィールド追加検出

### 人間の確認が必要な項目

- 同名商品の濃度・発売世代・容量違いの同定
- 公式ページと国内正規流通の販売状況、税込価格、リフィル仕様の確認
- 既存ノート構成と公式表現の対応確認
- recommendedFor、notRecommendedFor、商品固有cautionsの編集判断
- 楽天商品ページが対象濃度・容量と一致しているかの目視確認

## 更新日固定問題

- 原因は build-items.mjs の LAST_UPDATED 定数を全92ページへ出力していたことです。
- 定数を廃止し、商品データに updatedAt がある場合だけ「データ更新日」を表示します。
- 今回実際に変更した10件だけに updatedAt と verifiedAt を設定し、対象外82件へ日付を自動投入しません。
