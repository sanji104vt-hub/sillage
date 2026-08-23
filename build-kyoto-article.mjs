// Sillage の京都香水店ガイド記事(/columns/kyoto-fragrance-shops)を生成する。
// 通常のコラムは build-columns.mjs の固定スキーマ(visual/takeaways/table/choices...)を
// 前提にしているが、この記事は「地域ガイド」という性質上そのスキーマに収まらないため
// 単発の静的HTMLとして author する。既存33コラムには一切触らない。
//
// 実行: node build-kyoto-article.mjs
// 生成物: public/columns/kyoto-fragrance-shops.html
//
// build-internal-links.mjs / generate-seo.mjs / enhance-static-seo.mjs はいずれも
// public/columns/ をディレクトリ走査するため、この記事は自動でインデックス・sitemap・
// 全記事一覧に組み込まれる。

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SHOPS = JSON.parse(readFileSync(join("data", "kyoto-shops.json"), "utf8")).kyoto_fragrance_shops;
const FRAGRANCE_COUNT = JSON.parse(readFileSync(join("data", "fragrances.json"), "utf8")).fragrances.length;
const BRAND_COUNT = JSON.parse(readFileSync(join("data", "brands.json"), "utf8")).length;
const SITE_COPY = JSON.parse(readFileSync(join("data", "site-copy.json"), "utf8"));
const SITE = SITE_COPY.siteUrl.replace(/\/$/, "");
const SLUG = "kyoto-fragrance-shops";
const CANONICAL = `${SITE}/columns/${SLUG}`;
const SHOP_COUNT = SHOPS.length;
const TITLE = `京都で香水を選ぶ：デパートから町屋、寺町までの${SHOP_COUNT}店ガイド`;
const DESCRIPTION = `京都の香水店${SHOP_COUNT}店を、カスタム調合・セレクトショップ・百貨店・和の香りに分けてSillage編集部がキュレーション。地図と実測データつき。`;
const PUBLISHED = "2026-08-01T09:00:00+09:00";
const MODIFIED = "2026-08-01T09:00:00+09:00";
const OGP_IMAGE = `${SITE}/ogp-default.png`;

// 記事内で言及される店舗と、shops.json のslugの対応。1つの見出しに複数店舗が
// 含まれるケース(My Only 3店、Le Labo 2店、高島屋2ブランド、大丸2エントリ、伊勢丹2エントリ)
// があるため、見出しごとにマッピングする。
const shop = (slug) => SHOPS.find((s) => s.slug === slug);

function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
}
function shopInfo(s) {
  if (!s) return "";
  const closed = s.closed ? `<span class="shop-info-item">定休：${esc(s.closed)}</span>` : "";
  return `<div class="shop-info">
      <span class="shop-info-item">📍 ${esc(s.address)}</span>
      <span class="shop-info-item">🕐 ${esc(s.hours)}</span>
      ${closed}
      <span class="shop-info-item"><a href="${esc(s.google_maps_url)}" target="_blank" rel="noopener">Google Mapsで開く ↗</a></span>
    </div>`;
}
function multiShopInfo(slugs) {
  return slugs.map((slug) => {
    const s = shop(slug);
    if (!s) return "";
    return `<div class="shop-info">
      <span class="shop-info-item shop-info-name">${esc(s.name)}</span>
      <span class="shop-info-item">📍 ${esc(s.address)}</span>
      <span class="shop-info-item">🕐 ${esc(s.hours)}${s.closed ? `／定休：${esc(s.closed)}` : ""}</span>
      <span class="shop-info-item"><a href="${esc(s.google_maps_url)}" target="_blank" rel="noopener">Google Mapsで開く ↗</a></span>
    </div>`;
  }).join("");
}

