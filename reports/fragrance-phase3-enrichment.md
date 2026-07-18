# Sillage 第3段階31商品データ補完レポート

- 情報確認・更新日: 2026-07-18
- 対象: 未補完62商品のデータ順における前半31件
- 後半31件、既存補完済み30件、slug、商品順: 変更なし
- profile: 全31件で5軸すべてnull（確認済み）

## 1. 前半31商品の選定ルール

正規化済み data/fragrances.json の順序を維持し、既に補完済みの30件を除外した未補完62件を抽出。その先頭31件を対象、残り31件を次段階へ残しました。人気・ブランド・香調による並べ替えはしていません。

## 2. 対象31商品

| 商品ID | ブランド | 商品名 | 香調 | 性別表記 | 作業前楽天 | 作業前公式 |
|---|---|---|---|---|---|---|
| 4711-1 | 4711 | オーデコロン | citrus | unisex | あり | なし |
| atelier-cologne-1 | Atelier Cologne | オランジュ サングィン | citrus | unisex | なし | なし |
| guerlain-1 | Guerlain | オー インペリアル | citrus | unisex | あり | なし |
| dolce-gabbana-1 | Dolce&Gabbana | ライト ブルー プールオム | citrus | men | あり | なし |
| hermes-2 | Hermès | オー ドランジュ ヴェルト | citrus | unisex | あり | なし |
| ck-1 | CK | CK one | aromatic | unisex | あり | なし |
| montblanc-1 | Montblanc | レジェンド | aromatic | men | あり | なし |
| azzaro-1 | Azzaro | プール オム | aromatic | men | あり | なし |
| chanel-1 | Chanel | アリュール オム スポーツ | aromatic | men | あり | なし |
| paco-rabanne-1 | Paco Rabanne | プール オム | aromatic | men | あり | なし |
| nautica-1 | Nautica | ヴォヤージュ | aromatic | men | あり | なし |
| brut-1 | Brut | クラシック | aromatic | men | なし | なし |
| ysl-1 | YSL | Y メン オーデパルファン | aromatic | men | なし | なし |
| chanel-2 | Chanel | エゴイスト プラチナム | aromatic | men | あり | なし |
| gucci-1 | Gucci | ギルティ プールオム | aromatic | men | あり | なし |
| dior-3 | Dior | ソヴァージュ EDP | aromatic | men | あり | なし |
| calvin-klein-1 | Calvin Klein | エタニティ フォーメン | aromatic | men | あり | なし |
| chanel-3 | Chanel | チャンス オー タンドゥル | floral | women | あり | なし |
| gucci-2 | Gucci | ブルーム | floral | women | あり | なし |
| jo-malone-2 | Jo Malone | イングリッシュ ペアー & フリージア | floral | unisex | あり | なし |
| marc-jacobs-1 | Marc Jacobs | デイジー | floral | women | あり | なし |
| jo-malone-3 | Jo Malone | ピオニー & ブラッシュ スエード | floral | unisex | あり | なし |
| versace-2 | Versace | ディラン ブルー | fruity | men | あり | なし |
| azzaro-2 | Azzaro | クローム | fruity | men | あり | なし |
| thierry-mugler-1 | Thierry Mugler | A*MEN | gourmand | men | あり | なし |
| jean-paul-gaultier-1 | Jean Paul Gaultier | ル マル | gourmand | men | なし | なし |
| giorgio-armani-1 | Giorgio Armani | ストロンガー ウィズ ユー | gourmand | men | あり | なし |
| viktor-rolf-1 | Viktor&Rolf | スパイスボム エクストリーム | gourmand | men | あり | なし |
| prada-1 | Prada | キャンディ | gourmand | women | あり | なし |
| carolina-herrera-1 | Carolina Herrera | バッドボーイ | gourmand | men | あり | なし |
| parfums-de-marly-1 | Parfums de Marly | レイトン | gourmand | men | なし | なし |

### 商品ごとの補完結果

