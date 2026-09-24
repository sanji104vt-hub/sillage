# コム デ ギャルソン13種 デプロイ報告

デプロイ日: 2026-09-24 ／ コミット: `9d1bbdf` ／ 結果: success

前回取得した公式香料一覧（`reports/cdg-official-ingredients.md`）を元に13種を投入した。
ZERO（公式に列挙なし）と Dia x Meg Webster（公式サイトに商品なし）は見送り。

## 1. 商品数とブランド

| 項目 | 前 | 後 |
|---|---|---|
| 日本語版 商品 | 192 | **205** |
| コム デ ギャルソン | 2種 | **15種** |
| 英語版 商品 | 67 | **80** |
| ブランド | 45 | 45（既存のため変更なし） |

内訳は keyNotes 14件 / 3層 1件（CDG DOT のみ）。

商品ページ15件すべて本番で 200。英語版 80商品も全件 200。

## 2. 投入した13件

| slug | 掲載名 | 形式 | 濃度 | 価格 | 容量 | priceSource | englishSlug |
|---|---|---|---|---|---|---|---|
| `cdg-1` | ワンダーウッド | keyNotes | オードパルファン | ¥24,200 | 100ml | rakuten | `wonderwood-eau-de-parfum` |
| `cdg-4` | CDG 2 MAN | keyNotes | オードトワレ | ¥24,200 | 100ml | rakuten | `cdg2-man-eau-de-toilette` |
| `cdg-5` | CDG 2 | keyNotes | オードパルファン | ¥18,700 | 50ml | rakuten | `cdg-2-eau-de-parfum` |
| `cdg-6` | プレイ レッド | keyNotes | オードトワレ | ¥20,900 | 100ml | rakuten | `play-red-eau-de-toilette` |
| `cdg-7` | コム デ ギャルソン オードパルファム | keyNotes | オードパルファン | ¥18,700 | 50ml | rakuten | `eau-de-parfum-eau-de-parfum` |
| `cdg-8` | マルセイユ | keyNotes | オードトワレ | ¥19,800 | 50ml | rakuten | `marseille-eau-de-toilette` |
| `cdg-9` | ワンダーウード | keyNotes | オードパルファン | ¥24,200前後 | — | manual | `wonderoud-eau-de-parfum` |
| `cdg-10` | プレイ ブラック | keyNotes | オードトワレ | ¥20,900 | 100ml | rakuten | `play-black-eau-de-toilette` |
| `cdg-11` | モノクル ヨヨギ | keyNotes | オードトワレ | ¥19,800 | 50ml | rakuten | `monocle-yoyogi-eau-de-toilette` |
| `cdg-12` | アルテック スタンダード | keyNotes | オードパルファン | ¥19,800 | 100ml | rakuten | `artek-standard-eau-de-parfum` |
| `cdg-13` | ホワイト | keyNotes | オードトワレ | ¥20,900 | 50ml | rakuten | `white-eau-de-toilette` |
| `cdg-14` | モノクル センツ ワン ヒノキ | keyNotes | オードトワレ | ¥19,800 | 50ml | rakuten | `monocle-scent-one-hinoki-eau-de-toilette` |
| `cdg-15` | CDG ドット | 3層 | オードパルファン | ¥24,200 | 100ml | rakuten | `cdg-dot-eau-de-parfum` |

## 3. 楽天APIの実測値（itemName）

デプロイ後に再取得したもの。a_id=5718841、除外語0件、画像の出店者とリンク先の一致を全件確認済み。

**`cdg-1`** ¥24,200

> 【COMME des GARCONS PARFUMS / コムデギャルソンパルファム】コムデギャルソン香水 人気NO.1 (ワンダーウッド)Wonderwood Eau de Parfum (natural spray)100ml☆再入荷！

**`cdg-4`** ¥24,200

> 【COMME des GARCONS PARFUMS / コムデギャルソンパルファム】コムデギャルソン香水 CDG 2 MAN Eau de Toilette (natural spray)100ml

**`cdg-5`** ¥18,700

> 【COMME des GARCONS PARFUMS / コムデギャルソンパルファム】コムデギャルソン香水 CDG 2 (ツー) 墨,お香 Eau de Parfum (natural spray)50ml☆再入荷！

**`cdg-6`** ¥20,900

> 【COMME des GARCONS PARFUMS / コムデギャルソンパルファム】コムデギャルソン香水 （プレイ レッド）RED PLAY Eau de Toilette (100ml natural spray)

**`cdg-7`** ¥18,700

> 【COMME des GARCONS PARFUMS / コムデギャルソンパルファム】コムデギャルソン香水（オードパルファム） Eau de Parfum (50ml natural spray)☆再入荷！

**`cdg-8`** ¥19,800

> 【COMME des GARCONS PARFUMS / コムデギャルソンパルファム】コムデギャルソン香水（マルセイユ） MARSEILLE - EAU DE TOILETTE 50ml (BZ-N004-051)☆再入荷！

**`cdg-9`** ¥24,200

> 【COMME des GARCONS PARFUMS / コムデギャルソンパルファム】コムデギャルソン香水（ワンダーウード）Wonderoud Eau de Parfum (natural spray)☆再入荷！

