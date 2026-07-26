export const COLUMN_CATEGORIES = {
  beginner: {
    label: "香水初心者",
    heading: "初めての人におすすめ",
    description: "最初の一本、容量、年代や性別の分類との付き合い方を、購入前の順番から整理します。",
    startSlug: "first-fragrance",
  },
  trouble: {
    label: "失敗・トラブル",
    heading: "よくある困りごと",
    description: "つけすぎや嗅覚の慣れなど、起きてから慌てやすい疑問を具体的な行動へ置き換えます。",
    startSlug: "too-much-perfume",
  },
  "how-to": {
    label: "つけ方・使い方",
    heading: "つけ方・使い方",
    description: "量、つける位置、香りを穏やかに保つ方法を、場面と周囲との距離から判断します。",
    startSlug: "how-to-wear",
  },
  buying: {
    label: "購入・試香",
    heading: "購入前に知ること",
    description: "店頭での試し方、容量、プレゼント選びなど、買う前に確認したい順番をまとめます。",
    startSlug: "blotter-vs-skin",
  },
  care: {
    label: "保存・持ち運び",
    heading: "保存・持ち運び",
    description: "光・熱・温度変化を避ける保管と、小分けや持ち運びで失敗しにくい扱い方を確認します。",
    startSlug: "perfume-storage",
  },
  scene: {
    label: "シーン・季節",
    heading: "シーン・季節",
    description: "職場、暑い日、季節の変化など、同じ香りでも届き方が変わる条件を整理します。",
    startSlug: "business-fragrance",
  },
  knowledge: {
    label: "香りの知識",
    heading: "香りの知識",
    description: "濃度、ノートの時間変化、香りの読み方を、購入判断に使える言葉で解説します。",
    startSlug: "concentration-guide",
  },
  comparison: {
    label: "ブランド・商品比較",
    heading: "ブランド比較",
    description: "似て見えるブランドや香りを、公開情報と掲載データをもとに比較します。",
    startSlug: "chanel-vs-dior",
  },
};

export const COLUMN_CATEGORY_BY_SLUG = {
  "business-fragrance": "scene",
  "how-to-wear": "how-to",
  "notes-pyramid": "knowledge",
  "chanel-vs-dior": "comparison",
  "lelabo-vs-jomalone": "comparison",
  "tomford-vs-creed": "comparison",
  "aesop-vs-diptyque": "comparison",
  "margiela-vs-byredo": "comparison",
  "hermes-vs-acquadiparma": "comparison",
  "bvlgari-vs-versace": "comparison",
  "why-margiela-replica": "comparison",
  "concentration-guide": "knowledge",
  "season-scene-map": "scene",
  "first-fragrance": "beginner",
  "too-much-perfume": "trouble",
  "office-perfume-amount": "scene",
  "why-cant-smell-own-perfume": "trouble",
  "summer-perfume-strong": "scene",
  "perfume-on-clothes": "how-to",
  "perfume-storage": "care",
  "perfume-discoloration": "care",
  "perfume-decanting": "care",
  "blotter-vs-skin": "buying",
  "perfume-store-comparison": "buying",
  "age-and-perfume": "beginner",
  "perfume-gift-mistakes": "buying",
  "how-many-sprays": "how-to",
  "where-to-apply-perfume": "how-to",
  "make-perfume-last-longer": "how-to",
  "how-to-test-perfume": "buying",
  "perfume-bottle-size": "beginner",
  "perfume-expiration": "care",
  "perfume-gift-guide": "buying",
};

