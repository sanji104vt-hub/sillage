# Sillage 容量選択・一括実装引き継ぎ

作成日: 2026-09-28。未コミット・未デプロイ。精査は次のチャットで実施する。

## 結果

- 対象210商品、日本語210ページ・英語85ページへ共通UIを生成。
- 容量あり200商品（複数56、単一144）、根拠待ち10商品。
- 容量別購入先あり120商品、未登録90商品。一部の容量だけリンクがある商品も含む。
- 今回は76商品に142件のリンクを追加（公式63商品127容量、正式もしもHTML15商品15容量）。
- これまでのもしも容量別登録はJ-Scent23商品と今回15商品、計38商品。全商品にアフィリエイトリンクが揃ったという意味ではない。
- Bvlgari Man Wood Neroli 100mLを追加。公式ロシア向けページに製品・容量表示があるが、購入状態が不明確なため容量の出典としてのみ使用。

## 安全条件と精査の限界

既存サイズ出典URL＝公式購入URL、公式sourceがsizesを支持、市場と確認日あり、という条件に一致するものを一括登録。URL/ページタイトルが特定容量を示す場合はその容量だけに限定。確認日は元の値を維持し、本日再確認したように更新していない。公式サイトでも容量再選択が必要と表示。海外ページは市場・配送未確認を明示。

もしもは既存楽天URLと保存済み生成HTMLのURLが完全一致し、単一の香り・容量を指す15商品を登録。HTML・ハッシュ・インプレッションタグは保存原文のまま。SHIROの40/10mL混在ページ、AUX PARADISサボンの複数香りページは保留。

全販売先の最新の販売可否・在庫・容量セレクターの操作は未精査。既存の一般購入リンクは選択容量と連動させずその旨を明示。今回の一括処理は全商品の50/100mL販売リンクを完成させたものではない。

## 検証

全生成パイプライン成功、validate-*.mjs 17本成功、商品数・順序維持、商品データの差分はsizesのみ、既存商品購入リンク・説明・濃度・ノート等は変更なし。git diff --check成功、削除0件。

計測検証が購入ボタン上下2個を前提としていたため、容量別ボタンを区別して従来の共通ボタン2個を引き続き検証するよう修正。容量別HTML・選択/解除・原文保持はvalidate-size-picker.mjsで検証。

今回、詳細なブラウザ目視・実機・外部リンク全件アクセスは実施していない。次回は375/768/1024/1440px、キーボード、計測、容量とリンク先の一致、海外市場を優先する。

## 容量未確定の10商品

- gucci-3: 同一製品の公式容量資料を確定できず保留。検索で出たPour Femmeは別製品。
- gucci-4: 既存Parfumと公式EDP表記の整合を要確認。
- gucci-6: 既存EDTと現行Love Edition EDPの版が異なる。
- dunhill-1: 既存濃度未登録。Iconの製品同一性を先に確認。
- dunhill-2: Desire Gold/Black/Blueとの混同を避け、同一EDTの公式容量根拠待ち。
- hugo-boss-4: 既存Parfumと公式の商品名・濃度表記に矛盾。
- hugo-boss-5: 旧2015版と現行リフィル対応版の同一性未確定。
- narciso-rodriguez-2: 旧For Himの公式ページ・濃度確認待ち。
- paco-rabanne-3: 濃度未登録。既存楽天リンクにも要確認情報あり。
- acqua-di-parma-4: 旧Colonia Clubと現行C.L.U.Bを混同しないため保留。

## 次回の精査順序

1. 今回の追加リンクと正式生成HTMLの一致、濃度・容量の照合。
2. 下記の容量別未紐付け商品、海外公式・旧公式ページの販売可否。
3. 複数容量の切り替えと一般購入ボタンの区別、モバイル、日英表示。
4. 全検証を再実行してからコミット・公開の判断。精査前にpushしない。

## 全商品の現在値

「未紐付け」は容量別のリンクがないことを示す。商品共通リンクの有無とは別。