| 商品ID | 補完・確認した項目 | 未補完 |
|---|---|---|
| 4711-1 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| atelier-cologne-1 | おすすめ / 非推奨 / 注意点 / 確認日・更新日 / profile null | 濃度 / 容量 / 国内価格 / 公式リンク / 情報源 / Amazon |
| guerlain-1 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| dolce-gabbana-1 | 濃度 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 容量 / 国内価格 / Amazon |
| hermes-2 | 濃度 / おすすめ / 非推奨 / 情報源 / 確認日・更新日 / profile null | 容量 / 国内価格 / 公式リンク / Amazon |
| ck-1 | 濃度 / 容量 / おすすめ / 非推奨 / 情報源 / 確認日・更新日 / profile null | 国内価格 / 公式リンク / Amazon |
| montblanc-1 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| azzaro-1 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| chanel-1 | 濃度 / 容量 / 国内価格 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | Amazon |
| paco-rabanne-1 | おすすめ / 非推奨 / 注意点 / 確認日・更新日 / profile null | 濃度 / 容量 / 国内価格 / 公式リンク / 情報源 / Amazon |
| nautica-1 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| brut-1 | おすすめ / 非推奨 / 注意点 / 確認日・更新日 / profile null | 濃度 / 容量 / 国内価格 / 公式リンク / 情報源 / Amazon |
| ysl-1 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| chanel-2 | 濃度 / 容量 / 国内価格 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | Amazon |
| gucci-1 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| dior-3 | 濃度 / 容量 / 国内価格 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | Amazon |
| calvin-klein-1 | 濃度 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 容量 / 国内価格 / Amazon |
| chanel-3 | 濃度 / 容量 / 国内価格 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | Amazon |
| gucci-2 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| jo-malone-2 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| marc-jacobs-1 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| jo-malone-3 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| versace-2 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| azzaro-2 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| thierry-mugler-1 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| jean-paul-gaultier-1 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| giorgio-armani-1 | 濃度 / おすすめ / 非推奨 / 情報源 / 確認日・更新日 / profile null | 容量 / 国内価格 / 公式リンク / Amazon |
| viktor-rolf-1 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| prada-1 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| carolina-herrera-1 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |
| parfums-de-marly-1 | 濃度 / 容量 / おすすめ / 非推奨 / 公式リンク / 情報源 / 確認日・更新日 / profile null | 国内価格 / Amazon |

## 3. 後半へ残す31商品

| 商品ID | ブランド | 商品名 | 香調 | 性別表記 | 作業前楽天 | 作業前公式 |
|---|---|---|---|---|---|---|
| dior-5 | Dior | ソヴァージュ エリクシール | amber | men | あり | なし |
| paco-rabanne-2 | Paco Rabanne | 1 ミリオン | amber | men | なし | なし |
| ysl-4 | YSL | ラ ニュイ ドゥ ロム | amber | men | なし | なし |
| viktor-rolf-2 | Viktor&Rolf | スパイスボム | amber | men | あり | なし |
| dolce-gabbana-2 | Dolce&Gabbana | ザ ワン フォー メン | amber | men | なし | なし |
| azzaro-3 | Azzaro | ワンテッド | amber | men | なし | なし |
| maison-francis-kurkdjian-1 | Maison Francis Kurkdjian | バカラ ルージュ 540 | amber | unisex | あり | なし |
| versace-3 | Versace | エロス フレイム | amber | men | あり | なし |
| dior-6 | Dior | ファーレンハイト | woody | men | あり | なし |
| giorgio-armani-2 | Giorgio Armani | アルマーニ コード | woody | men | あり | なし |
| le-labo-1 | Le Labo | サンタル 33 | woody | unisex | あり | なし |
| dunhill-1 | Dunhill | アイコン | woody | men | あり | なし |
| prada-2 | Prada | ルオム | woody | men | あり | なし |
| john-varvatos-1 | John Varvatos | アーティザン | woody | men | なし | なし |
| montblanc-2 | Montblanc | エクスプローラー | woody | men | あり | なし |
| jo-malone-4 | Jo Malone | ウッドセージ & シーソルト | woody | unisex | あり | なし |
| hugo-boss-1 | Hugo Boss | ボス ボトルド | woody | men | あり | なし |
| dior-7 | Dior | ディオール オム | woody | men | あり | なし |
| givenchy-1 | Givenchy | ジェントルマン ブシ | woody | men | あり | なし |
| aramis-1 | Aramis | アラミス | chypre | men | あり | なし |
| chanel-5 | Chanel | プール ムッシュ | chypre | men | あり | なし |
| ysl-5 | YSL | クロス | chypre | men | あり | なし |
| chanel-6 | Chanel | アンテウス | chypre | men | あり | なし |
| narciso-rodriguez-1 | Narciso Rodriguez | フォー ハー | musk | women | あり | なし |
| narciso-rodriguez-2 | Narciso Rodriguez | フォー ヒム | musk | men | あり | なし |
| glossier-1 | Glossier | ユー | musk | unisex | あり | なし |
| bvlgari-2 | Bvlgari | ブルガリ プールオム | musk | men | あり | なし |
| davidoff-1 | Davidoff | クール ウォーター | aquatic | men | あり | なし |
| paco-rabanne-3 | Paco Rabanne | インヴィクタス | aquatic | men | あり | なし |
| bvlgari-3 | Bvlgari | アクア プールオム | aquatic | men | あり | なし |
| acqua-di-parma-2 | Acqua di Parma | ブルー メディテラネオ アランチャ | aquatic | unisex | あり | なし |