export const COLUMN_SOURCE_BY_SLUG = {
  "too-much-perfume": [
    {
      publisher: "厚生労働省",
      title: "化粧品等の使用上の注意表示に関する資料",
      url: "https://www.mhlw.go.jp/file/05-Shingikai-11121000-Iyakushokuhinkyoku-Soumuka/0000051962.pdf",
      note: "肌に異常が生じた場合の使用中止等を確認",
    },
  ],
  "why-cant-smell-own-perfume": [
    {
      publisher: "PubMed",
      title: "Habituation and adaptation to odors in humans",
      url: "https://pubmed.ncbi.nlm.nih.gov/28408237/",
      note: "嗅覚の慣れと順応に関するレビュー",
    },
  ],
  "perfume-on-clothes": [
    {
      publisher: "日本化粧品工業会",
      title: "化粧品を保管するときに注意していただきたいこと",
      url: "https://www.jcia.org/user/public/basis/store",
      note: "容器、光、熱、温度変化に関する一般的な取扱情報",
    },
  ],
  "perfume-storage": [
    {
      publisher: "日本化粧品工業会",
      title: "化粧品を保管するときに注意していただきたいこと",
      url: "https://www.jcia.org/user/public/basis/store",
      note: "直射日光、高温多湿、温度変化を避ける保管方法",
    },
  ],
  "perfume-discoloration": [
    {
      publisher: "FDA",
      title: "Shelf Life and Expiration Dating of Cosmetics",
      url: "https://www.fda.gov/cosmetics/cosmetics-labeling/shelf-life-and-expiration-dating-cosmetics",
      note: "化粧品の外観・におい・保管条件と使用期間の考え方",
    },
  ],
  "perfume-decanting": [
    {
      publisher: "国土交通省",
      title: "機内への持込み又はお預け手荷物に制限がある品目の代表例",
      url: "https://www.mlit.go.jp/common/001425421.pdf",
      note: "香水を含む化粧品類の航空機への持ち込み条件",
    },
  ],
  "perfume-expiration": [
    {
      publisher: "FDA",
      title: "Shelf Life and Expiration Dating of Cosmetics",
      url: "https://www.fda.gov/cosmetics/cosmetics-labeling/shelf-life-and-expiration-dating-cosmetics",
      note: "一律の期限ではなく製品・使用・保管条件で変わることを確認",
    },
    {
      publisher: "日本化粧品工業会",
      title: "化粧品Q&A",
      url: "https://www.jcia.org/user/public/faq?type=2",
      note: "香水の保管と外観・においの変化に関する案内",
    },
  ],
};

const COLUMN_RELATED_BY_SLUG = {
  "business-fragrance": ["office-perfume-amount", "how-to-wear", "concentration-guide", "first-fragrance"],
  "how-to-wear": ["where-to-apply-perfume", "how-many-sprays", "too-much-perfume", "perfume-on-clothes"],
  "concentration-guide": ["how-many-sprays", "first-fragrance", "perfume-bottle-size", "notes-pyramid"],
  "first-fragrance": ["perfume-bottle-size", "how-to-test-perfume", "perfume-gift-guide", "concentration-guide"],
  "too-much-perfume": ["how-many-sprays", "where-to-apply-perfume", "why-cant-smell-own-perfume", "perfume-on-clothes"],
  "why-cant-smell-own-perfume": ["how-many-sprays", "too-much-perfume", "make-perfume-last-longer", "how-to-wear"],
  "perfume-on-clothes": ["where-to-apply-perfume", "too-much-perfume", "perfume-storage", "perfume-discoloration"],
  "perfume-storage": ["perfume-expiration", "perfume-discoloration", "perfume-decanting", "perfume-on-clothes"],
  "perfume-decanting": ["perfume-storage", "perfume-expiration", "perfume-bottle-size", "perfume-on-clothes"],
};

const COLUMN_EXTRA_FAQ_BY_SLUG = {
  "too-much-perfume": [
    { q: "香水をつけすぎた服はすぐ洗うべきですか？", a: "まず衣類の洗濯表示を確認してください。水洗いできない素材や装飾がある場合は、自己判断で処理せず専門店へ相談します。" },
  ],
  "why-cant-smell-own-perfume": [
    { q: "自分で感じない時は何プッシュ追加してよいですか？", a: "その場では追加せず、香りの少ない場所へ移動して休みます。次回は最初の量と場所を記録し、別の日に調整します。" },
  ],
  "perfume-on-clothes": [
    { q: "目立たない場所なら必ずシミになりませんか？", a: "素材、染料、香水の色によって変わるため断定できません。衣類と香水の表示を確認し、大切な服への直接噴霧は避けるのが安全です。" },
  ],
  "perfume-storage": [
    { q: "香水は冷蔵庫へ入れた方が長持ちしますか？", a: "一般的な化粧品は温度変化の少ない常温保管が案内されています。製品に個別指定がある場合は、その表示を優先してください。" },
  ],
  "perfume-decanting": [
    { q: "アトマイザーへ満量まで入れてよいですか？", a: "容器の説明に従い、漏れや噴霧不良を避けるため入れすぎないようにします。移し替え後は立てた状態で漏れを確認してください。" },
  ],
};

export function applyColumnTaxonomy(article) {
  const category = article.category || COLUMN_CATEGORY_BY_SLUG[article.slug];
  if (!category || !COLUMN_CATEGORIES[category]) {
    throw new Error(`column category missing: ${article.slug}`);
  }
  return {
    ...article,
    category,
    sources: [...(article.sources || []), ...(COLUMN_SOURCE_BY_SLUG[article.slug] || [])],
    relatedArticleSlugs: article.relatedArticleSlugs || COLUMN_RELATED_BY_SLUG[article.slug] || [],
    faq: [...article.faq, ...(COLUMN_EXTRA_FAQ_BY_SLUG[article.slug] || [])],
  };
}