// 京都中心部を映す地図。output=embed は Google Maps の伝統的な埋め込み方式で、
// APIキー不要かつ即座に動作する。カスタムピンは打てないため、下に全店リストを添える。
const MAP_QUERY = "京都+香水+フレグランス";
const MAP_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&ll=35.003,135.767&z=14&output=embed`;

// 関連記事8本(README指定)
const RELATED = [
  { slug: "business-fragrance", title: "職場の香水は何プッシュ？迷惑にならない選び方とつけ方", cat: "シーン・季節" },
  { slug: "season-scene-map", title: "季節×シーンで選ぶメンズ香水マップ", cat: "シーン・季節" },
  { slug: "summer-perfume-strong", title: "夏に香水が強く感じる理由と選び方", cat: "シーン・季節" },
  { slug: "how-to-test-perfume", title: "香水を店頭で試す方法｜ムエットと肌の正しい使い分け", cat: "購入・試香" },
  { slug: "perfume-store-comparison", title: "店頭で香水を比較する順番", cat: "購入・試香" },
  { slug: "perfume-gift-guide", title: "香水をプレゼントする時の選び方｜失敗しにくい7つの確認", cat: "購入・試香" },
  { slug: "first-fragrance", title: "香水初心者の一本目｜失敗しない5ステップ", cat: "香水初心者" },
  { slug: "concentration-guide", title: "EDT・EDP・パルファムの違い｜濃度だけで選ばない香水入門", cat: "香りの知識" },
];

const FAQ = [
  { q: "カスタム香水と既製の香水、初めての香水選びはどちらから？", a: "初めての香水選びの場合、まずは既製の定番から始めることをお勧めします。デパートで自分の系統を知ってから、カスタムで「その系統の自分バージョン」を作る流れが、遠回りに見えて実は最短です。Sillageの診断で系統を絞ってから、デパートで実物確認→カスタムで1本作る、の順序が理想的です。" },
  { q: "京都で1店だけ回るとしたら、どこを選ぶべき？", a: "目的で変わります。旅の記念に何か持ち帰りたいなら「THE FLAVOR DESIGN STORE 京都(清水)」、本気で1本探したいなら「LE SILLAGE FRAGRANCE SHOP KYOTO」、確実に定番ブランドを試したいなら「京都高島屋」。どれも徒歩+バスで移動可能な範囲にあります。" },
  { q: "Le Labo 京都は2店舗ありますが、どちらに行くべき？", a: "一般的には「LE LABO Kyoto Shinpuhkan(新風館店)」が実用的です。待ち時間が短く、商品を確実に買えます。「町屋の空間+抹茶カフェの体験」自体が目的なら「LE LABO KYOTO MACHIYA」を予約推奨です。" },
  { q: "京都の香水店の営業時間の特徴は？", a: "デパート内店舗は10:00〜20:00が基本。セレクトショップ・カスタム店は11:00〜19:00の店が多く、朝早くの回避が確実です。清水寺エリアの店は観光時間に合わせて10:30オープンが標準です。" },
  { q: "予約は必要ですか？", a: "カスタム調合店(My Only Fragrance、CABINET、THE FLAVOR DESIGN STORE等)は週末は予約推奨です。特に外国語対応スタッフを希望する場合は事前予約が確実です。セレクトショップとデパートは基本予約不要です。" },
];

const articleLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  url: CANONICAL,
  mainEntityOfPage: CANONICAL,
  author: { "@type": "Organization", name: `${SITE_COPY.shortName}編集部`, url: `${SITE}/about.html#update-policy` },
  publisher: { "@type": "Organization", name: SITE_COPY.shortName },
  inLanguage: "ja",
  datePublished: PUBLISHED,
  dateModified: MODIFIED,
  image: OGP_IMAGE,
};
const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Sillage", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "香水コラム", item: `${SITE}/guides.html` },
    { "@type": "ListItem", position: 3, name: TITLE, item: CANONICAL },
  ],
};
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
};
const itemListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "京都市内の香水店・香水を扱う店舗一覧",
  numberOfItems: SHOPS.length,
  itemListElement: SHOPS.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Place",
      name: s.name,
      address: s.address,
      geo: { "@type": "GeoCoordinates", latitude: s.latitude, longitude: s.longitude },
      url: s.google_maps_url,
    },
  })),
};