| 商品ID | 商品名 | 登録容量mL | 容量別公式 | 容量別楽天 | 未紐付け容量 |
| --- | --- | --- | --- | --- | --- |
| jo-malone-1 | ライムバジル & マンダリン | 30, 50, 100 | 30, 50, 100 | — | — |
| acqua-di-parma-1 | コロニア | 50, 100, 180 | 50, 100, 180 | — | — |
| dior-1 | オー ソバージュ | 50, 100 | 50, 100 | — | — |
| 4711-1 | オーデコロン | 50 | 50 | — | — |
| guerlain-1 | オー インペリアル | 100 | 100 | — | — |
| dolce-gabbana-1 | ライト ブルー プールオム | 50, 100 | — | — | 50, 100 |
| hermes-2 | オー ドランジュ ヴェルト | 200 | — | — | 200 |
| dior-2 | ソヴァージュ EDT | 60, 100 | 60, 100 | — | — |
| ck-1 | CK one | 200 | — | — | 200 |
| montblanc-1 | レジェンド | 30, 50, 100 | 100 | — | 30, 50 |
| azzaro-1 | プール オム | 30, 50, 100, 200 | 30, 50, 100, 200 | — | — |
| chanel-1 | アリュール オム スポーツ | 50, 100 | 50, 100 | — | — |
| paco-rabanne-1 | プール オム | 100 | — | — | 100 |
| nautica-1 | ヴォヤージュ | 100 | 100 | — | — |
| guerlain-2 | ヴェチバー | 100, 150 | 100, 150 | — | — |
| chanel-2 | エゴイスト プラチナム | 50, 100 | 50, 100 | — | — |
| gucci-1 | ギルティ プールオム | 90 | 90 | — | — |
| dior-3 | ソヴァージュ EDP | 30, 60, 100 | 30, 60, 100 | — | — |
| calvin-klein-1 | エタニティ フォーメン | 100 | — | — | 100 |
| ysl-2 | リブレ オーデパルファン | 10, 30, 50, 90, 150 | 10, 30, 50, 90, 150 | — | — |
| chanel-3 | チャンス オー タンドゥル | 35, 50, 100 | 35, 50, 100 | — | — |
| dior-4 | ジャドール | 30, 50, 100 | 30, 50, 100 | — | — |
| gucci-2 | ブルーム | 100 | 100 | — | — |
| gucci-3 | ギルティ アブソリュート プールオム | 保留 | — | — | — |
| gucci-4 | ギルティ エリクシール ドゥ パルファム プールオム | 保留 | — | — | — |
| gucci-5 | ギルティ プールオム オードパルファム | 90 | 90 | — | — |
| gucci-6 | ギルティ ラブ エディション プールオム | 保留 | — | — | — |
| jo-malone-2 | イングリッシュ ペアー & フリージア | 30, 50, 100 | 30, 50, 100 | — | — |
| marc-jacobs-1 | デイジー | 100 | 100 | — | — |
| jo-malone-3 | ピオニー & ブラッシュ スエード | 30, 50, 100 | 30, 50, 100 | — | — |
| versace-1 | エロス EDT | 50, 100 | 100 | — | 50 |
| versace-2 | ディラン ブルー | 50, 100, 200 | 50, 100, 200 | — | — |
| azzaro-2 | クローム | 50, 100, 200 | 50, 100, 200 | — | — |
| mugler-1 | エンジェル | 25, 50 | 25 | — | 50 |
| thierry-mugler-1 | A*MEN | 100 | 100 | — | — |
| giorgio-armani-1 | ストロンガー ウィズ ユー | 30, 50, 100 | — | — | 30, 50, 100 |
| viktor-rolf-1 | スパイスボム エクストリーム | 90 | 90 | — | — |
| prada-1 | キャンディ | 10, 30, 50, 80 | 10, 30, 50, 80 | — | — |
| carolina-herrera-1 | バッドボーイ | 50 | 50 | — | — |
| ysl-3 | ブラック オピウム | 10, 30, 50, 90, 150 | 10, 30, 50, 90, 150 | — | — |
| ysl-6 | MYSLF オーデパルファム | 60 | — | — | 60 |
| ysl-7 | MYSLF ルパルファム | 60 | — | — | 60 |
| ysl-8 | MYSLF ラブソリュ | 60 | — | — | 60 |
| ysl-9 | ラ ニュイ ド ロム | 60, 100, 200 | 60, 100, 200 | — | — |
| maison-margiela-1 | レプリカ ジャズクラブ | 10, 30, 100 | 10, 30, 100 | — | — |
| dior-5 | ソヴァージュ エリクシール | 60, 100, 150 | 60, 100, 150 | — | — |
| bvlgari-1 | マン イン ブラック | 100 | 100 | — | — |
| viktor-rolf-2 | スパイスボム | 90, 150 | 90, 150 | — | — |
| maison-francis-kurkdjian-1 | バカラ ルージュ 540 | 70 | 70 | — | — |
| maison-francis-kurkdjian-2 | アクア ユニヴェルサリス | 70 | — | — | 70 |
| maison-francis-kurkdjian-3 | アミリス プールオム | 70 | — | — | 70 |
| maison-francis-kurkdjian-4 | アクア ヴィタエ フォルテ | 70 | — | — | 70 |
| maison-francis-kurkdjian-5 | アクア セレスティア | 70 | — | — | 70 |
| maison-francis-kurkdjian-6 | アクア セレスティア コローニュ フォルテ | 70 | — | — | 70 |
| maison-francis-kurkdjian-7 | バカラ ルージュ 540 エキストレ ドゥ パルファム | 70 | — | — | 70 |
| versace-3 | エロス フレイム | 50, 100, 200 | 100 | — | 50, 200 |
| chanel-4 | ブルー ドゥ シャネル EDP | 50, 100 | 100 | — | 50 |
| tom-ford-2 | オード ウッド | 10, 30, 50, 100, 250 | 10, 30, 50, 100, 250 | — | — |
| dior-6 | ファーレンハイト | 50, 100 | 50, 100 | — | — |
| creed-1 | アバントゥス | 30, 50, 100, 240 | 30, 50, 100, 240 | — | — |
| creed-2 | グリーン アイリッシュ ツイード | 100 | — | — | 100 |
| creed-3 | シルバー マウンテン ウォーター | 100 | — | — | 100 |
| creed-4 | ヴァージン アイランド ウォーター | 100 | — | — | 100 |
| creed-5 | アバントゥス コロン | 50 | — | — | 50 |
| creed-6 | ミレジム インペリアル | 50 | — | — | 50 |
| creed-7 | ボワ ドゥ ポルトガル | 100 | — | — | 100 |
| giorgio-armani-2 | アルマーニ コード | 30, 50, 75, 125, 200 | — | — | 30, 50, 75, 125, 200 |
| le-labo-1 | サンタル 33 | 15, 50, 100 | 15, 50, 100 | — | — |
| diptyque-1 | タムダオ | 100 | 100 | — | — |
| diptyque-2 | オルフェオン | 75 | — | — | 75 |
| diptyque-3 | フィロシコス | 75 | — | — | 75 |
| diptyque-4 | ドソン | 75 | — | — | 75 |
| diptyque-5 | フルール ドゥ ポー | 75 | — | — | 75 |
| byredo-1 | ジプシー ウォーター | 50, 100 | 50, 100 | — | — |
| dunhill-1 | アイコン | 保留 | — | — | — |
| dunhill-2 | デザイア フォーメン | 保留 | — | — | — |
| prada-2 | ルオム | 100 | 100 | — | — |
| prada-3 | ルナロッサ カーボン | 100 | — | — | 100 |
| prada-4 | インフュージョン ディリス | 30 | — | — | 30 |
| prada-5 | ルナ ロッサ オーシャン | 100 | — | — | 100 |
| prada-6 | ルナ ロッサ ブラック | 50 | — | — | 50 |
| prada-7 | ルオム インテンス | 100 | 100 | — | — |
| montblanc-2 | エクスプローラー | 100 | 100 | — | — |
| jo-malone-4 | ウッドセージ & シーソルト | 30, 50, 100 | 30, 50, 100 | — | — |
| jo-malone-5 | ミルラ & トンカ | 50 | — | — | 50 |
| jo-malone-6 | ポメグラネート ノアール | 30, 100 | 30, 100 | — | — |
| hugo-boss-1 | ボス ボトルド | 100 | 100 | — | — |
| hugo-boss-2 | ボス ボトルド ナイト | 100 | — | — | 100 |
| hugo-boss-3 | ボス ボトルド インフィニット | 50 | — | — | 50 |
| hugo-boss-4 | ボス ボトルド エリクサー インテンス | 保留 | — | — | — |
| hugo-boss-5 | ボス ザ セント | 保留 | — | — | — |
| hugo-boss-6 | ヒューゴ マン | 75, 125 | 75, 125 | — | — |
| dior-7 | ディオール オム | 50, 100 | 50, 100 | — | — |
| tom-ford-3 | ブラック オーキッド | 10, 30, 50, 100, 150 | 10, 30, 50, 100, 150 | — | — |
| tom-ford-4 | ネロリ ポルトフィーノ | 50 | — | — | 50 |
| tom-ford-5 | ノワール エクストリーム | 50 | — | — | 50 |
| tom-ford-6 | グレー ヴェチバー | 100 | — | — | 100 |
| tom-ford-7 | タバコ バニラ | 50 | — | — | 50 |
| aramis-1 | アラミス | 110 | — | — | 110 |
| chanel-5 | プール ムッシュ | 100 | 100 | — | — |
| guerlain-3 | ミツコ | 75 | 75 | — | — |
| guerlain-4 | ロム イデアル エクストレム | 50, 100 | 50, 100 | — | — |
| guerlain-5 | アビ ルージュ | 50, 100, 150 | 50, 100, 150 | — | — |
| guerlain-6 | ゲラン オム | 100 | 100 | — | — |
| chanel-6 | アンテウス | 100 | 100 | — | — |
| shiro-1 | サボン オードパルファン | 40 | 40 | — | — |
| narciso-rodriguez-1 | フォー ハー | 100 | — | — | 100 |
| le-labo-2 | アナザー 13 | 15, 50, 100 | 15, 50, 100 | — | — |
| maison-margiela-2 | レイジー サンデー モーニング | 30 | 30 | — | — |
| maison-margiela-3 | レプリカ セーリング デイ | 100 | — | — | 100 |
| maison-margiela-4 | レプリカ ネバーエンディング サマー | 100 | — | — | 100 |
| maison-margiela-5 | バイ ザ ファイヤープレイス | 10, 30, 100 | 10, 30, 100 | — | — |
| maison-margiela-6 | ビーチ ウォーク | 10, 30, 100 | 10, 30, 100 | — | — |
| maison-margiela-7 | コーヒー ブレイク | 100 | 100 | — | — |
| narciso-rodriguez-2 | フォー ヒム | 保留 | — | — | — |
| glossier-1 | ユー | 50 | 50 | — | — |
| bvlgari-2 | ブルガリ プールオム | 50, 100 | 100 | — | 50 |
| aesop-1 | タシット | 50 | — | — | 50 |
| davidoff-1 | クール ウォーター | 125 | 125 | — | — |
| giorgio-armani-3 | アクア ディ ジオ | 100 | 100 | — | — |
| giorgio-armani-4 | ストロンガー ウィズ ユー インテンスリー | 10, 50, 100, 150 | 10, 50, 100, 150 | — | — |
| paco-rabanne-3 | インヴィクタス | 保留 | — | — | — |
| bvlgari-3 | アクア プールオム | 100 | — | — | 100 |
| bvlgari-4 | マン ウッド エッセンス | 100, 150 | 100, 150 | — | — |
| bvlgari-5 | マン レイン エッセンス | 60, 100, 150 | 60, 100, 150 | — | — |
| bvlgari-6 | マン ウッド ネロリ | 100 | — | — | 100 |
| versace-4 | プールオム | 50, 100, 200 | — | — | 50, 100, 200 |
| versace-5 | エロス エナジー | 50 | 50 | — | — |
| versace-6 | エロス パルファム | 100 | 100 | — | — |
| acqua-di-parma-2 | ブルー メディテラネオ アランチャ | 50, 100, 180 | 50, 100, 180 | — | — |
| acqua-di-parma-3 | コロニア インテンサ | 50, 100, 180 | 50, 100, 180 | — | — |
| acqua-di-parma-4 | コロニア クラブ | 保留 | — | — | — |
| acqua-di-parma-5 | ブルー メディテラネオ ベルガモット ディ カラブリア | 50, 100, 180 | 50, 100, 180 | — | — |
| loewe-1 | 001 マン | 50 | — | — | 50 |
| loewe-2 | エセンシア | 50 | — | — | 50 |
| loewe-3 | アグア エル クラシコ | 50 | — | — | 50 |
| loewe-4 | アグア ドロップ | 50 | — | — | 50 |
| loewe-5 | ソロ ロエベ セドロ | 50, 100 | 50, 100 | — | — |
| loewe-6 | アグア デ ロエベ エル | 50, 100 | 50, 100 | — | — |
| ralph-lauren-1 | サファリ フォーメン | 125 | — | — | 125 |
| ralph-lauren-2 | ポロ | 30 | — | — | 30 |
| ralph-lauren-3 | ポロ ブルー | 125 | — | — | 125 |
| ralph-lauren-4 | ポロ レッド | 125 | — | — | 125 |
| ralph-lauren-5 | ラルフズ クラブ | 50 | — | — | 50 |
| ralph-lauren-6 | ラルフズ クラブ パルファム | 50 | — | — | 50 |
| lacoste-l1212-blanc-edt-50 | オーデ ラコステ L.12.12 ブラン EDT 50mL | 50 | — | — | 50 |
| lacoste-l1212-blanc-edp-50 | オーデ ラコステ L.12.12 ブラン EDP 50mL | 50 | — | — | 50 |
| lacoste-l1212-blanc-eau-fraiche-edt-50 | オーデ ラコステ L.12.12 ブラン オーフレッシュ EDT 50mL | 50 | — | — | 50 |
| lacoste-l1212-blanc-eau-intense-edt-100 | オーデ ラコステ L.12.12 ブラン オーインテンス EDT 100mL | 100 | — | — | 100 |
| lacoste-5 | L.12.12 ノワール | 50, 100 | 50, 100 | — | — |
| j-scent-1 | ツタジュウ オードパルファン | 50 | — | 50 | — |
| j-scent-2 | 和肌 オードパルファン | 50 | — | 50 | — |
| j-scent-3 | ラムネ オードパルファン | 50 | — | 50 | — |
| j-scent-4 | 恋雨 オードパルファン | 50 | — | 50 | — |
| j-scent-5 | 花街 オードパルファン | 50 | — | 50 | — |
| j-scent-6 | 紙せっけん オードパルファン | 50 | — | 50 | — |
| j-scent-7 | ヒスイ オードパルファン | 50 | — | 50 | — |
| j-scent-8 | 珈琲 オードパルファン | 50 | — | 50 | — |
| j-scent-9 | 花見酒 オードパルファン | 50 | — | 50 | — |
| j-scent-10 | はちみつとレモン オードパルファン | 50 | — | 50 | — |
| j-scent-11 | 力士 オードパルファン | 50 | — | 50 | — |
| j-scent-12 | 光芒 オードパルファン | 50 | — | 50 | — |
| j-scent-13 | 紫陽花 オードパルファン | 50 | — | 50 | — |
| j-scent-14 | 入道雲 オードパルファン | 50 | — | 50 | — |
| j-scent-15 | 沈香 オードパルファン | 50 | — | 50 | — |
| j-scent-16 | 月雫 オードパルファン | 50 | — | 50 | — |
| j-scent-17 | うす紅 オードパルファン | 50 | — | 50 | — |
| j-scent-18 | ハンカチーフ オードパルファン | 50 | — | 50 | — |
| j-scent-19 | ほうじ茶 オードパルファン | 50 | — | 50 | — |
| j-scent-20 | 黒革 オードパルファン | 50 | — | 50 | — |
| j-scent-21 | 薄荷 オードパルファン | 50 | — | 50 | — |
| j-scent-22 | 木屑 オードパルファン | 50 | — | 50 | — |
| j-scent-23 | 落雁 オードパルファン | 50 | — | 50 | — |
| kitowa-1 | ヒノキ オー・エクロジオン | 50 | — | 50 | — |
| kitowa-2 | ヒバ オー・エクロジオン | 50 | — | 50 | — |
| kitowa-3 | モス・テンプル オー・エクロジオン | 50 | 50 | 50 | — |
| kitowa-4 | スギ オー・エクロジオン | 50 | 50 | 50 | — |
| shiro-2 | ホワイトティー オードパルファン | 40 | 40 | — | — |
| aux-paradis-1 | フルール オードパルファム | 15 | — | 15 | — |
| aux-paradis-2 | シトロン オードパルファム | 15 | — | 15 | — |
| aux-paradis-3 | オム オードパルファム | 15 | — | 15 | — |
| aux-paradis-4 | ピュア オードパルファム | 15 | — | 15 | — |
| aux-paradis-5 | フレーズ オードパルファム | 15 | — | 15 | — |
| aux-paradis-6 | サボン オードパルファム | 15 | — | — | 15 |
| aux-paradis-7 | ローズ オードパルファム | 15 | — | 15 | — |
| kitowa-5 | ヒノキ オードパルファム | 100 | — | 100 | — |
| kitowa-6 | ヒバ オードパルファム | 100 | — | 100 | — |
| kitowa-7 | クスノキ オードパルファム | 100 | — | 100 | — |
| kitowa-8 | サンダルウッド オー・エクロジオン | 50 | — | 50 | — |
| kitowa-9 | ウード オー・エクロジオン | 50 | — | 50 | — |
| cdg-2 | コンクリート | 80 | — | — | 80 |
| cdg-3 | オドゥール 71 | 200 | — | — | 200 |
| cdg-1 | ワンダーウッド | 100 | — | — | 100 |
| cdg-4 | CDG 2 MAN | 100 | — | — | 100 |
| cdg-5 | CDG 2 | 50 | — | — | 50 |
| cdg-6 | プレイ レッド | 100 | — | — | 100 |
| cdg-7 | コム デ ギャルソン オードパルファム | 50 | — | — | 50 |
| cdg-8 | マルセイユ | 50 | — | — | 50 |
| cdg-9 | ワンダーウード | 100 | — | — | 100 |
| cdg-10 | プレイ ブラック | 100 | — | — | 100 |
| cdg-11 | モノクル ヨヨギ | 50 | — | — | 50 |
| cdg-12 | アルテック スタンダード | 100 | — | — | 100 |
| cdg-13 | ホワイト | 50 | — | — | 50 |
| cdg-14 | モノクル センツ ワン ヒノキ | 50 | — | — | 50 |
| cdg-15 | CDG ドット | 100 | — | — | 100 |
| issey-miyake-1 | ロードゥ イッセイ プールオム オードトワレ | 125 | — | — | 125 |
| issey-miyake-2 | ロードゥ イッセイ プールオム オードパルファム | 125 | — | — | 125 |
| issey-miyake-3 | ロードゥ イッセイ プールオム オー＆シダー オードトワレ インテンス | 50 | — | — | 50 |
| issey-miyake-4 | ロードゥ イッセイ プールオム ウッド＆ウッド オードパルファム インテンス | 50 | — | — | 50 |
| issey-miyake-5 | ロードゥ イッセイ プールオム ソーラー ラベンダー オードトワレ インテンス | 50 | — | — | 50 |

