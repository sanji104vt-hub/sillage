# Sillage 編集部試香メモの記録基準

このファイルは、公開情報では作れない実使用データを、推測せず同じ条件で記録するための基準です。

## 入力先

`data/fragrance-trials.json` の `trials` 配列へ、試香を完了した商品だけを追加します。途中の記録や未確認項目を、推測文や「不明」で埋めないでください。

## 1商品分の形式

```json
{
  "slug": "既存の商品slug",
  "testedAt": "YYYY-MM-DD",
  "place": "試香した場所",
  "medium": "skin",
  "application": "手首に1プッシュ",
  "temperatureC": 27,
  "after30Minutes": "実際に観察した内容",
  "after3Hours": "実際に観察した内容",
  "nextDay": "翌日に残ったかの実測結果",
  "oneMeter": "周囲約1mで感じたかの実測結果",
  "onClothing": "服への残り方の実測結果",
  "editorPreference": "編集者の好みとしての所感"
}
```

`medium` は `skin`（肌）、`blotter`（ムエット）、`both`（両方）のいずれかです。

## 記録ルール

- 30分後・3時間後・翌日の各時点を実際に確認する。
- 気温は試香時に確認できた値だけを整数で記録する。
- 香りの強さや残り方を、公式スペックのように断定しない。
- 編集者の好みは、観察事実と分けて記録する。
- 商品提供を受けた場合は、このデータとは別にページ上の広告・提供表示を追加する。
- 同じ商品を再試香した場合は、既存記録を上書きせず運用方針を決めてからスキーマを拡張する。

入力後は次を実行します。

```text
node validate-fragrance-trials.mjs
node build-items.mjs
node validate-fragrance-trials.mjs
```