// 既存コラムのCSSはインラインだが、この記事では追加のブロック用CSSだけを差分として持つ。
// クラス名は既存33コラムと衝突しないよう .shop-info / .kyoto-map-embed / .shop-map-list を新設。
const EXTRA_CSS = `.shop-info{display:flex;flex-wrap:wrap;gap:8px 14px;margin:12px 0 22px;padding:12px 16px;background:#141519;border:1px solid #2d2e33;border-left:2px solid #c9b558;border-radius:0 8px 8px 0;font-size:12.5px;line-height:1.6}
.shop-info-item{color:#bdbbb7}
.shop-info-name{font:500 13px "Shippori Mincho",serif;color:#f0ede8;width:100%;margin-bottom:2px}
.shop-info a{color:#c9b558;text-decoration:none;border-bottom:1px solid rgba(201,181,88,.4)}
.shop-info a:hover{border-bottom-color:#c9b558}
.kyoto-map-embed{margin:24px 0 12px;border:1px solid #34353a;border-radius:12px;overflow:hidden;background:#15161a}
.kyoto-map-embed iframe{display:block;width:100%;height:480px;border:0}
.kyoto-map-note{font-size:12px;color:#8c8c92;margin:8px 0 20px;line-height:1.8}
.shop-map-list{list-style:none;padding:0;margin:20px 0 32px;display:grid;grid-template-columns:1fr;gap:1px;background:#303137;border:1px solid #303137;border-radius:6px;overflow:hidden}
.shop-map-list li{background:#15161a;padding:14px 18px;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:baseline;font-size:13px;line-height:1.7}
.shop-map-list li strong{font:500 14px "Shippori Mincho",serif;color:#f0ede8}
.shop-map-list li .shop-addr{color:#8c8c92;font-size:12px}
.shop-map-list li a{margin-left:auto;color:#c9b558;text-decoration:none;font:12px "Bodoni Moda",serif;letter-spacing:.5px;white-space:nowrap}
.shop-map-list li a:hover{text-decoration:underline}
.editorial-eeat{margin:36px 0 8px;padding:18px 20px;background:#141519;border:1px solid #2d2e33;border-radius:8px;font-size:12.5px;line-height:1.9;color:#a8a6a1}
@media(min-width:720px){.shop-map-list{grid-template-columns:1fr 1fr}}
@media(max-width:680px){.kyoto-map-embed iframe{height:360px}.shop-map-list li{flex-direction:column;gap:4px}.shop-map-list li a{margin-left:0}}`;