## 今回の一括追加の記録

- jo-malone-1: official-existing-evidence; 30, 50, 100mL
- acqua-di-parma-1: official-existing-evidence; 50, 100, 180mL
- dior-1: official-existing-evidence; 50, 100mL
- 4711-1: official-existing-evidence; 50mL
- guerlain-1: official-existing-evidence; 100mL
- dior-2: official-existing-evidence; 60, 100mL
- montblanc-1: official-existing-evidence; 100mL
- azzaro-1: official-existing-evidence; 30, 50, 100, 200mL
- chanel-1: official-existing-evidence; 50, 100mL
- nautica-1: official-existing-evidence; 100mL
- guerlain-2: official-existing-evidence; 100, 150mL
- chanel-2: official-existing-evidence; 50, 100mL
- gucci-1: official-existing-evidence; 90mL
- dior-3: official-existing-evidence; 30, 60, 100mL
- ysl-2: official-existing-evidence; 10, 30, 50, 90, 150mL
- chanel-3: official-existing-evidence; 35, 50, 100mL
- dior-4: official-existing-evidence; 30, 50, 100mL
- gucci-2: official-existing-evidence; 100mL
- jo-malone-2: official-existing-evidence; 30, 50, 100mL
- marc-jacobs-1: official-existing-evidence; 100mL
- jo-malone-3: official-existing-evidence; 30, 50, 100mL
- versace-1: official-existing-evidence; 100mL
- versace-2: official-existing-evidence; 50, 100, 200mL
- azzaro-2: official-existing-evidence; 50, 100, 200mL
- mugler-1: official-existing-evidence; 25mL
- thierry-mugler-1: official-existing-evidence; 100mL
- viktor-rolf-1: official-existing-evidence; 90mL
- prada-1: official-existing-evidence; 10, 30, 50, 80mL
- carolina-herrera-1: official-existing-evidence; 50mL
- ysl-3: official-existing-evidence; 10, 30, 50, 90, 150mL
- maison-margiela-1: official-existing-evidence; 10, 30, 100mL
- dior-5: official-existing-evidence; 60, 100, 150mL
- bvlgari-1: official-existing-evidence; 100mL
- viktor-rolf-2: official-existing-evidence; 90, 150mL
- maison-francis-kurkdjian-1: official-existing-evidence; 70mL
- versace-3: official-existing-evidence; 100mL
- chanel-4: official-existing-evidence; 100mL
- tom-ford-2: official-existing-evidence; 10, 30, 50, 100, 250mL
- dior-6: official-existing-evidence; 50, 100mL
- creed-1: official-existing-evidence; 30, 50, 100, 240mL
- le-labo-1: official-existing-evidence; 15, 50, 100mL
- diptyque-1: official-existing-evidence; 100mL
- byredo-1: official-existing-evidence; 50, 100mL
- prada-2: official-existing-evidence; 100mL
- montblanc-2: official-existing-evidence; 100mL
- jo-malone-4: official-existing-evidence; 30, 50, 100mL
- hugo-boss-1: official-existing-evidence; 100mL
- dior-7: official-existing-evidence; 50, 100mL
- tom-ford-3: official-existing-evidence; 10, 30, 50, 100, 150mL
- chanel-5: official-existing-evidence; 100mL
- guerlain-3: official-existing-evidence; 75mL
- chanel-6: official-existing-evidence; 100mL
- shiro-1: official-existing-evidence; 40mL
- le-labo-2: official-existing-evidence; 15, 50, 100mL
- maison-margiela-2: official-existing-evidence; 30mL
- glossier-1: official-existing-evidence; 50mL
- bvlgari-2: official-existing-evidence; 100mL
- davidoff-1: official-existing-evidence; 125mL
- giorgio-armani-3: official-existing-evidence; 100mL
- acqua-di-parma-2: official-existing-evidence; 50, 100, 180mL
- kitowa-3: official-existing-evidence; 50mL
- kitowa-4: official-existing-evidence; 50mL
- shiro-2: official-existing-evidence; 40mL
- kitowa-1: moshimo-archive-exact-match; 50mL
- kitowa-2: moshimo-archive-exact-match; 50mL
- kitowa-3: moshimo-archive-exact-match; 50mL
- kitowa-4: moshimo-archive-exact-match; 50mL
- aux-paradis-1: moshimo-archive-exact-match; 15mL
- aux-paradis-2: moshimo-archive-exact-match; 15mL
- aux-paradis-3: moshimo-archive-exact-match; 15mL
- aux-paradis-4: moshimo-archive-exact-match; 15mL
- aux-paradis-5: moshimo-archive-exact-match; 15mL
- aux-paradis-7: moshimo-archive-exact-match; 15mL
- kitowa-5: moshimo-archive-exact-match; 100mL
- kitowa-6: moshimo-archive-exact-match; 100mL
- kitowa-7: moshimo-archive-exact-match; 100mL
- kitowa-8: moshimo-archive-exact-match; 50mL
- kitowa-9: moshimo-archive-exact-match; 50mL

## 根拠を追加した公式ページ

[Bvlgari Man Wood Neroli 100mL（ロシア公式）](https://www.bulgari.com/ru-ru/%D0%B0%D1%80%D0%BE%D0%BC%D0%B0%D1%82%D1%8B/%D0%BC%D1%83%D0%B6%D1%81%D0%BA%D0%B8%D0%B5/40389.html?ratings=true&swatches=true)