## 4. 国内公式確認商品

- chanel-1: Chanel「アリュール オム スポーツ」
- chanel-2: Chanel「エゴイスト プラチナム」
- dior-3: Dior「ソヴァージュ EDP」
- chanel-3: Chanel「チャンス オー タンドゥル」
- jo-malone-2: Jo Malone「イングリッシュ ペアー & フリージア」
- jo-malone-3: Jo Malone「ピオニー & ブラッシュ スエード」

日本公式で商品ページを確認できた6件です。

## 5. 海外公式のみの商品

- 4711-1: 4711「オーデコロン」
- guerlain-1: Guerlain「オー インペリアル」
- dolce-gabbana-1: Dolce&Gabbana「ライト ブルー プールオム」
- hermes-2: Hermès「オー ドランジュ ヴェルト」
- ck-1: CK「CK one」
- montblanc-1: Montblanc「レジェンド」
- azzaro-1: Azzaro「プール オム」
- nautica-1: Nautica「ヴォヤージュ」
- ysl-1: YSL「Y メン オーデパルファン」
- gucci-1: Gucci「ギルティ プールオム」
- calvin-klein-1: Calvin Klein「エタニティ フォーメン」
- gucci-2: Gucci「ブルーム」
- marc-jacobs-1: Marc Jacobs「デイジー」
- versace-2: Versace「ディラン ブルー」
- azzaro-2: Azzaro「クローム」
- thierry-mugler-1: Thierry Mugler「A*MEN」
- jean-paul-gaultier-1: Jean Paul Gaultier「ル マル」
- giorgio-armani-1: Giorgio Armani「ストロンガー ウィズ ユー」
- viktor-rolf-1: Viktor&Rolf「スパイスボム エクストリーム」
- prada-1: Prada「キャンディ」
- carolina-herrera-1: Carolina Herrera「バッドボーイ」
- parfums-de-marly-1: Parfums de Marly「レイトン」

Hermèsはブランド公式プレス資料、Calvin Klein CK oneは公式ギフトセット、Armaniは公式商品ページを参照し、購入リンクとしては表示していません。

## 6. 国内価格掲載商品

- chanel-1: Chanel「アリュール オム スポーツ」
- chanel-2: Chanel「エゴイスト プラチナム」
- dior-3: Dior「ソヴァージュ EDP」
- chanel-3: Chanel「チャンス オー タンドゥル」

日本公式で確認できた容量だけに円価格と価格確認日を保存しました。海外価格は円換算していません。