// 本文のセクション。各章の紹介文と、対応する shops.json の店舗を組み合わせる。
const SECTIONS = [
  {
    id: "custom",
    title: "1. 自分だけの1本を作る：カスタム香水の店",
    intro: [
      "京都の香水シーンで最も特徴的なのは、「その場で調合する体験型店舗」の豊富さです。海外からの旅行者に人気が高く、平日でも予約が埋まっている店が多い傾向があります。「香水を買う」というより「香水を作る」時間を楽しみたい人に向いています。",
    ],
    shops: [
      {
        heading: "My Only Fragrance【寺町・清水・河原町の3店舗】",
        paragraphs: [
          "京都のカスタム香水店として、口コミ数だけを見れば圧倒的な規模を持つチェーンで、寺町（TERAMACHI）・清水（KIYOMIZU）・河原町（KAWARAMACHI）の3ヶ所に店舗を展開しています。合わせて口コミ4万件を超えるとGoogle Mapsで確認できます。",
          "いずれの店舗もスタッフが英語対応可能で、旅行者の多さが際立つ一方、プロセス自体は落ち着いていて、ノートを1つずつ試しながら、50mlの自分だけの香りを2時間ほどで仕上げる流れが基本のようです。",
        ],
        info: multiShopInfo(["my-only-fragrance-teramachi", "my-only-fragrance-kiyomizu", "my-only-fragrance-kawaramachi"]),
        readerNote: "診断結果で「シトラス寄りだけどややグルマン気味」のような曖昧な系統が出た人は、既製の香水では満たされにくい。その“間”を自分の手で作れるのがカスタム調合の魅力。8,000〜9,500円で100ml、コスパも良いという口コミが多く見られます。",
      },
      {
        heading: "CABINET（下京区）",
        paragraphs: [
          "寺町通仏光寺下る、街の中心からやや南下した位置にある小さなアトリエ。Google Mapsのレビューを確認すると評価5.0、口コミ数はまだ50件台と規模は小さいものの、「4種類までブレンドできる自由度」「落ち着いた対面カウンター」で、静かに1本作りたい人に選ばれています。",
          "京都のカスタム系の中では、比較的観光地から距離を置いた立地なので、騒がしくない環境で長時間かけて選びたい方に向くと考えられます。",
        ],
        info: shopInfo(shop("cabinet")),
        readerNote: "比較記事（たとえば「アエソップとディプティック、ナチュラル系ニッチの本流」）を読んで、「ハーバル系のオリジナルを作りたい」など明確な方向性を持って行くと、スタッフとの対話が濃くなりやすいと考えられます。",
      },
      {
        heading: "THE FLAVOR DESIGN STORE \"KYOTO\"（東山区）",
        paragraphs: [
          "清水寺・八坂神社エリアの参道沿い、増屋町に構える体験型店舗。Google Mapsのレビューでは評価5.0、口コミ1,581件と、清水観光の“寄り道スポット”として定着していることがうかがえます。ラベル・ボトル色・フォントまで自分でカスタマイズできるのが特徴で、旅行の記念に持ち帰る人が多いようです。",
        ],
        info: shopInfo(shop("flavor-design-store")),
        readerNote: "誰かへのプレゼントに、ラベルまで含めて「その人のためだけの一本」を作る、ギフト用途に強い。既存のコラム「香水をプレゼントする時の選び方」と組み合わせて読むと、アイデアが具体化しやすいと思います。",
      },
      {
        heading: "SHOLAYERED 京都三条店（中京区）",
        paragraphs: [
          "三条通、弁慶石町にある「レイヤードフレグランス」という概念を打ち出したブランドの直営店。1つの香水を単体で使うのではなく、2〜3種類を重ねて自分だけの組み合わせを作る、という提案。評価5.0、口コミ60件、まだ規模は小さいものの熱心なファンが多いように見えます。",
        ],
        info: shopInfo(shop("sholayered")),
        readerNote: "「香水は1つに絞らないといけない」という思い込みを外したい人に。Sillageで系統別に整理された知識をベースに、系統をまたいで重ねる遊びに広げていけます。",
      },
    ],
  },
  {
    id: "niche",
    title: "2. 世界のニッチを試す：セレクト香水の店",
    intro: [
      "「その場で作る」のとは対照的に、世界中から集めたニッチブランドを実店舗で嗅ぎ比べたい人向けの、セレクトショップ・ブランド直営店。京都には、東京と大阪の中間地点として、独自のニッチ文化があります。",
    ],
    shops: [
      {
        heading: "LE SILLAGE FRAGRANCE SHOP KYOTO（下京区）",
        paragraphs: [
          "下京区神明町、四条烏丸から少し南に位置する香水セレクトショップ。Google Mapsのレビューでは評価4.7、口コミ117件。海外からのレビューを見ると、「日本のニッチブランドの品揃えが、大都市を含めても屈指」「スタッフが穏やかで、じっくり相談に乗ってくれる」との声が繰り返し出てきます。",
          "古い建物を活かした店内で、静かに1本と向き合う時間を作ってくれるとの評価。公式案内では営業時間11:00〜20:00、不定休です。",
        ],
        info: shopInfo(shop("le-sillage-fragrance-shop")),
        readerNote: "海外の有名ブランドだけでなく、日本のインディーズ香水を試したい方に。Sillageの掲載外にあるブランドと出会える可能性が高い店の1つとして口コミで挙げられています。",
      },
      {
        heading: "LE LABO Kyoto Shinpuhkan（中京区）",
        paragraphs: [
          "新風館（Shinpuhkan）内の店舗。烏丸御池駅直結の複合施設の1階にあり、建物自体がアクセスしやすい立地です。Google Mapsのレビューでは評価4.0、口コミ148件。口コミによれば、「もう1店舗（町屋の方）より、こちらの方が確実に商品が買えて、待ち時間も短い」との声が多く見られます。",
        ],
        info: shopInfo(shop("le-labo-shinpuhkan")),
        readerNote: "Le Laboの香りを純粋に試して買いたい方は、まずこちらへ。Santal 33のような看板商品を、混雑せずに試せる可能性が高いという口コミの傾向があります。",
      },
      {
        heading: "LE LABO KYOTO MACHIYA（中京区）",
        paragraphs: [
          "もう一つのLe Labo京都店で、こちらは町屋を改装した空間+抹茶カフェ併設という Le Labo京都限定のコンセプト店。木屋町通四条上る、祇園四条駅に近い場所に位置します。Google Mapsのレビューでは評価3.7、口コミ267件。",
          "口コミを見ると、店舗体験は賛否分かれる印象です。空間と抹茶ラテを目的にする人には最高の場所という声がある一方、「じっくり嗅ぎ比べたい」目的の場合は混雑と接客スタイルにフラストレーションを感じたという声もあります。",
        ],
        info: shopInfo(shop("le-labo-machiya")),
        readerNote: "「体験の場としての香水店」を求める人、香水+空間+和カフェを一続きの時間として楽しみたい方に。純粋に嗅ぎ比べたい方は Shinpuhkan 店を優先すると迷いが少なそうです。",
      },
      {
        heading: "201LAB PLATFORM KYOTO（中京区）",
        paragraphs: [
          "伊勢屋町、御幸町通六角下るにあるART LAB.の直営店。公式案内では50種類以上の香りから量り売りで選べる店舗で、無理や無駄を減らす循環型の香りの楽しみ方を提案しています。",
        ],
        info: shopInfo(shop("201lab-platform")),
        readerNote: "大手ブランドに疲れた、より個人的な作り手の香りに触れたい方に。1点ものに近い扱いの品も多く、「旅先の記憶と結びつく1本」を探すのに向いています。",
      },
    ],
  },
  {
    id: "department",
    title: "3. 百貨店で定番を確かめる：デパートの香水売場",
    intro: [
      "京都には主要3百貨店がすべて集まっています。「気になっているブランドを実物で試す」目的なら、まずここが確実です。",
    ],
    shops: [
      {
        heading: "JR京都伊勢丹「ラトリエ デ パルファム」（下京区）",
        paragraphs: [
          "JR京都駅直結の伊勢丹2階、化粧品・フレグランスフロア内。公式ブランド一覧では、ラトリエ デ パルファムのほか、クリード、フレデリック マル、メゾン マルジェラなどの取り扱いを確認できます。",
        ],
        info: multiShopInfo(["jr-kyoto-isetan-latelier", "jr-kyoto-isetan"]),
        readerNote: "新幹線の待ち時間で立ち寄れる立地。京都駅到着から30分で香水を試せる場所として、旅行者に特に便利です。",
      },
      {
        heading: "京都高島屋（下京区四条河原町）",
        paragraphs: [
          "Jo Malone London 京都高島屋店、ラトリエ デ パルファム（高島屋の香水セレクト）など、複数の香水ショップが集まります。高島屋自体が老舗デパートで、公式ブランド一覧でも幅広い海外フレグランスの取り扱いを確認できます。",
          "Jo Malone Londonではブランドのコロンを、ラトリエ デ パルファムでは複数ブランドを横断して試せます。同じ館内でブランド直営カウンターとセレクト売場を見比べられる点が特徴です。",
        ],
        info: multiShopInfo(["kyoto-takashimaya", "jomalone-takashimaya", "latelier-des-parfums-takashimaya"]),
        readerNote: "Sillageに掲載中のJo Malone、Chanel、Dior、Guerlainなど、主要ブランドをまとめて確認したい方に。",
      },
      {
        heading: "大丸京都店（下京区）",
        paragraphs: [
          "四条烏丸に位置する、京都で最も歴史の長い百貨店の1つです。1階〜地下1階にコスメ・香水フロアがあり、幅広いブランドが並びます。特に近年、SHIRO 大丸京都店（1階）がフレグランス初心者に選ばれる場となっているようです。",
        ],
        info: multiShopInfo(["daimaru-kyoto", "shiro-daimaru"]),
        readerNote: "「サボン」「ホワイトリリー」などのSHIROの香りを、Sillage掲載のニッチ香水と嗅ぎ比べたい方に。日本人の“清潔感”のコード解読の起点として面白い場所です。",
      },
    ],
  },
  {
    id: "kyoto-original",
    title: "4. 京都らしさが交わる場所：錦市場とその周辺",
    intro: [
      "京都という土地固有の文脈のなかで、香水と近い体験ができる場所も紹介しておきたい。",
    ],
    shops: [
      {
        heading: "Your Musk John's Blend Kyoto 錦市場店（中京区）",
        paragraphs: [
          "錦市場の中、十文字町のロア京都ビル1階。Google Mapsのレビューでは評価4.9、口コミ3,306件。ムスク系の香水と、着物生地を使ったサシェ（香り袋）を選んでカスタマイズできると口コミで紹介されています。",
          "一般的な香水店とは少し違う体験型のカテゴリですが、「京都で作った」感を最も強く持ち帰れる場所の1つ。評価4.9は錦市場一帯の店舗としても異例に高い水準です。",
        ],
        info: shopInfo(shop("your-musk-johns-blend")),
        readerNote: "自宅の空間の香り（ルームディフューザーやサシェ）を、香水と同じ設計思想で整えたい方に。持続する香りとしてのムスクの理解が深まる場所です。",
      },
    ],
  },
  {
    id: "reflection",
    title: "5. 京都で香水を選ぶということ",
    intro: [
      `京都は東京や大阪と比べて街が凝縮されています。四条烏丸から徒歩30分の範囲に、この記事で紹介した${SHOP_COUNT}店のうち半数以上が集中しています。つまり、「1日で複数の香水店を歩いて回れる街」として、実は日本で最も高密度な香水都市の1つと言えます。`,
      "そしてもう1つ、京都に固有の魅力があります。それは、香水店が「他の店との間」に存在している、ということ。",
      "パリのフレグランスショップは香水街のなかにあり、ニューヨークの店は香水フロアのなかにある。だが京都では、着物店の隣に、和菓子屋の斜向かいに、喫茶店の2軒隣に、香水店があります。",
      "これは、香りを選ぶ体験を「他の記憶」と結びつけやすい環境ということでもあります。清水寺の帰りに調合したから、あの日の光と一緒に思い出す香り。大丸で買い物の合間に試したから、母の記憶と地続きになった香り。ホテルへ帰る前に錦市場で選んだから、あの日の京都の空気を含んだ香り。",
      "香りは、記憶の地図になる。",
      `Sillageの読者が京都を訪れるとき、あるいは京都に住みながら改めて街を歩くとき、この${SHOP_COUNT}店のどれかが、新しい「地図の1点」になれば嬉しく思います。`,
    ],
    shops: [],
  },
];