**`cdg-10`** ¥20,900

> 【COMME des GARCONS PARFUMS / コムデギャルソンパルファム】コムデギャルソン 香水 プレイブラック Play Black Eau de Toilette (100ml Natural spray)

**`cdg-11`** ¥19,800

> 【COMME des GARCONS PARFUMS / コムデギャルソンパルファム】コムデギャルソン 香水 (モノクルヨヨギ) 代々木公園 Monocle Yoyogi 50ml

**`cdg-12`** ¥19,800

> 【COMME des GARCONS PARFUMS / コムデギャルソンパルファム】コムデギャルソン 香水（アルテックスタンダード） CDG PARFUM Artek Standard Eau de Parfum (100ml)☆再入荷！

**`cdg-13`** ¥20,900

> 【COMME des GARCONS PARFUMS / コムデギャルソンパルファム】コムデギャルソン 香水 （ホワイトオードトワレ） White Eau de Toilette 50ml natural spray☆再入荷！

**`cdg-14`** ¥19,800

> 【COMME des GARCONS PARFUMS / コムデギャルソンパルファム】コムデギャルソン 香水 （モノクルヒノキ） Monocle Scent One Hinoki Eau de Toilette 50ml☆再入荷！

**`cdg-15`** ¥24,200

> 【COMME des GARCONS PARFUMS / コムデギャルソンパルファム】コムデギャルソン香水 CDG DOT Eau de Parfum 100ml☆再入荷！


## 4. cdg-11（モノクル ヨヨギ）の濃度

**EDT で正しいことを確認した。**

楽天の itemName は `Monocle Yoyogi 50ml` のみで濃度表記がなく、公式ページにも記載がない。
そこで同じ商品の別出品を検索したところ、2件が濃度を明示していた。

> EDT ¥20,583　コムデギャルソン モノクル ヨヨギ オードトワレ 50ml COMME DES GARCONS MONOCLE YOYOGI EDT
>
> EDT ¥36,300　コムデギャルソン 香水 … モノクル セント フォー ヨヨギ EDT・SP 50ml

仮置きの EDT が裏付けられたため、`englishSlug` も `monocle-yoyogi-eau-de-toilette` のままとした。

## 5. 表示の確認

### cdg-15（CDG DOT）は3層

公式が Top / Mid / Bottom を明記している唯一の商品。既存の `top` / `mid` / `last` に入れた。

| | 表示 |
|---|---|
| 日本語 | 見出し「香りの時間変化」／ 3段 |
| 英語 | `Scent over time` |

### keyNotes 14件は「主な香料」

| | 表示 |
|---|---|
| 日本語 | 見出し「主な香料」＋「ブランドはトップ・ミドル・ラストの区分を公表していません」 |
| 英語 | `Key notes` ＋ `The brand does not assign notes to top, middle and base.` |

本番の商品ページ15件で「主な香料」14件 / 「香りの時間変化」1件。

### トップページ

本番で実測。

    カード 205枚 / undefined 0件 / 「主な香料」ラベル 14件 / 注記 14件
    コンソールエラー 0件

## 6. 香りの旅

**エラーなし。** 本番のトップページでコンソールエラー0件、`#scrolly` と `#pyrTop` も存在する。

なお「前回入れた空集合ガード」について訂正する。**そのガードは実装していない。**
`buildNotesPanel` が商品一覧から選ばず `KASO_FEATURED`（`dior-2`）をハードコード
しているため、keyNotes の商品が入る経路がなく、除外も空集合も構造的に起きないため。
今回13件増えても同じで、実機でも問題は出ていない。

将来この関数を動的選定に変える場合は、そのときガードが必要になる。

## 7. 日英の語数照合

**不一致0件。** CDG 15件で17箇所（keyNotes 14件＋3層1件×3層）を照合。

バリデータ16本すべて合格、削除ファイル0件。

## 8. 途中で対応した2点

### cdg-9（ワンダーウード）は実売価格を採用していない

楽天の itemName が `Wonderoud Eau de Parfum (natural spray)` のみで容量表記がなく、
掲載 sizes（100mL）と照合できない。`priceSizeUnknown` が立つ安全側の挙動が正しく働いた。
価格帯だけは示せるよう `¥24,200前後` の手入力扱いとした。

正しい容量が分かる出品に差し替えれば実売価格に切り替わる。

### verifiedAt / updatedAt が未設定だった

13件とも入っておらず、バリデータが検出した。2026-09-24 を設定している。

## 9. 確認事項への回答

**sizes[].sourceUrl に公式限定の検査は無い。** `validate-fragrances.mjs` は URL の形式のみを
見ており、楽天URLでも通る。公式に容量情報が無いための措置として妥当。

**原文から手を入れた4箇所**（cdg-5 の余分なカンマ、cdg-8 の括弧内カンマ、制作クレジットの除去、
sourceUrl の楽天URL化）は、いずれも事実を変えておらず語数照合も通っている。

## 10. 基準値の更新

  - `validate-fragrances.mjs` … `ENRICHED_SLUGS` を cdg-1..15 に拡張
  - `validate-i18n.mjs` … 商品 192→205 / 英語対訳の許容範囲 65-75→80-92

ブランド数は既存のため変更していない。