## 7. 容量のみの商品

- 4711-1: 4711「オーデコロン」
- guerlain-1: Guerlain「オー インペリアル」
- ck-1: CK「CK one」
- montblanc-1: Montblanc「レジェンド」
- azzaro-1: Azzaro「プール オム」
- nautica-1: Nautica「ヴォヤージュ」
- ysl-1: YSL「Y メン オーデパルファン」
- gucci-1: Gucci「ギルティ プールオム」
- gucci-2: Gucci「ブルーム」
- jo-malone-2: Jo Malone「イングリッシュ ペアー & フリージア」
- marc-jacobs-1: Marc Jacobs「デイジー」
- jo-malone-3: Jo Malone「ピオニー & ブラッシュ スエード」
- versace-2: Versace「ディラン ブルー」
- azzaro-2: Azzaro「クローム」
- thierry-mugler-1: Thierry Mugler「A*MEN」
- jean-paul-gaultier-1: Jean Paul Gaultier「ル マル」
- viktor-rolf-1: Viktor&Rolf「スパイスボム エクストリーム」
- prada-1: Prada「キャンディ」
- carolina-herrera-1: Carolina Herrera「バッドボーイ」
- parfums-de-marly-1: Parfums de Marly「レイトン」

## 8. 公式商品ページを確認できなかった商品

- atelier-cologne-1: Atelier Cologne「オランジュ サングィン」
- paco-rabanne-1: Paco Rabanne「プール オム」
- brut-1: Brut「クラシック」

推測URL、容量、濃度、価格は追加していません。

## 9. 楽天リンクの状態

- 楽天リンクあり: 26件
- 楽天リンクなし: 5件
- 既存URLとアフィリエイトパラメータは変更していません。
- product/search種別とリダイレクト結果は reports/fragrance-phase3-link-audit.csv に記録します。

## 10. 編集判断の根拠

- recommendedFor / notRecommendedFor は公式ノート・説明と既存の香調・シーン・季節・濃度だけを根拠にし、basis: editorial を付与しました。
- 年齢や性別による適性、人気、持続時間、拡散力は推測していません。
- cautionsは現行公式ページを確認できなかった3件だけに個別保存し、全件共通文は追加していません。

## 11. 修正した既存データ

- 発売年、香調、トップ、ミドル、ラスト、商品名、ブランド名の修正なし。
- slug、商品順、楽天URL、既存price文字列の修正なし。

## 12. 補完できなかった項目

- 公式商品ページ未確認3件: 濃度・容量・公式購入リンク・公式情報源。
- 国内参考価格: 27件は未掲載。
- Amazonリンク: 全31件で追加なし。
- profile数値: 全31件で未入力。

## 13. 情報源

- 公式情報源あり: 28件
- 公式情報源なし: 3件
- 詳細は reports/fragrance-phase3-sources.csv（28行）を参照。

## 14. 検証結果

- blocked: 28件
- manual_review: 2件
- ok: 15件
- redirect: 28件
- timeout: 6件

- JavaScript・JSON構文: OK
- 商品データ検証: OK（92件）
- 商品詳細生成: 92ページ
- トップ・ブランド・香調・シーン・季節ページ生成: OK
- ルート・slug・canonical・404: OK（154 canonical URL）
- 商品順: 変更なし
- 既存30件・後半31件の商品データ差分: 0件
- 対象31件の楽天URL差分: 0件
- 移行比較の84差分はすべて対象31件の補完フィールド・公式URL・出典URLで、対象外slugの差分: 0件
- profile数値入力: 0件
- git diff --check: OK

## 15. 後半31商品開始前の課題

- 現行公式ページがない旧作は、正規代理店・百貨店・正規取扱店まで調査範囲を広げるか判断が必要です。
- 国内公式価格を確認できない商品の既存price文字列は、構造化された参考価格として再利用していません。
- 楽天の商品同一性はHTTP結果だけで完全判定できないため、manual_review対象は公開前に目視確認が必要です。
- profile採点基準が確定するまで数値入力を停止します。