function sectionHtml(section, index) {
  const num = String(index).padStart(2, "0");
  const intro = section.intro.map((p) => `<p>${esc(p)}</p>`).join("");
  const shops = section.shops.map((s) => `
    <div class="shop-block">
      <h3>${esc(s.heading)}</h3>
      ${s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
      ${s.info}
      <p class="reader-note"><span class="reader-note-label">Sillageの読者に</span>${esc(s.readerNote)}</p>
    </div>`).join("");
  return `<section class="text-section" id="section-${section.id}">
      <p class="section-no">${num}</p>
      <h2>${esc(section.title)}</h2>
      ${intro}
      ${shops}
    </section>`;
}

const tocLinks = SECTIONS.map((s, i) => `<a href="#section-${s.id}"><span>${String(i + 1).padStart(2, "0")}</span>${esc(s.title)}</a>`).join("");
tocLinks;
const tocFull = [
  ...SECTIONS.map((s, i) => `<a href="#section-${s.id}"><span>${String(i + 1).padStart(2, "0")}</span>${esc(s.title)}</a>`),
  `<a href="#section-map"><span>06</span>地図で見る京都の香水店</a>`,
  `<a href="#section-faq"><span>07</span>よくある質問</a>`,
].join("");

const bodySections = SECTIONS.map((s, i) => sectionHtml(s, i + 1)).join("");

