# Sillage Phase 1.5 京都香水店監査

- 確認日: 2026-08-24
- 対象データ: `data/kyoto-shops.json`
- データ件数: 18
- 削除対象: 0
- 重複削除対象: 0

## 判定方針

ブランド・店舗運営元・百貨店の公式ページを優先した。百貨店本体の香水売場と、同じ館内の独立ブランド／セレクトカウンターは役割が異なるため、別の掲載対象として維持した。住所が同じという理由だけでは重複扱いしていない。

## 18件の確認結果

| # | slug | 掲載名 | 状態 | 主な確認先 |
|---:|---|---|---|---|
| 1 | my-only-fragrance-teramachi | My Only Fragrance TERAMACHI | 掲載継続 | https://myonlyfragrance.com/shops/ |
| 2 | my-only-fragrance-kiyomizu | My Only Fragrance KIYOMIZU | 掲載継続 | https://myonlyfragrance.com/shops/ |
| 3 | my-only-fragrance-kawaramachi | MY ONLY FRAGRANCE KAWARAMACHI | 掲載継続 | https://myonlyfragrance.com/shops/ |
| 4 | cabinet | CABINET | 掲載継続 | https://prtimes.jp/main/html/rd/p/000000001.000181384.html |
| 5 | flavor-design-store | THE FLAVOR DESIGN STORE "KYOTO" | 掲載継続 | https://www.theflavordesign.com/store/kyoto/ |
| 6 | sholayered | SHOLAYERED 京都三条店 | 掲載継続 | https://sholayered.jp/pages/stores |
| 7 | le-sillage-fragrance-shop | LE SILLAGE FRAGRANCE SHOP KYOTO | 掲載継続 | https://lesillage-kyoto.shop/pages/about |
| 8 | le-labo-shinpuhkan | LE LABO Kyoto Shinpuhkan | 掲載継続 | https://www.lelabofragrances.jp/pages/locations |
| 9 | le-labo-machiya | LE LABO KYOTO MACHIYA | 掲載継続 | https://www.lelabofragrances.jp/pages/lelabo-kyoto-machiya |
| 10 | 201lab-platform | 201LAB PLATFORM KYOTO | 掲載継続 | https://www.artlab.co.jp/shop/shop201lab |
| 11 | jr-kyoto-isetan-latelier | ラトリエ デ パルファム JR京都伊勢丹 | 掲載継続 | https://www.mistore.jp/store/kyoto/shops/beauty/cosmetics2f.html |
| 12 | jr-kyoto-isetan | JR京都伊勢丹 | 掲載継続 | https://www.mistore.jp/store/kyoto/shops/beauty/cosmetics2f.html |
| 13 | jomalone-takashimaya | JO MALONE LONDON 京都高島屋店 | 掲載継続 | https://www.takashimaya.co.jp/kyoto/departmentstore/cosmenews/p01.html |
| 14 | latelier-des-parfums-takashimaya | ラトリエ デ パルファム 京都高島屋 | 掲載継続 | https://www.takashimaya.co.jp/kyoto/departmentstore/cosmenews/p01.html |
| 15 | daimaru-kyoto | 大丸京都店 | 掲載継続 | https://www.daimaru.co.jp/kyoto/ |
| 16 | shiro-daimaru | SHIRO 大丸京都店 | 掲載継続 | https://shiro-shiro.jp/ec/ext/shop/daimaru-kyoto/index.html |
| 17 | kyoto-takashimaya | 京都高島屋 | 掲載継続 | https://www.takashimaya.co.jp/kyoto/departmentstore/sys_access.html |
| 18 | your-musk-johns-blend | Your Musk John's Blend Kyoto 錦市場店 | 掲載継続 | https://www.johns-blend.com/f/store |

## 明確な根拠に基づいて修正した事項

- 17店の固定文言を、店舗データ件数から算出する18店表記へ変更。
- MY ONLY FRAGRANCE清水店の営業時間を公式案内へ一致。
- THE FLAVOR DESIGN京都店の町名表記を公式住所へ一致。
- LE SILLAGEの町名と定休日を公式案内へ一致。
- LE LABO KYOTO MACHIYAの住所を公式店舗一覧へ一致。
- ラトリエ デ パルファムの綴りとJR京都伊勢丹の階を公式売場案内へ一致。
- 京都高島屋の住所・営業時間を2026年8月1日以降の公式案内へ一致。
- 201LABの説明をART LAB.公式の取扱内容へ修正。

## 件数の扱い

JR京都伊勢丹、京都高島屋、大丸京都店では、百貨店の総合香水売場と館内の専門カウンターを別レコードとしている。物理的な建物は同じだが、ユーザーが比較できる売場・ブランドカウンターとして別の役割を持つため18件を維持する。