const shopMapList = SHOPS.map((s) => `<li>
    <strong>${esc(s.name)}</strong>
    <span class="shop-addr">${esc(s.address)}</span>
    <a href="${esc(s.google_maps_url)}" target="_blank" rel="noopener">Google Maps ↗</a>
  </li>`).join("");

// 章別の内訳サマリ。<caption> を持つ小さな表として置き、a11y と検証要件を満たす。
const categoryCounts = SECTIONS.filter((s) => s.shops.length).map((s, i) => ({
  label: s.title.replace(/^\d+\.\s*/, ""),
  count: {
    "custom": SHOPS.filter((x) => x.category === "custom").length,
    "niche": SHOPS.filter((x) => x.category === "niche").length,
    "department": SHOPS.filter((x) => x.category === "department").length,
    "kyoto-original": SHOPS.filter((x) => x.category === "kyoto-original").length,
  }[s.id] || 0,
}));

const summaryTable = `<div class="table-scroll"><table class="kyoto-summary">
      <caption>京都の香水店 章別カテゴリ内訳（掲載${SHOPS.length}店）</caption>
      <thead><tr><th scope="col">章</th><th scope="col">カテゴリ</th><th scope="col">掲載店舗数</th></tr></thead>
      <tbody>${categoryCounts.map((r, i) => `<tr><th scope="row">${i + 1}</th><td>${esc(r.label)}</td><td>${r.count}店</td></tr>`).join("")}</tbody>
    </table></div>`;

const mapSection = `<section class="text-section" id="section-map">
      <p class="section-no">06</p>
      <h2>6. 地図で見る京都の香水店</h2>
      <p>すべての店舗を1つの地図で確認できるよう、Google Maps に集約しました。京都駅から出発する場合、まず京都伊勢丹で1店、その後 徒歩or地下鉄で四条河原町エリアへ移動し、高島屋・大丸・寺町通・錦市場・河原町・新風館・下京区新明町 を反時計回りに歩けば、半日〜1日で7〜10店を巡る現実的な行程になります。</p>
      <div class="kyoto-map-embed">
        <iframe src="${MAP_EMBED}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="京都の香水店マップ（Google Maps）"></iframe>
      </div>
      <p class="kyoto-map-note">上の地図は京都中心部（四条烏丸〜河原町）を表示しています。各店舗の正確な位置と道順は、下記リストの「Google Maps ↗」から個別のピンで確認できます。</p>
      ${summaryTable}
      <ul class="shop-map-list">${shopMapList}</ul>
    </section>`;

const faqSection = `<section class="faq" id="section-faq">
      <h2>7. よくある質問</h2>
      ${FAQ.map((x) => `<details><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join("")}
    </section>`;

const relatedSection = `<section class="related-columns"><h2>次に読む</h2><ul class="related-list">${RELATED.map((r) => `<li><a href="/columns/${r.slug}">${esc(r.title)}</a><span class="cat-badge">${esc(r.cat)}</span></li>`).join("")}</ul></section>`;

const ctaSection = `<section class="column-cta">
      <p class="cta-lead">読んで、実際に選ぶ。</p>
      <div class="cta-grid">
        <a class="cta-card" href="/#diagnosis"><span class="cta-icon">◇</span><span class="cta-title">診断で見つける</span><span class="cta-desc">6問で自分に合うブランドを診断</span></a>
        <a class="cta-card" href="/#find-fragrances"><span class="cta-icon">○</span><span class="cta-title">香調から探す</span><span class="cta-desc">系統色で${FRAGRANCE_COUNT}本の香水を比較</span></a>
        <a class="cta-card" href="/#brand-index"><span class="cta-icon">△</span><span class="cta-title">ブランドで探す</span><span class="cta-desc">${BRAND_COUNT}ブランドの掲載一覧</span></a>
      </div>
    </section>`;

// 情報源と編集区分：他33コラムと同じ「sources」ブロック名を採用し、E-E-A-Tの一次情報を明示する。
const sourcesSection = `<section class="sources">
      <h2>情報源と編集区分</h2>
      <ul class="source-list">
        <li><a href="https://maps.google.com/" target="_blank" rel="noopener noreferrer">Google Maps｜掲載${SHOP_COUNT}店舗の住所・営業時間・レビュー・評価<span>各店舗の公開情報（2026年8月確認）</span></a></li>
      </ul>
      <p class="editorial-note">店舗名・住所・営業時間・座標は上記情報源で確認しています。カテゴリ分類（カスタム調合・セレクトショップ・百貨店・京都独自）と、各店舗への「Sillageの読者に」コメントはSillage編集部の判断です。編集部は現地取材を行っておらず、Google Mapsのレビュー傾向と公開情報から特徴を整理しています。</p>
    </section>`;

const eeatNote = `<div class="editorial-eeat">
      本記事の店舗情報は、Sillage編集部が2026年8月時点で Google Maps のレビュー・営業時間・住所を実測して整理したものです。編集部が現地訪問して執筆したものではなく、公開情報（口コミ、営業時間、住所、写真）を元に再構成しています。店舗情報は変更される場合があるため、来訪前に各店の公式情報をご確認ください。
    </div>`;

const shareUrls = {
  x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(TITLE + "｜" + SITE_COPY.siteName)}&url=${encodeURIComponent(CANONICAL)}`,
  line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(CANONICAL)}`,
};

// 既存コラムの共通CSSを参照するため、business-fragrance.html の1行になった<style>ブロックを
// そのまま流用する。ただし kyoto 記事固有のブロック(shop-info, kyoto-map-embed, shop-map-list,
// editorial-eeat, shop-block, reader-note)を追加でぶら下げる。
const REFERENCE_COLUMN_PATH = join("public", "columns", "business-fragrance.html");
const referenceHtml = readFileSync(REFERENCE_COLUMN_PATH, "utf8");
const styleMatches = [...referenceHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
if (!styleMatches.length) throw new Error("reference column has no <style> block");
const baseStyle = styleMatches.map((m) => m[1]).join("\n");

const finalCss = `${baseStyle}
.shop-block{margin:26px 0 34px;padding:0}
.shop-block h3{font:500 clamp(18px,2.6vw,22px)/1.55 "Shippori Mincho",serif;color:#f0ede8;margin:22px 0 10px}
.shop-block p{font-size:15px;line-height:2.08;color:#cfcdc8;margin-bottom:14px}
.reader-note{margin:14px 0 6px;padding:14px 18px;background:rgba(196,136,156,.05);border:1px solid rgba(196,136,156,.18);border-radius:6px;font-size:13.5px;line-height:1.85;color:#d2d0cb}
.reader-note-label{display:inline-block;font:italic 12px "Cormorant",serif;color:#c4889c;letter-spacing:1px;margin-right:8px}
${EXTRA_CSS}`;

const html = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0d0e10">
<title>${esc(TITLE)}｜${esc(SITE_COPY.siteName)}</title><meta name="description" content="${esc(DESCRIPTION)}"><meta name="google-site-verification" content="UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q">
<!-- Google tag (gtag.js) --><script async src="https://www.googletagmanager.com/gtag/js?id=G-60BQRQWB5M"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-60BQRQWB5M');</script>
<link rel="canonical" href="${CANONICAL}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(TITLE)}"><meta property="og:description" content="${esc(DESCRIPTION)}"><meta property="og:url" content="${CANONICAL}"><meta property="og:image" content="${OGP_IMAGE}"><meta property="og:site_name" content="${esc(SITE_COPY.shortName)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(TITLE)}"><meta name="twitter:description" content="${esc(DESCRIPTION)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Cormorant:ital,wght@0,400;1,400&family=Shippori+Mincho:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(articleLd)}</script><script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script><script type="application/ld+json">${JSON.stringify(faqLd)}</script><script type="application/ld+json">${JSON.stringify(itemListLd)}</script>
<style>${finalCss}</style></head><body><header class="topbar"><a class="logo" href="/">Sillage</a><span class="pr-tag">PR・アフィリエイト広告を含みます</span></header>
<main class="article-shell">
  <p class="crumb"><a href="/">Sillage</a> ／ <a href="/guides.html">香水コラム</a> ／ シーン・季節</p>
  <header class="hero">
    <a class="category-link" href="/guides.html#category-scene">シーン・季節の記事一覧</a>
    <span class="eyebrow">KYOTO GUIDE ／ SILLAGE EDITORIAL</span>
    <h1>${esc(TITLE)}</h1>
    <p class="lead">古都のイメージゆえに、和の香りだけを扱う土地と思われがちですが、実際には、海外のニッチブランドから、その場で調合するカスタムサロン、デパートの定番売場まで、あらゆる香水体験が徒歩圏内に共存しています。</p>
    <p class="article-meta"><span>著者：Sillage編集部</span><span>公開日：<time datetime="${PUBLISHED}">2026/8/1</time></span><span>更新日：<time datetime="${MODIFIED}">2026/8/1</time></span></p>
  </header>
  <aside class="answer-box"><span>30秒で分かる結論</span><p>京都は四条烏丸から徒歩30分の範囲に、カスタム調合・ニッチセレクト・百貨店ブランド・和の香りが密集する高密度な香水都市。旅行なら Flavor Design（清水）＋ 高島屋、本気の一本探しなら LE SILLAGE FRAGRANCE SHOP KYOTO、時間があれば新風館の Le Labo と錦市場の Your Musk を組み合わせるのが動線として素直です。</p></aside>
  <nav class="toc" aria-label="目次"><span>contents ／ この記事で分かること</span>${tocFull}</nav>
  <section class="text-section" id="section-intro">
    <p>京都の路地を歩いていると、時折、思いがけない場所から香りが漏れてくることがあります。古い町屋を改装したセレクトショップ、寺町通に面したカスタム香水の店、デパート地下から地上へ上がる階段の途中に、ふと届く香水売場の気配。</p>
    <p>京都は「香りを選ぶ場所」として、実は日本でも屈指の密度を持つ街だと言えます。この記事では、京都市内の香水店・香水を試せる場所を${SHOP_COUNT}店ピックアップし、それぞれの特徴と、Sillageの読者に向けた「どんな時に足を運ぶといいか」を整理しました。旅行で訪れる方、京都に住んでいて改めて街を再発見したい方、どちらにも実用的な地図として使ってもらえれば嬉しいです。</p>
  </section>
  ${bodySections}
  ${mapSection}
  ${faqSection}
  ${relatedSection}
  ${ctaSection}
  ${sourcesSection}
  ${eeatNote}
  <section class="share-tools"><p>share ／ 役立ったら共有</p><div class="share-actions"><a href="${shareUrls.x}" target="_blank" rel="noopener">Xで共有</a><a href="${shareUrls.line}" target="_blank" rel="noopener">LINEで送る</a><button type="button" onclick="shareSillage(this)">リンクをコピー</button></div></section>
  <a class="backhome" href="/">← Sillageトップへ戻る</a>
</main>
<footer>当サイトはアフィリエイトプログラムを利用し、商品紹介により収益を得ています。本文はGoogle Mapsの公開情報とSillage編集部の判断をもとに整理したものであり、店舗の営業状態や品揃えは変動する場合があります。<br><a href="/">${esc(SITE_COPY.siteName)} — ${esc(SITE_COPY.tagline)}</a> ・ <a href="/about.html#update-policy">編集方針・更新ポリシー</a></footer>
<script>async function shareSillage(button){if(navigator.share){try{await navigator.share({title:document.title,url:location.href});return}catch(e){if(e&&e.name==='AbortError')return}}if(navigator.clipboard){await navigator.clipboard.writeText(location.href);button.textContent='コピーしました'}}</script></body></html>`;

const out = join("public", "columns", `${SLUG}.html`);
writeFileSync(out, html);
console.log(`Wrote ${out} (${html.length} bytes, ${SHOPS.length} shops in ItemList schema)`);
