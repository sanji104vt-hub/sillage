// Sillageのコラム個別ページを、本文・図解・SEO情報を含む共通テンプレートから生成する。
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { familyOgpUrl } from "./lib/ogp-image.mjs";
import { loadSiteCopy } from "./lib/site-copy.mjs";
import { PROBLEM_ARTICLES } from "./data/problem-columns.mjs";
import { BEGINNER_ARTICLES } from "./data/beginner-columns.mjs";
import { COLUMN_CATEGORIES, applyColumnTaxonomy } from "./data/column-taxonomy.mjs";

const SITE_COPY = loadSiteCopy();
const SITE = SITE_COPY.siteUrl.replace(/\/$/, "");
const OUT = join("public", "columns");
const MODIFIED = "2026-07-16T22:00:00+09:00";
const PUBLISHED = "2026-07-07T15:18:04+09:00";
const FRAGRANCES = JSON.parse(readFileSync(join("data", "fragrances.json"), "utf8")).fragrances;
const FRAGRANCE_BY_SLUG = new Map(FRAGRANCES.map((item) => [item.slug, item]));
// フェーズA: 「次に読む」を8本に拡充するためのマッピング（カテゴリ混合で回遊率を上げる）
const RELATED_MAP = JSON.parse(readFileSync(join("data", "related-mapping.json"), "utf8"));
mkdirSync(OUT, { recursive: true });

const ARTICLE_FAMILY = {
  "business-fragrance": "aromatic",
  "chanel-vs-dior": "aromatic",
  "tomford-vs-creed": "woody",
  "hermes-vs-acquadiparma": "citrus",
  "bvlgari-vs-versace": "aquatic",
};

const brand = (name, slug) => ({ name, href: `/brand-${slug}.html` });
const BRANDS = {
  chanel: brand("Chanel", "chanel"), dior: brand("Dior", "dior"), hermes: brand("Hermès", "hermes"),
  armani: brand("Giorgio Armani", "giorgio-armani"), bvlgari: brand("Bvlgari", "bvlgari"), versace: brand("Versace", "versace"),
  lelabo: brand("Le Labo", "le-labo"), jomalone: brand("Jo Malone", "jo-malone"), byredo: brand("Byredo", "byredo"),
  diptyque: brand("Diptyque", "diptyque"), margiela: brand("Maison Margiela", "maison-margiela"), aesop: brand("Aesop", "aesop"),
  tomford: brand("Tom Ford", "tom-ford"), creed: brand("Creed", "creed"), acquadiparma: brand("Acqua di Parma", "acqua-di-parma"),
  ysl: brand("YSL", "ysl"), guerlain: brand("Guerlain", "guerlain"), prada: brand("Prada", "prada"),
};

function compare(config) {
  const { a, b } = config;
  return {
    ...config,
    tag: "COMPARE",
    visual: { type: "compare", a, b, axes: config.axes },
    takeaways: [
      `${a}は「${config.aKey}」を求める人に向く`,
      `${b}は「${config.bKey}」を求める人に向く`,
      `迷ったら、使う場面と周囲との距離で決める`,
    ],
    sections: [
      { title: `${a}の香りは、何を印象に残すか`, paragraphs: config.aText },
      { title: `${b}の香りは、何を印象に残すか`, paragraphs: config.bText },
      { title: "結局、どちらを選ぶべきか", paragraphs: [config.decision, "紙のムエットだけで即決せず、左右の手首に一本ずつ試して数時間後まで比べると違いが見えやすい。最初の華やかさより、ミドルからラストを自分が心地よいと思えるかを優先したい。"] },
    ],
    table: {
      title: "違いをひと目で比較",
      heads: ["比較軸", a, b],
      rows: config.rows,
      note: "グラフと表は香調構成・使いやすさをもとにしたSillage編集部の相対評価です。肌質や気温によって感じ方は変わります。",
    },
    choices: [
      { title: `${a}が合う人`, text: config.aFit },
      { title: `${b}が合う人`, text: config.bFit },
    ],
  };
}

const articles = [
  {
    slug: "business-fragrance", tag: "WORK STYLE", title: "職場の香水は何プッシュ？迷惑にならない選び方とつけ方",
    description: "職場で香水を使う時の量、香調、つける場所を整理。会議や商談など距離が近い場面で、周囲へ配慮する判断方法を解説します。",
    modifiedAt: "2026-07-25T12:00:00+09:00",
    lead: "仕事の香りで大切なのは、目立つことではなく『近づいたときだけ清潔に香る』こと。距離を設計すると失敗が減る。",
    answer: "清潔感のあるシトラス、軽いウッディ、ムスクを1プッシュ。首の前ではなく、腰やお腹など鼻から遠い場所につけるのが基本です。",
    visual: { type: "traits", title: "仕事で扱いやすい香りの方向", traits: [["清潔感","重視"],["甘さ","控えめ"],["拡散","弱め"],["量","1プッシュから"]] },
    takeaways: ["香りはパーソナルスペースの内側に留める", "朝は1プッシュから。足りなければ次回調整する", "密室・会食・医療機関では、つけない判断も正解"],
    sections: [
      { title: "職場では『いい香り』より『距離感』が評価される", paragraphs: ["香水の好みは人によって大きく違う。自分には爽やかでも、会議室やエレベーターでは強く感じる人がいる。ビジネスでは香りの質より先に、相手が逃げられない空間かどうかを考えたい。", "目標は、廊下ですれ違った人に残り香を届けることではない。書類を渡す距離まで近づいたときに、清潔な印象が一瞬立ち上がる程度で十分だ。"] },
      { title: "選ぶ順番は、香調・濃度・つける場所", paragraphs: ["最初の一本はシトラス、アロマティック、透明感のあるウッディ、石けんを思わせるムスクが扱いやすい。濃厚なバニラ、ラム、タバコ、強いアンバーは魅力的だが、日中より会食後や休日に回すと使い分けがきれいになる。", "オードトワレでもオードパルファムでも、まず一度だけ噴霧する。腰やお腹につけると衣服の内側から穏やかに立ち、首や耳の後ろより周囲へ広がりにくい。"] },
      { title: "一日の予定から逆算する", paragraphs: ["午前に商談がある日は軽く、外回りだけの日は汗と混ざりにくい爽やかな香りを選ぶ。夜に会食がある場合も、朝から強い香りを仕込むより、小さなアトマイザーで夕方にごく少量つけ直す方が清潔に見える。", "香りを足す前に、汗や皮脂を拭いて肌を整える。古い香りの上へ重ねると輪郭が濁りやすい。迷う日は無香料を選ぶことも、相手への配慮として十分に洗練されている。"] },
    ],
    table: { title:"場面別の安全ライン", heads:["場面","目安","向く香り"], rows:[["デスクワーク","腰に1プッシュ","シトラス／ムスク"],["商談・会議","香らせない〜ごく弱く","軽いウッディ"],["外回り","朝1プッシュ","アクアティック"],["会食","夕方に少量","ドライなウッディ"]], note:"香りに敏感な人がいる場所では、施設や職場のルールを優先してください。" },
    choices:[{title:"朝のチェック",text:"自分の鼻が慣れて感じなくても、追加しない。家を出て10分後に一度だけ確認する。"},{title:"避けたいサイン",text:"隣の席から香りが分かる、部屋を出た後も残る、衣服へ何度も噴霧する。この三つは量を減らす合図。"}],
    faq:[{q:"仕事用香水は何プッシュが正解？",a:"まず1プッシュから始めるのが安全です。香水の濃度、噴霧量、気温で広がり方が違うため、周囲の反応を見て次回調整します。"},{q:"首につけてもいい？",a:"香りが広がりやすいため、職場では腰やお腹など鼻から遠い場所の方が扱いやすいです。"}],
    brands:[BRANDS.chanel,BRANDS.armani,BRANDS.hermes,BRANDS.prada], featured:["chanel-1","giorgio-armani-2","hermes-3","prada-2"],
  },
  {
    slug:"how-to-wear",tag:"HOW TO",title:"香水の正しいつけ方｜量・場所・タイミングの基本",
    description:"香水の量、つける場所、タイミングを身体図で解説。手首・首・腰の違いと、周囲へ配慮しながら使う基本が分かります。",
    modifiedAt:"2026-07-25T12:00:00+09:00",
    lead:"香水は、どこにつけるかで同じ一本でも別の表情になる。強くするより、立ち上がる位置を選ぶ。",
    answer:"日常は腰かお腹に1プッシュ。香りを近くで楽しみたい日は手首の内側、しっかり香らせたい夜だけ首の後ろへ。こすらず自然に乾かします。",
    visual:{type:"body"},
    takeaways:["肌から15〜20cmほど離して一度噴霧", "手首をこすり合わせず、そのまま乾かす", "汗をかいた肌には重ねず、拭いてから少量"],
    sections:[
      {title:"場所で変わる、香りの届き方",paragraphs:["首や耳の後ろは体温が高く、顔に近いため香りを強く感じやすい。デートや屋外には向くが、職場や電車では広がりすぎることがある。手首は自分で確認しやすく、試香に便利だ。", "腰やお腹、膝の裏は鼻から遠く、衣服の内側からゆっくり香る。初めての香水や濃度の高い香水は、下半身から始めると量を失敗しにくい。"]},
      {title:"適量は『香水の種類』より『場面』で決める",paragraphs:["オードトワレだから必ず多く、パルファムだから必ず少なく、という単純な話ではない。スプレー一回の量や香料の構成で拡散は違う。最初は一度だけつけ、次に使う日に増減するのが確実だ。", "屋外中心なら少し広がっても不快になりにくいが、会議室、映画館、飲食店では距離が近い。香りを味方にするには、その日の最も狭い空間に合わせて量を決める。"]},
      {title:"長持ちさせるコツと、よくある失敗",paragraphs:["乾燥した肌では香りが飛びやすい。無香料の保湿剤で肌を整えてからつけると、香りが急に立ちすぎず持続も安定しやすい。衣服への直接噴霧はシミや変色の可能性があるため、素材とブランドの注意表示を確認したい。", "空中へ噴いてくぐる方法は、床や衣服へ広く付着し、量を管理しにくい。香りを混ぜるときも、一度に重ねず左右の腕で試してから。『感じなくなったから足す』は、鼻が慣れただけの場合が多い。"]},
    ],
    table:{title:"場面別・最初の目安",heads:["場面","場所","回数"],rows:[["オフィス","腰・お腹","1回"],["休日の屋外","手首または腰","1〜2回"],["夜の外出","首の後ろまたは胸元","1回から"],["試香","左右の手首","各1回"]],note:"回数はあくまで開始点です。噴霧量や香水の強さに応じて減らしてください。"},
    choices:[{title:"穏やかに香らせる",text:"腰・お腹・膝の裏。空気と衣服を通るため、角が取れやすい。"},{title:"輪郭を出す",text:"手首・首の後ろ。体温で立ちやすいので、狭い空間では量を控える。"}],
    faq:[{q:"手首をこすると香りは壊れる？",a:"香りが完全に壊れるというより、摩擦や熱で立ち上がり方が変わる可能性があります。こすらず乾かす方が比較しやすいです。"},{q:"服につけてもいい？",a:"素材によってシミや変色の可能性があります。目立たない場所で確認し、基本は肌につける方が安全です。"}],
    brands:[BRANDS.jomalone,BRANDS.chanel,BRANDS.hermes],featured:["jo-malone-1","chanel-1","hermes-1"],
  },
  {
    slug:"notes-pyramid",tag:"BASICS",title:"トップ・ミドル・ラストの読み方",
    description:"香水のトップノート・ミドルノート・ラストノートを時間軸の図で解説。試香で失敗しない待ち時間と香調表の読み方が分かります。",
    lead:"香水は一枚の写真ではなく、時間とともに場面が変わる短編映画。最初の5分だけで選ぶと、本当に長く付き合う香りを見落とす。",
    answer:"トップは最初の挨拶、ミドルはその香水の主役、ラストは肌に残る余韻。購入判断では、30分後と数時間後を必ず確認します。",
    visual:{type:"timeline"},
    takeaways:["トップだけで即決しない", "ムエットと肌の両方で試す", "自分が最も長く過ごすミドル〜ラストを重視"],
    sections:[
      {title:"三層は、きっぱり入れ替わるわけではない",paragraphs:["トップ、ミドル、ラストは便利な説明だが、実際の香りは境界線で突然切り替わらない。揮発しやすい素材が先に立ち、残りやすい素材が後ろから支えるため、複数の層が重なりながら比率を変えていく。", "シトラスやハーブは早い段階で輝き、花やスパイスが中心を作り、ウッド、ムスク、アンバーが余韻を支えることが多い。ただし香料の処方によって順番は変わるため、香調表は地図として読む。"]},
      {title:"試香は、三回に分けてメモする",paragraphs:["つけた直後は『明るい／鋭い／甘い』、30分後は『清潔／粉っぽい／スパイシー』、数時間後は『木質／肌っぽい／残り方が軽い』のように短い言葉で記録する。ブランドの説明を写すより、自分の語彙を残す方が次の比較に役立つ。", "一度に試すのは2〜3本まで。左右の手首とムエットを使い分け、名前と時刻を書く。鼻が疲れたら香りを追加せず、外の空気を吸って休む。"]},
      {title:"香調表から、使う場面を予測する",paragraphs:["トップにベルガモット、ミドルにラベンダー、ラストに乾いたウッドが並ぶなら、清潔で仕事にも使いやすい可能性が高い。反対に、ラム、濃厚なバニラ、タバコ、樹脂が後半に集まるなら、夜や寒い季節で魅力が出やすい。", "ただし同じノート名でも量と組み合わせで印象は変わる。『好きな素材が入っている』だけで決めず、時間が経った肌で、自分の生活に合うかを確かめる。"]},
    ],
    table:{title:"三層の役割",heads:["層","時間の目安","見るポイント"],rows:[["TOP","直後〜30分前後","第一印象・明るさ"],["MIDDLE","30分〜数時間","香水の主題・個性"],["LAST","数時間後〜","肌との相性・余韻"]],note:"時間は一般的な目安です。香水、肌、気温、湿度によって大きく変わります。"},
    choices:[{title:"店頭で見る",text:"ムエットに時刻を書く。店を一周してから戻り、最初の印象との差を見る。"},{title:"自宅で決める",text:"可能ならサンプルを一日使う。仕事中・屋外・帰宅後の三場面で確認する。"}],
    faq:[{q:"トップノートは何分続く？",a:"一般には数分から30分ほどが目安ですが、素材や処方、気温で変わります。境界は連続的です。"},{q:"香調表と実際の香りが違うのはなぜ？",a:"ノート表は配合表ではなく、香りの印象を伝える表現だからです。肌との相性や周囲の温度でも感じ方が変わります。"}],
    brands:[BRANDS.guerlain,BRANDS.dior,BRANDS.jomalone],featured:["guerlain-1","dior-1","jo-malone-1"],
  },
  compare({
    slug:"chanel-vs-dior",title:"シャネルとディオール、パリ二大メゾンの違い",description:"シャネルとディオールのメンズ香水を、清潔感・存在感・日常性・個性で図解比較。どちらが自分に合うか具体的に分かります。",
    lead:"同じパリの王道でも、シャネルは余白で整え、ディオールは輪郭で惹きつける。",answer:"仕事や長く使う一本ならシャネル、第一印象と存在感を優先するならディオールが選びやすい。",
    a:"Chanel",b:"Dior",aKey:"端正な余白",bKey:"劇的な存在感",axes:[["清潔感",92,84],["存在感",72,94],["日常性",90,78],["個性",76,91],["ギフト",91,86]],
    aText:["シャネルのメンズ香水には、素材を詰め込むより輪郭を整える美学がある。シトラス、ウッディ、アロマティックが滑らかにつながり、スーツにも休日の白いシャツにも合わせやすい。", "ブルー ドゥ シャネルやアリュール オム スポーツは、清潔感を中心に置きながら無難で終わらない。香りが本人より先に話し始めないため、仕事と私生活を一本でつなぎたい人に向く。"],
    bText:["ディオールは、時代ごとに男性像を大胆に描き直してきた。ソヴァージュの乾いた拡散、ディオール オムの端正な甘さなど、香りの主題が明確で記憶に残りやすい。", "第一印象を作る力が強く、デートや夜の外出で頼りになる。その分、量が多いと香りが前へ出やすいので、狭い空間では一度の噴霧から試したい。"],
    decision:"毎朝迷わず手に取れる一本ならシャネル。服装や気分を切り替え、香りで人物像まで演出したいならディオール。価格差より、周囲へ届けたい距離で選ぶと答えが出る。",
    rows:[["印象","整っていて静か","輪郭が強く華やか"],["得意な場面","仕事・会食・日常","デート・夜・イベント"],["量の扱いやすさ","比較的調整しやすい","少量でも存在感が出やすい"],["一本目","王道を長く使いたい人","印象を明確にしたい人"]],
    aFit:"スーツにも休日にも使いたい。清潔感は欲しいが、香水だけが目立つのは避けたい人。",bFit:"第一印象を強くしたい。服や髪型と一緒に、香りもスタイリングしたい人。",
    faq:[{q:"20代にはシャネルとディオールのどちら？",a:"年齢より場面で選びます。仕事と日常を一本でつなぐならシャネル、夜やデートで印象を作るならディオールが分かりやすいです。"},{q:"両方試すときのコツは？",a:"左右の手首に一本ずつつけ、直後・30分後・3時間後を比べます。同じ日に試すと差が見えやすくなります。"}],
    brands:[BRANDS.chanel,BRANDS.dior,BRANDS.hermes,BRANDS.ysl],featured:["chanel-4","dior-6","chanel-1","dior-1"],
  }),
  compare({
    slug:"lelabo-vs-jomalone",title:"ル ラボとジョー マローン、現代ニッチの2大スター",description:"ル ラボとジョー マローンを、個性・重ねづけ・日常性・ギフト適性で図解比較。初めてのニッチ香水選びを分かりやすく解説します。",
    lead:"どちらも現代のニッチ入門だが、ル ラボは個人的な署名、ジョー マローンは誰かと共有できる余白。",answer:"自分だけの空気を作るならル ラボ、軽やかに使い分けたり贈ったりするならジョー マローン。",
    a:"Le Labo",b:"Jo Malone",aKey:"所有する儀式感",bKey:"軽やかな組み合わせ",axes:[["清潔感",76,91],["存在感",88,62],["日常性",72,94],["個性",95,74],["ギフト",68,96]],
    aText:["ル ラボは、素材名と番号を前面に出しながら、実際には単純な一素材では終わらない。サンタル33やアナザー13は肌と空気の間に抽象的な膜を作り、誰の香りかまで含めて完成する。", "ラベルや調合の所作も体験の一部で、一本を所有すること自体に儀式感がある。香りで多数派から半歩ずれたい人、同じ一本を深く使い込みたい人に向く。"],
    bText:["ジョー マローンは、ライム、洋梨、セージのように入口が分かりやすい。コロンらしい軽さがあり、季節や服装に合わせて使い分けたり、二本を重ねたりしやすい。", "黒とクリーム色のパッケージは贈り物としても説明しやすい。香水に慣れていない人と香りを共有したいとき、生活へ自然に入れたいときに強い。"],
    decision:"一本を自分の署名に育てたいならル ラボ。朝の気分や季節に合わせて香りを着替えたいならジョー マローン。初めてなら軽い後者、二本目で個性を深めるなら前者という順番も合理的だ。",
    rows:[["印象","抽象的・都会的","明るい・上品"],["使い方","一本を深く使う","重ねづけ・着替え"],["得意な場面","休日・クリエイティブ","仕事・ギフト・日常"],["持ち味","肌との一体感","分かりやすい素材感"]],
    aFit:"人と重なりにくい香りを探し、ラストノートまで自分の肌で育てたい人。",bFit:"強すぎない香りを日常に取り入れ、季節や相手に合わせて選びたい人。",
    faq:[{q:"初めてのニッチ香水ならどちら？",a:"軽さと説明の分かりやすさではジョー マローン。香りの個性をじっくり楽しみたいならル ラボです。"},{q:"重ねづけしやすいのは？",a:"公式にも組み合わせを提案しているジョー マローンが始めやすいです。まず単体を確認してから少量ずつ重ねます。"}],
    brands:[BRANDS.lelabo,BRANDS.jomalone,BRANDS.byredo,BRANDS.diptyque],featured:["le-labo-1","jo-malone-1","le-labo-2","jo-malone-4"],
  }),
  compare({
    slug:"tomford-vs-creed",title:"トム フォードとクリード、高級メンズの頂点を比較",description:"トム フォードとクリードのメンズ香水を、存在感・クラシックさ・夜向き・日常性で図解比較。高価格帯で後悔しない選び方を解説。",
    lead:"高級感の出し方は正反対。トム フォードは濃度で空気を変え、クリードは余裕で空気を支配する。",answer:"夜の官能性と明確な個性ならトム フォード、明るさと成功者らしい余裕ならクリード。",
    a:"Tom Ford",b:"Creed",aKey:"官能的な濃度",bKey:"明るい自信",axes:[["清潔感",62,82],["存在感",97,91],["日常性",55,70],["個性",96,88],["クラシック",76,95]],
    aText:["トム フォードのプライベート ブレンドは、ウード、タバコ、バニラ、レザーなど重い素材を現代的に見せる。ひと吹きで服装や照明まで変わったように感じるほど、世界観が明確だ。", "寒い夜、バー、ドレスアップした場面では強い味方になる。一方、暑い昼やオフィスでは量の調整が難しいため、最初から万能な一本として選ぶより、用途を決めて買う方が満足しやすい。"],
    bText:["クリードの代表的なメンズ香水は、明るいフルーツやシトラスから、木や煙を思わせる余韻へ落ちる構成が得意だ。豪華だが重く見せすぎず、屋外でも輪郭が消えにくい。", "スーツにもカジュアルにも合わせられるが、価格は高い。名前や評判だけで決めず、肌で数時間試し、ラストの乾き方に納得できるかを確認したい。"],
    decision:"香りを夜の主役にするならトム フォード。昼から夜まで、自信のある人物像を明るく見せたいならクリード。どちらも少量で存在感が出るため、価格だけでなく一本を使い切る場面が想像できるかで判断する。",
    rows:[["印象","濃密・官能的","明るい・堂々"],["得意な季節","秋冬","春秋・屋外"],["得意な場面","夜・バー・会食","スーツ・休日・イベント"],["注意点","量を増やしすぎない","評判より肌で確認"]],
    aFit:"黒やブラウンの服が多く、夜の外出で香りまで含めた世界観を作りたい人。",bFit:"高級感は欲しいが暗く重くしたくない。昼のスーツにも合わせたい人。",
    faq:[{q:"高い香水は長持ちする？",a:"価格と持続時間は比例しません。香料構成、濃度、肌、気温で変わるため、必ず肌で確認します。"},{q:"仕事でも使える？",a:"どちらも量を抑えれば使えますが、狭い職場では腰に1プッシュ以下から試すのが安全です。"}],
    brands:[BRANDS.tomford,BRANDS.creed,BRANDS.dior],featured:["tom-ford-1","creed-1","tom-ford-2","dior-6"],
  }),
  compare({
    slug:"aesop-vs-diptyque",title:"アエソップとディプティック、ナチュラル系ニッチの本流",description:"アエソップとディプティックの香水を、植物感・芸術性・日常性・静けさで図解比較。ナチュラル系ニッチの選び分けを解説。",
    lead:"植物の気配は似ていても、アエソップは素材を観察し、ディプティックは情景を描く。",answer:"ハーブや木の質感を近くで楽しむならアエソップ、旅や物語の情景をまといたいならディプティック。",
    a:"Aesop",b:"Diptyque",aKey:"植物と肌の近さ",bKey:"詩的な情景",axes:[["植物感",96,82],["芸術性",78,96],["日常性",88,80],["個性",84,91],["静けさ",93,87]],
    aText:["アエソップはスキンケアから育った背景もあり、香水にもハーブ、根、乾いた木、湿った土のような触覚がある。タシットのシトラスとバジルは、明るいだけでなく青い苦みまで残す。", "肌の近くで静かに香り、部屋や服装と衝突しにくい。無機質な空間、白いシャツ、落ち着いた日常へ自然に置ける。"],
    bText:["ディプティックは香りを一つの景色として見せる。木陰、庭、紙、煙、旅先の空気のように、素材そのものより素材が置かれた場面を想像させる。", "香りの説明を読む時間まで含めて楽しめるため、アートや物語が好きな人に向く。静かだが、意外な組み合わせで記憶に残る。"],
    decision:"生活の道具として毎日使うならアエソップ。香りを小さな作品として集めたいならディプティック。どちらも強さより質感で選ぶブランドなので、紙より肌でラストを比べる。",
    rows:[["世界観","植物研究室","旅とアート"],["香りの距離","肌の近く","情景がふわりと広がる"],["服装","ミニマル・日常着","アート・上品な装い"],["選ぶ楽しさ","素材を読む","物語を読む"]],
    aFit:"ハーブ、木、土の乾いた質感が好き。香りを主張ではなく生活の一部にしたい人。",bFit:"美術、旅、言葉から香りを選びたい。一本ごとの情景を楽しみたい人。",
    faq:[{q:"どちらが香りは弱い？",a:"製品ごとに違います。両ブランドとも穏やかな作品がありますが、肌と気温で拡散が変わるため個別に試してください。"},{q:"仕事向きなのは？",a:"量を抑えればどちらも使えます。清潔で植物的な印象を求めるならアエソップが選びやすいです。"}],
    brands:[BRANDS.aesop,BRANDS.diptyque,BRANDS.lelabo,BRANDS.byredo],featured:["aesop-1","diptyque-1","le-labo-2","byredo-1"],
  }),
  compare({
    slug:"margiela-vs-byredo",title:"マルジェラとバイレード、モダンニッチの新世代",description:"メゾン マルジェラとバイレードを、物語性・日常性・個性・SNS映えで図解比較。現代ニッチ香水の選び方を解説。",
    lead:"マルジェラは記憶の場面を再生し、バイレードは説明しきれない余白を残す。",answer:"情景を分かりやすく楽しむならマルジェラ、抽象的で人と重なりにくい佇まいならバイレード。",
    a:"Maison Margiela",b:"Byredo",aKey:"記憶の再生",bKey:"北欧的な余白",axes:[["清潔感",84,80],["物語性",98,91],["日常性",91,76],["個性",82,95],["ギフト",94,78]],
    aText:["レプリカは『ジャズクラブ』『レイジー サンデー モーニング』のように、名前だけで場面が見える。香水に詳しくなくても入口があり、自分の記憶と重ねやすい。", "香りを説明しやすく、贈り物や初めてのニッチにも向く。作品ごとの差が大きいため、場面の名前だけでなく、ラストに残るムスクやウッドまで確認したい。"],
    bText:["バイレードは、言葉と香りの間に余白を残す。フルーツ、木、煙、花が抽象的につながり、何の香りか一言で説明しにくいところが個性になる。", "ボトルや空間も含めて静かな緊張感があり、香りを自分の内側で楽しみたい人に向く。多数派から離れたいが、大声で主張したくない人に合う。"],
    decision:"初めてのニッチで、香りの物語を人と共有したいならマルジェラ。説明できない違和感や余白まで自分のものにしたいならバイレード。日常性と抽象性のどちらを優先するかで決める。",
    rows:[["物語","具体的な場所・記憶","抽象的な言葉・感情"],["分かりやすさ","高い","あえて曖昧"],["向く人","ニッチ初心者・ギフト","香水好き・自分用"],["印象","親しみやすい","静かで都会的"]],
    aFit:"香水の名前から情景を選びたい。自分の思い出と結びつけたり、贈り物にしたい人。",bFit:"人に説明するより、自分だけが分かる違和感や美しさを楽しみたい人。",
    faq:[{q:"ニッチ初心者にはどちら？",a:"名前と情景が分かりやすいマルジェラが入りやすいです。抽象的な香りを楽しみたいならバイレードを試します。"},{q:"若い人向け？",a:"年齢ではなく世界観の好みで選べます。量と場面を調整すれば幅広い年代で使えます。"}],
    brands:[BRANDS.margiela,BRANDS.byredo,BRANDS.lelabo,BRANDS.diptyque],featured:["maison-margiela-1","byredo-1","maison-margiela-2","le-labo-2"],
  }),
  compare({
    slug:"hermes-vs-acquadiparma",title:"エルメスとアクア ディ パルマ、老舗の上品さの違い",description:"エルメスとアクア ディ パルマの香水を、品格・明るさ・仕事適性・季節で図解比較。大人のメンズ香水の選び方を解説。",
    lead:"エルメスは影のある品格、アクア ディ パルマは太陽の下の品格。",answer:"静かな知性と余韻ならエルメス、明るく親しみやすい上品さならアクア ディ パルマ。",
    a:"Hermès",b:"Acqua di Parma",aKey:"内省的な品格",bKey:"地中海の明るさ",axes:[["清潔感",86,95],["存在感",72,66],["仕事",94,88],["個性",89,78],["明るさ",62,98]],
    aText:["エルメスの香水は、素材を豪華に見せるより、空気や大地、影のような抽象へ変える。乾いたウッド、鉱物、苦みのあるシトラスが、声を張らずに知性を見せる。", "スーツ、会食、静かな休日に合わせやすい。華やかなトップより、数時間後の肌に残る乾いた余韻へ魅力が集まる。"],
    bText:["アクア ディ パルマは、シトラスの明るさを上品に整える。レモンやベルガモットが陽射しのように立ち、石けんや木の清潔な余韻へつながる。", "白いシャツ、春夏、昼の会食に強い。重厚さより、身だしなみの良さと親しみやすさを同時に出したい人に向く。"],
    decision:"相手に一歩考えさせる静かな香りならエルメス。会った瞬間から明るく感じさせるならアクア ディ パルマ。季節で二本を使い分け、秋冬は前者、春夏は後者という選択もきれいだ。",
    rows:[["品の出方","静か・乾いている","明るい・清潔"],["得意な季節","秋冬・通年","春夏"],["服装","スーツ・上質な日常着","白シャツ・軽いジャケット"],["余韻","ウッディ・鉱物的","シトラス・石けん" ]],
    aFit:"落ち着き、知性、少しの苦みを香りに求める。時間が経った余韻を重視する人。",bFit:"明るく清潔な第一印象が欲しい。春夏や昼の予定で気軽に使いたい人。",
    faq:[{q:"ビジネス向きなのは？",a:"どちらも向きます。より静かで落ち着いた印象ならエルメス、明るい清潔感ならアクア ディ パルマです。"},{q:"夏に使いやすいのは？",a:"シトラス中心のアクア ディ パルマが選びやすいですが、汗を拭いてから少量使います。"}],
    brands:[BRANDS.hermes,BRANDS.acquadiparma,BRANDS.guerlain,BRANDS.chanel],featured:["hermes-3","acqua-di-parma-1","hermes-1","acqua-di-parma-2"],
  }),
  compare({
    slug:"bvlgari-vs-versace",title:"ブルガリとヴェルサーチ、イタリア二大ブランドの香水比較",description:"ブルガリとヴェルサーチのメンズ香水を、清潔感・華やかさ・仕事・デート適性で図解比較。年代や場面に合う選び方を解説。",
    lead:"同じイタリアでも、ブルガリは端正に整え、ヴェルサーチは光を集める。",answer:"仕事と清潔感ならブルガリ、デートや夜の華やかさならヴェルサーチ。",
    a:"Bvlgari",b:"Versace",aKey:"控えめな清潔感",bKey:"華やかな押し出し",axes:[["清潔感",95,82],["存在感",64,94],["仕事",94,68],["デート",72,96],["日常性",92,78]],
    aText:["ブルガリのメンズ香水は、紅茶、ムスク、透明なウッド、アクアティックなどを使い、輪郭を端正に整える。日本の湿度やオフィスにも合わせやすく、香水に慣れていない人の一本目になりやすい。", "控えめだから退屈なのではなく、近づいたときに清潔な余韻を残すのが強み。仕事、学校、日常の移動で使う時間が長い人に向く。"],
    bText:["ヴェルサーチは、ミント、青リンゴ、シトラス、甘いウッドなど、入口が明るく分かりやすい。照明のある夜や人の多い場所でも埋もれにくい。", "若々しさと華やかさを出しやすい反面、量を増やすと甘さや拡散が前へ出る。デートでは一度の噴霧から始め、相手との距離を考える。"],
    decision:"朝から夕方まで自然に使うならブルガリ。短い時間で人物像を明るく見せたいならヴェルサーチ。年齢で分けるより、静かな場面とにぎやかな場面のどちらが多いかで決める。",
    rows:[["印象","透明・端正","明るい・官能的"],["得意な場面","仕事・学校・日常","デート・夜・イベント"],["量","調整しやすい","少量でも広がりやすい"],["一本目","安全な王道","個性が分かりやすい"]],
    aFit:"毎日使えて、周囲に強く主張しない一本が欲しい。清潔感を最優先する人。",bFit:"香りで気分を上げ、デートやイベントの第一印象を華やかにしたい人。",
    faq:[{q:"大学生にはどちら？",a:"授業やアルバイト中心ならブルガリ、休日やデートで使う目的ならヴェルサーチが分かりやすいです。"},{q:"女性受けで選ぶなら？",a:"好みは人それぞれです。万人向けの清潔感か、華やかな甘さか、相手の好みと距離で選びます。"}],
    brands:[BRANDS.bvlgari,BRANDS.versace,BRANDS.armani,BRANDS.acquadiparma],featured:["bvlgari-2","versace-3","bvlgari-1","versace-1"],
  }),
  {
    slug:"why-margiela-replica",tag:"DEEP DIVE",title:"なぜマルジェラのレプリカは人気なのか",
    description:"メゾン マルジェラ「レプリカ」が人気の理由を、ネーミング・記憶・香り・SNS・ギフトの5要素から図解して解説します。",
    lead:"レプリカが売っているのは、香料の一覧ではない。誰もが持つ『場所と時間の記憶』へ入るための扉だ。",
    answer:"情景が浮かぶ名前、香りとの一致、説明しやすい物語、統一されたボトル。この四つが、香水初心者にも選びやすい体験を作っています。",
    visual:{type:"story"},
    takeaways:["商品名だけで情景を想像できる", "自分の記憶と結びつけやすい", "人へ説明しやすく、ギフトやSNSと相性がいい"],
    sections:[
      {title:"香水の名前が、すでに短編小説になっている",paragraphs:["ジャズクラブ、レイジー サンデー モーニング、ビーチ ウォーク。レプリカは香料名ではなく、場所と時間を商品名にする。読者はノートを知らなくても、自分の経験から入口を見つけられる。", "『どんな香りが好きか分からない』人でも、『雨上がり』『洗いたてのシーツ』『暖炉の前』なら選べる。専門知識を情景へ翻訳したことが、ニッチ香水の壁を低くした。"]},
      {title:"名前と香りが一致するから、記憶に残る",paragraphs:["物語だけでは一度の話題で終わる。レプリカは、ラムやタバコ、ムスク、ココナッツ、ウッドなどを使い、名前から想像した温度や質感を香りで確かめられるように作る。", "嗅いだ人が『本当にこの場面だ』と感じる瞬間が、商品説明を自分の体験へ変える。香水を買う行為が、好きな記憶を持ち歩く行為になる。"]},
      {title:"並べたくなる統一感と、共有しやすい物語",paragraphs:["白いラベル、薬瓶のようなボトル、同じ書式で記された場所と年代。一本ごとの差を出しながら、コレクション全体は一つに見える。複数を並べても散らからず、次の一本を集めたくなる。", "SNSや会話でも『甘いウッディ』より『ジャズクラブのような夜』の方が伝わりやすい。贈る相手の思い出や生活から選べることも強い。ただし情景の好みと肌での残り方は別なので、最後は試香が必要だ。"]},
    ],
    table:{title:"人気をつくる5つの仕組み",heads:["要素","働き","読者のメリット"],rows:[["情景名","専門語を翻訳","直感で選べる"],["香りの再現","想像を確かめる","記憶に残る"],["統一ボトル","シリーズ化","集めたくなる"],["物語","会話の入口","共有しやすい"],["幅広い場面","選択肢を増やす","自分の一本を探せる"]],note:"人気の理由をSillage編集部が体験設計の観点から整理したものです。"},
    choices:[{title:"初めて選ぶなら",text:"好きな場面を三つに絞り、ムエットで比較。最後に肌で一日試す。"},{title:"贈るなら",text:"相手との共有記憶に近い名前を選び、香りの好みも確認できると失敗が減る。"}],
    faq:[{q:"レプリカはメンズ香水？",a:"性別で限定せず使える作品が多く、場面や香調の好みで選べます。"},{q:"人気作だけを選べば失敗しない？",a:"人気と肌の相性は別です。トップだけで決めず、数時間後のムスクやウッドまで確認してください。"}],
    brands:[BRANDS.margiela,BRANDS.byredo,BRANDS.lelabo,BRANDS.diptyque],featured:["maison-margiela-1","maison-margiela-2","byredo-1","le-labo-2"],
  },
  {
    slug:"concentration-guide",tag:"BASICS",title:"EDT・EDP・パルファムの違い｜濃度だけで選ばない香水入門",
    description:"オードトワレ、オードパルファム、パルファムの違いを図解。持続時間・広がり方・季節・職場での選び方を初心者向けに解説します。",
    modifiedAt:"2026-07-25T12:00:00+09:00",
    lead:"濃いほど上質、長いほど優秀とは限らない。大切なのは、香りを何時間、どの距離で届けたいか。",
    answer:"軽快さと日中の使いやすさならEDT、変化と持続のバランスならEDP、肌の近くで深い余韻を楽しむならパルファムが目安です。",
    visual:{type:"concentration"},
    takeaways:["濃度表記に世界共通の厳密な境界はない", "同じ名前でもEDTとEDPは香りの設計が違う場合がある", "持続時間だけでなく、拡散する距離を見る"],
    sections:[
      {title:"濃度表記は、香りのキャラクターを読む手がかり",paragraphs:["コロン、EDT、EDP、パルファムは一般に香料濃度の違いを示すが、ブランドや製品を横断する厳密な共通規格ではない。EDPだから必ずEDTより長持ちする、とは言い切れない。", "シトラス中心のEDPが軽く、重いウッドを使ったEDTが長く残ることもある。表記は出発点にし、商品ごとの香調と自分の肌で判断する。"]},
      {title:"持続と拡散は、別々に考える",paragraphs:["長く残る香りが遠くまで広がるとは限らない。パルファムは濃くても肌の近くに留まり、EDTは軽くても最初の一時間だけ明るく広がることがある。", "仕事では持続が長くても拡散が穏やかな香りが扱いやすい。屋外イベントでは短時間でも輪郭が出る香りが便利だ。自分が欲しいのは時間か距離かを先に決める。"]},
      {title:"同じシリーズは、濃度違いではなく別作品として試す",paragraphs:["同名のEDTとEDPでも、単に香料を増やしただけでなく、トップやラストの素材が変わることがある。EDTの爽やかさが好きなのに、EDPでは甘さが主役になる例もある。", "店頭では片方だけを先に決めず、左右の手首へ同時につける。30分後の主題と、帰宅後に残る余韻のどちらが生活に合うかを比べる。"]},
    ],
    table:{title:"濃度表記の使い分け目安",heads:["表記","一般的な印象","向く使い方"],rows:[["Cologne","非常に軽快","短時間・暑い日"],["EDT","明るく動きがある","日中・仕事・春夏"],["EDP","厚みと変化のバランス","通年・夕方まで"],["Parfum","深く肌に近い","夜・少量で楽しむ"]],note:"濃度と持続の関係は製品ごとに異なります。数値ではなく一般的な傾向として見てください。"},
    choices:[{title:"一本目なら",text:"使う時間が長い日常用はEDTか軽いEDPから。量を調整しやすいものを選ぶ。"},{title:"二本目なら",text:"同じ香りの濃度違いより、季節や夜用など役割が異なる一本を足すと使い分けやすい。"}],
    faq:[{q:"EDPの方が高級？",a:"濃度と品質は同じ意味ではありません。素材、設計、好み、使う場面で価値は変わります。"},{q:"パルファムは仕事で使えない？",a:"肌の近くに留まる作品もあります。腰など低い位置に少量つけ、実際の拡散を確認します。"}],
    brands:[BRANDS.dior,BRANDS.chanel,BRANDS.ysl],featured:["dior-6","chanel-4","ysl-3"],
  },
  {
    slug:"season-scene-map",tag:"VISUAL GUIDE",title:"季節×シーンで選ぶメンズ香水マップ",
    description:"春夏秋冬と仕事・デート・休日の組み合わせから、失敗しにくい香調を図解。シトラス、ウッディ、ムスク、アンバーの使い分けが分かります。",
    lead:"好きな香りが似合わないのではない。気温と距離に、置く場所が合っていないだけかもしれない。",
    answer:"暑い昼は軽いシトラスやアクアティック、寒い夜はウッディやアンバー。仕事は拡散を抑え、屋外では少し輪郭を出します。",
    visual:{type:"matrix"},
    takeaways:["気温が高いほど甘さと拡散は強く感じやすい", "狭い空間では季節より距離を優先", "同じ香水でも、つける量と場所で季節をまたげる"],
    sections:[
      {title:"季節は『温度』、シーンは『距離』で読む",paragraphs:["暑い日は香りが立ちやすく、甘さや重さを強く感じやすい。寒い日は香りが開きにくく、乾いたウッドやアンバーの厚みが心地よくなる。季節のおすすめは、服の色ではなく空気の動きから考える。", "仕事や映画館は人との距離が近く、逃げ場が少ない。屋外やイベントは空気が動き、香りが散りやすい。同じ夏でも、会議室と海辺では必要な強さが違う。"]},
      {title:"迷ったら、明るさと重さの二軸で選ぶ",paragraphs:["春夏の昼はベルガモット、レモン、ハーブ、軽いムスク。秋冬の夜はシダー、サンダルウッド、バニラ、アンバーが扱いやすい。春の夜や秋の昼は、その中間にある紅茶、アイリス、ドライなスパイスが橋渡しになる。", "香調名を暗記する必要はない。『明るいか暗いか』『空気のように軽いか、布のように厚いか』の二つでムエットを比べると、自分の好みが見えてくる。"]},
      {title:"一本を四季で使う調整法",paragraphs:["春夏は腰や膝の裏に一度、秋冬は胸元や首の後ろに一度。同じ香水でも、鼻との距離と衣服の厚さで届き方が変わる。暑い日に重い香りを使うなら、夜だけにして量を半分へ。", "季節限定の正解に縛られすぎないことも大切だ。好きな香りを禁止するのではなく、場所と量を変えて生活へ合わせる。香水は気温のルールに従う道具ではなく、気分を整える服の一部だからだ。"]},
    ],
    table:{title:"季節と場面の早見表",heads:["季節・場面","狙う印象","香調の例"],rows:[["春・仕事","軽い清潔感","シトラス／ティー"],["夏・休日","涼しさ","アクアティック／ハーブ"],["秋・デート","柔らかな深み","アイリス／ウッディ"],["冬・夜","温かい余韻","アンバー／バニラ"]],note:"重い香りを暑い日に使う場合は、量を減らし屋外や夜へ場面を移します。"},
    choices:[{title:"暑い日の合言葉",text:"明るく、薄く、低い位置。足りないくらいから始める。"},{title:"寒い日の合言葉",text:"乾いた木と柔らかな甘さ。コートの内側で近くに留める。"}],
    faq:[{q:"夏にウッディは使えない？",a:"軽く乾いたウッディなら使えます。量を減らし、夜や屋外から試してください。"},{q:"冬にシトラスは軽すぎる？",a:"ウッドやムスクが土台にあるシトラスなら冬にも合わせやすいです。"}],
    brands:[BRANDS.hermes,BRANDS.jomalone,BRANDS.tomford,BRANDS.bvlgari],featured:["hermes-3","jo-malone-1","tom-ford-1","bvlgari-2"],
  },
  {
    slug:"first-fragrance",tag:"START HERE",title:"香水初心者の一本目｜失敗しない5ステップ",
    description:"初めての香水を選ぶ5ステップを図解。予算・場面・香調・試香・購入サイズまで、店頭で迷わない順番が分かります。",
    modifiedAt:"2026-07-25T12:00:00+09:00",
    lead:"最初の一本は、最も個性的な香りではなく、最も多く使える香りから選ぶ。好き嫌いは使う回数の中で育つ。",
    answer:"用途を一つ決め、3本まで絞り、肌で半日試し、小さい容量から買う。人気順位より『次に使う日が想像できるか』を優先します。",
    visual:{type:"flow"},
    takeaways:["最初に使う場面を一つ決める", "一日に試すのは2〜3本まで", "30分後と帰宅後の香りで決める"],
    sections:[
      {title:"一本目は、香調より先に用途を決める",paragraphs:["『一番いい香水』を探すと候補が増え続ける。仕事、休日、デートのうち、最も使う場面を一つだけ決めると、必要な強さと方向が見える。仕事なら清潔感、休日なら自分の好み、デートなら距離感が軸になる。", "一年中一本で使いたいなら、シトラスから軽いウッディやムスクへ落ちる香りが扱いやすい。夜だけなら甘さやスパイスを増やせる。"]},
      {title:"店頭では三本まで、肌では二本まで",paragraphs:["ムエットで入口を比べ、残った二本を左右の手首へ。つけた直後に決めず、店を出て30分後、可能なら数時間後まで確認する。コーヒー豆で鼻を戻そうとするより、新鮮な空気を吸い休む方が比較しやすい。", "メモは『好き／嫌い』だけでなく、『白いシャツ』『雨の日』『少し甘い』のように場面と言葉を残す。後日、別の香水と比べる共通の物差しになる。"]},
      {title:"人気・価格・容量の落とし穴",paragraphs:["人気作は比較の基準にはなるが、自分の肌で同じ印象になるとは限らない。高価格だから似合うわけでも、長持ちするわけでもない。最初は予算の上限を決め、サンプルや小容量があれば優先する。", "100mLの割安感より、30mLを使い切る経験の方が次の一本を上手に選べる。香水は開封後の保管場所にも気を使う。直射日光と高温多湿を避け、箱や引き出しで温度変化を抑える。"]},
    ],
    table:{title:"5ステップの判断基準",heads:["手順","決めること","合格ライン"],rows:[["1 用途","仕事・休日・デート","使う日を言える"],["2 方向","明るい・落ち着く・甘い","3系統以内"],["3 試香","ムエット→肌","2本まで"],["4 時間","直後・30分後・数時間後","ラストも好き"],["5 容量","サンプル・小容量","使い切れる"]],note:"購入を急がず、別の日に同じ香りを試すと鼻と気分による差を確認できます。"},
    choices:[{title:"安全な一本目",text:"シトラス、アロマティック、軽いウッディ、ムスク。仕事と休日をつなぎやすい。"},{title:"個性ある一本目",text:"好きな場面が明確なら、甘いアンバーやレザーも候補。ただし小容量から。"}],
    faq:[{q:"初心者向けの価格帯は？",a:"金額より、無理なく使い切れる容量と用途を優先します。サンプルや30mL前後があれば比較しやすいです。"},{q:"通販だけで買ってもいい？",a:"香りは肌で変わるため、可能なら店頭やサンプルで試してからが安全です。通販では返品条件も確認します。"}],
    brands:[BRANDS.chanel,BRANDS.bvlgari,BRANDS.jomalone,BRANDS.hermes],featured:["chanel-1","bvlgari-2","jo-malone-1","hermes-3"],
  },
];

const allArticles = [...articles, ...PROBLEM_ARTICLES, ...BEGINNER_ARTICLES].map(applyColumnTaxonomy);

const esc = (s="") => String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");

function itemInfo(slug) {
  const html = readFileSync(join("public", "items", `${slug}.html`), "utf8");
  const data = FRAGRANCE_BY_SLUG.get(slug);
  const image = html.match(/<meta property="og:image" content="([^"]+)">/)?.[1];
  const name = html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]?.replace(/<[^>]+>/g, "").trim();
  const brandName = html.match(/<span class="brand">(.*?)<\/span>/s)?.[1]?.replace(/<[^>]+>/g, "").trim()
    || html.match(/<p class="brand">(.*?)<\/p>/s)?.[1]?.replace(/<[^>]+>/g, "").trim()
    || html.match(/<p class="brand-line">(.*?)<\/p>/s)?.[1]?.replace(/<[^>]+>/g, "").trim()
    || "香水";
  return { slug, image, name: name || slug, brand: brandName, sources: data?.sources || [] };
}

function articleSources(article, items) {
  const productSources = items.flatMap((item) => item.sources
    .filter((source) => source?.url && source.sourceType === "official")
    .map((source) => ({
      publisher: source.publisher || "公式サイト",
      title: source.title || `${item.brand}の商品情報`,
      url: source.url,
      note: "掲載商品の名称・濃度・ノート等を確認",
    })));
  const unique = new Map();
  for (const source of [...article.sources, ...productSources]) {
    if (source?.url && !unique.has(source.url)) unique.set(source.url, source);
  }
  return [...unique.values()].slice(0, 5);
}

// フェーズA: related-mapping.json を第一候補に「次に読む」を8本組み立てる。
// 表示ラベルは mapping の label ではなく、対象記事の実タイトルを使う。
// mapping に無い記事や本数不足のときは従来ロジックで補完する。
function relatedArticles(article, all) {
  const LIMIT = 8;
  const bySlug = new Map(all.map((item) => [item.slug, item]));
  const picked = [];
  const seen = new Set([article.slug]);
  const push = (candidate, category) => {
    if (!candidate || seen.has(candidate.slug) || picked.length >= LIMIT) return;
    seen.add(candidate.slug);
    picked.push({ ...candidate, relatedCategory: category || categoryLabelOf(candidate) });
  };

  for (const entry of RELATED_MAP[article.slug] || []) push(bySlug.get(entry.slug), entry.category);

  // 以下は不足時の補完（従来の優先順位を踏襲）
  (article.relatedArticleSlugs || []).forEach((slug) => push(bySlug.get(slug)));
  all.filter((c) => c.category === article.category).forEach((c) => push(c));
  all.forEach((c) => push(c));

  return picked.slice(0, LIMIT);
}

function categoryLabelOf(candidate) {
  return COLUMN_CATEGORIES[candidate.category]?.label || "";
}

function displayDate(value) {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo" }).format(new Date(value));
}

function renderVisual(v) {
  if (v.type === "steps") {
    return `<figure class="visual-panel problem-visual" aria-label="${esc(v.title)}">
      <div class="visual-kicker">ACTION MAP</div><h2>${esc(v.title)}</h2>
      <div class="problem-steps flow-chart">${v.steps.map(([number,title,text])=>`<div class="problem-step flow-step"><span>${esc(number)}</span><b>${esc(title)}</b><small style="display:block;margin-top:6px;color:#808187;font-size:10px">${esc(text)}</small></div>`).join("")}</div>
      <figcaption>${esc(v.caption)}</figcaption></figure>`;
  }
  if (v.type === "traits") {
    return `<figure class="visual-panel" aria-label="${esc(v.title)}">
      <div class="visual-kicker">QUALITATIVE GUIDE</div><h2>${esc(v.title)}</h2>
      <dl class="trait-list">${v.traits.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>
      <figcaption>数値評価ではなく、職場で周囲へ配慮するための定性的な目安です。</figcaption></figure>`;
  }
  if (v.type === "bars" || v.type === "compare") {
    const bars = v.type === "bars" ? v.bars.map(([label,value])=>[label,value,null]) : v.axes;
    return `<figure class="visual-panel" aria-label="${esc(v.title || `${v.a}と${v.b}の比較グラフ`)}">
      <div class="visual-kicker">VISUAL GUIDE</div><h2>${esc(v.title || `${v.a} / ${v.b} 印象比較`)}</h2>
      ${v.type === "compare" ? `<div class="chart-legend"><span class="legend-a">${esc(v.a)}</span><span class="legend-b">${esc(v.b)}</span></div>` : ""}
      <div class="score-chart">${bars.map(([label,a,b])=>`<div class="score-row"><span>${esc(label)}</span><div class="score-track"><i class="score-a" style="width:${a}%"></i>${b == null ? "" : `<i class="score-b" style="width:${b}%"></i>`}</div>${b == null ? `<b>${a}</b>` : ""}</div>`).join("")}</div>
      <figcaption>${v.type === "compare" ? "香調構成と場面適性から見たSillage編集部の相対評価" : "数値はSillage編集部が選びやすさのために整理した相対指標"}</figcaption></figure>`;
  }
  if (v.type === "body") return `<figure class="visual-panel body-map"><div class="visual-kicker">SPRAY MAP</div><h2>つける位置で変わる、香りの距離</h2><svg viewBox="0 0 680 320" role="img" aria-label="首、手首、腰、膝の裏の香り方を示す身体図"><defs><linearGradient id="bodyGlow" x1="0" x2="1"><stop stop-color="#c9b558"/><stop offset="1" stop-color="#c4889c"/></linearGradient></defs><circle cx="340" cy="54" r="30" fill="none" stroke="#ddd9d2" stroke-width="2"/><path d="M340 84v112M278 113l62 25 62-25M302 138l-30 76M378 138l30 76M340 196l-37 98M340 196l37 98" fill="none" stroke="#ddd9d2" stroke-width="4" stroke-linecap="round"/><g fill="url(#bodyGlow)"><circle cx="340" cy="102" r="9"/><circle cx="274" cy="215" r="9"/><circle cx="340" cy="183" r="9"/><circle cx="372" cy="282" r="9"/></g><g fill="#b8b6b1" font-size="14"><text x="380" y="105">首：輪郭が出る</text><text x="120" y="220">手首：自分で確認しやすい</text><text x="380" y="188">腰：穏やかに立つ</text><text x="400" y="286">膝裏：低く広がる</text></g><path d="M360 102h16M282 215h-20M350 183h26M382 282h14" stroke="#55565c"/></svg><figcaption>仕事や初心者は腰、試香は手首、夜の外出は首の後ろが目安</figcaption></figure>`;
  if (v.type === "timeline") return `<figure class="visual-panel"><div class="visual-kicker">SCENT TIMELINE</div><h2>香りは重なりながら主役を変える</h2><div class="note-timeline"><div class="note-layer top"><b>TOP</b><span>シトラス・ハーブ</span><i></i></div><div class="note-layer middle"><b>MIDDLE</b><span>花・スパイス・主題</span><i></i></div><div class="note-layer last"><b>LAST</b><span>ウッド・ムスク・余韻</span><i></i></div><div class="time-axis"><span>0分</span><span>30分</span><span>3時間</span><span>6時間〜</span></div></div><figcaption>境界は連続的。購入判断はミドルとラストまで待つ</figcaption></figure>`;
  if (v.type === "concentration") return `<figure class="visual-panel"><div class="visual-kicker">CONCENTRATION</div><h2>濃度より、時間と距離で選ぶ</h2><div class="concentration-chart">${[["COLOGNE",28,"軽快"],["EDT",48,"日中"],["EDP",72,"厚み"],["PARFUM",92,"余韻"]].map(([n,h,s])=>`<div class="conc"><div class="conc-bar" style="height:${h}%"></div><b>${n}</b><span>${s}</span></div>`).join("")}</div><figcaption>高さは一般的な濃度傾向のイメージ。製品を横断する厳密な規格ではありません</figcaption></figure>`;
  if (v.type === "matrix") return `<figure class="visual-panel"><div class="visual-kicker">SEASON × SCENE</div><h2>気温と距離で置き場所を決める</h2><div class="season-matrix"><div><b>暑い × 近い</b><span>シトラス／ムスク</span><small>薄く・低い位置</small></div><div><b>暑い × 遠い</b><span>アクアティック／ハーブ</span><small>明るく輪郭を出す</small></div><div><b>寒い × 近い</b><span>ドライウッド／アイリス</span><small>柔らかな深み</small></div><div><b>寒い × 遠い</b><span>アンバー／スパイス</span><small>温かく存在感</small></div></div><figcaption>近い＝会議室・会食、遠い＝屋外・イベントを想定</figcaption></figure>`;
  if (v.type === "flow") return `<figure class="visual-panel"><div class="visual-kicker">5 STEP FLOW</div><h2>最初の一本を決める順番</h2><div class="flow-chart">${[["01","用途"],["02","方向"],["03","試香"],["04","時間"],["05","容量"]].map(([n,t],i)=>`<div class="flow-step"><span>${n}</span><b>${t}</b>${i<4?"<i>→</i>":""}</div>`).join("")}</div><figcaption>人気順位ではなく、使う日を想像できるかを順に確認する</figcaption></figure>`;
  if (v.type === "story") return `<figure class="visual-panel"><div class="visual-kicker">STORY ENGINE</div><h2>情景が香りを記憶へ変える</h2><div class="story-loop"><div><span>01</span><b>名前</b><small>場面が浮かぶ</small></div><i>→</i><div><span>02</span><b>香り</b><small>温度を確かめる</small></div><i>→</i><div><span>03</span><b>記憶</b><small>自分の物語になる</small></div><i>→</i><div><span>04</span><b>共有</b><small>人へ語りたくなる</small></div></div><figcaption>専門語を情景へ翻訳したことが、レプリカの入口を広げた</figcaption></figure>`;
  return "";
}

function renderTable(table) {
  if (!table) return "";
  return `<section class="data-section"><p class="section-no">DATA</p><h2>${esc(table.title)}</h2><div class="table-scroll"><table><caption>${esc(table.title)}の条件別一覧</caption><thead><tr>${table.heads.map(x=>`<th scope="col">${esc(x)}</th>`).join("")}</tr></thead><tbody>${table.rows.map(r=>`<tr>${r.map((x,index)=>index===0?`<th scope="row">${esc(x)}</th>`:`<td data-label="${esc(table.heads[index])}">${esc(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><p class="data-note">${esc(table.note)}</p></section>`;
}

function renderArticle(article, all) {
  const canonical = `${SITE}/columns/${article.slug}`;
  const items = article.featured.map(itemInfo);
  const category = COLUMN_CATEGORIES[article.category];
  const sources = articleSources(article, items);
  const publishedAt = article.publishedAt || PUBLISHED;
  const modifiedAt = article.modifiedAt || MODIFIED;
  const image = familyOgpUrl(ARTICLE_FAMILY[article.slug]) || `${SITE}/ogp-default.png`;
  const title = `${article.title}｜${SITE_COPY.siteName}`;
  const articleLd = {"@context":"https://schema.org","@type":"Article",headline:article.title,description:article.description,url:canonical,mainEntityOfPage:canonical,author:{"@type":"Organization",name:`${SITE_COPY.shortName}編集部`,url:`${SITE}/about.html#update-policy`},publisher:{"@type":"Organization",name:SITE_COPY.shortName},inLanguage:"ja",datePublished:publishedAt,dateModified:modifiedAt,...(image?{image}:{})};
  const breadcrumbLd = {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Sillage",item:`${SITE}/`},{"@type":"ListItem",position:2,name:"香水コラム",item:`${SITE}/guides.html`},{"@type":"ListItem",position:3,name:article.title,item:canonical}]};
  const faqLd = {"@context":"https://schema.org","@type":"FAQPage",mainEntity:article.faq.map(x=>({"@type":"Question",name:x.q,acceptedAnswer:{"@type":"Answer",text:x.a}}))};
  const others = relatedArticles(article, all);
  const sections = article.sections.map((s,i)=>`<section class="text-section" id="section-${i+1}"><p class="section-no">${String(i+1).padStart(2,"0")}</p><h2>${esc(s.title)}</h2>${s.paragraphs.map(p=>`<p>${esc(p)}</p>`).join("")}</section>`).join("");
  const toc = article.sections.map((s,i)=>`<a href="#section-${i+1}"><span>${String(i+1).padStart(2,"0")}</span>${esc(s.title)}</a>`).join("");
  const sourceHtml = sources.map((source) => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.publisher)}｜${esc(source.title)}<span>${esc(source.note || "記事内容の確認に使用")}</span></a></li>`).join("");
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(canonical)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(canonical)}`;
  return `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0d0e10">
<title>${esc(title)}</title><meta name="description" content="${esc(article.description)}"><meta name="google-site-verification" content="UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q">
<!-- Google tag (gtag.js) --><script async src="https://www.googletagmanager.com/gtag/js?id=G-60BQRQWB5M"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-60BQRQWB5M');</script>
<link rel="canonical" href="${canonical}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(article.description)}"><meta property="og:url" content="${canonical}">${image?`<meta property="og:image" content="${esc(image)}">`:""}<meta property="og:site_name" content="${esc(SITE_COPY.shortName)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(article.description)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Cormorant:ital,wght@0,400;1,400&family=Shippori+Mincho:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(articleLd)}</script><script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script><script type="application/ld+json">${JSON.stringify(faqLd)}</script>
<style>
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{background:#0d0e10;color:#e9e7e3;font-family:"Zen Kaku Gothic New",system-ui,sans-serif;line-height:1.8;-webkit-font-smoothing:antialiased}.topbar{display:flex;align-items:center;justify-content:space-between;padding:14px clamp(16px,4vw,48px);border-bottom:1px solid #292a2f;background:rgba(13,14,16,.92);position:sticky;top:0;z-index:20;backdrop-filter:blur(10px)}.logo{font-family:"Bodoni Moda",serif;font-size:24px;letter-spacing:2px;color:#eeeae4;text-decoration:none}.pr-tag{font-size:10px;letter-spacing:1px;color:#8c8c92;border:1px solid #303137;border-radius:999px;padding:4px 10px}.article-shell{max-width:980px;margin:auto;padding:48px clamp(18px,5vw,58px) 80px}.crumb{font:italic 14px "Cormorant",serif;color:#87878d;margin-bottom:30px}.crumb a{color:#b9b9be;text-decoration:none}.eyebrow{font:11px "Bodoni Moda",serif;letter-spacing:3px;color:#c9b558}.hero h1{font:600 clamp(28px,5.2vw,48px)/1.45 "Shippori Mincho",serif;color:#fff;letter-spacing:.8px;max-width:20ch;margin:13px 0 18px}.lead{font:400 clamp(15px,2vw,18px)/2 "Shippori Mincho",serif;color:#c9c7c2;max-width:42em}.answer-box{margin:32px 0;padding:23px 25px;border:1px solid #3a3b40;border-left:3px solid #c9b558;border-radius:0 12px 12px 0;background:linear-gradient(135deg,#18191d,#121316)}.answer-box span{display:block;font:italic 13px "Cormorant",serif;color:#c9b558;letter-spacing:1px;margin-bottom:6px}.answer-box p{font-size:15px;line-height:1.9;color:#f0eeea}.visual-panel{margin:38px 0;background:radial-gradient(circle at 85% 10%,rgba(196,136,156,.11),transparent 34%),linear-gradient(145deg,#1b1c20,#121316);border:1px solid #34353a;border-radius:18px;padding:28px clamp(18px,4vw,36px);overflow:hidden}.visual-kicker,.section-no{font:10px "Bodoni Moda",serif;letter-spacing:2.5px;color:#c9b558}.visual-panel h2,.data-section h2{font:500 clamp(20px,3vw,28px)/1.5 "Shippori Mincho",serif;color:#f5f3ef;margin:5px 0 23px}.visual-panel figcaption{font-size:11.5px;color:#7f8087;margin-top:19px}.chart-legend{display:flex;gap:18px;justify-content:flex-end;font:11px "Bodoni Moda",serif;margin-bottom:15px}.chart-legend span:before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}.legend-a:before{background:#c9b558}.legend-b:before{background:#c4889c}.score-chart{display:grid;gap:13px}.score-row{display:grid;grid-template-columns:80px 1fr 30px;gap:12px;align-items:center;font-size:12px;color:#bdbbb7}.score-track{height:13px;background:#26272c;border-radius:999px;position:relative;overflow:hidden}.score-track i{position:absolute;left:0;height:5px;border-radius:999px}.score-a{top:1px;background:#c9b558}.score-b{bottom:1px;background:#c4889c}.score-row b{font:12px "Bodoni Moda",serif;color:#d9d6cf}.toc{margin:36px 0 48px;padding:21px 24px;background:#141519;border:1px solid #2d2e33;border-radius:12px}.toc>span{font:italic 13px "Cormorant",serif;color:#8c8c92;display:block;margin-bottom:8px}.toc a{display:flex;gap:12px;color:#c9c7c2;text-decoration:none;font-size:13px;padding:7px 0;border-bottom:1px solid #24252a}.toc a:last-child{border:none}.toc a span{font-family:"Bodoni Moda",serif;color:#5f6067}.takeaways{margin:0 0 54px}.takeaways h2,.choices h2,.faq h2{font:500 clamp(21px,3vw,29px) "Shippori Mincho",serif;margin-bottom:18px}.takeaway-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;counter-reset:take}.takeaway-grid div{min-height:125px;padding:18px;background:#18191d;border:1px solid #303137;border-radius:12px;font-size:13px;line-height:1.75;color:#d2d0cb}.takeaway-grid div:before{counter-increment:take;content:"0" counter(take);display:block;font:12px "Bodoni Moda",serif;color:#c9b558;margin-bottom:10px}.text-section{max-width:760px;margin:0 auto 58px}.text-section h2{font:600 clamp(22px,3.5vw,31px)/1.55 "Shippori Mincho",serif;color:#f6f3ee;margin:5px 0 20px}.text-section p{font-size:15px;line-height:2.08;color:#cfcdc8;margin-bottom:20px}.text-section p:first-of-type:first-letter{font-family:"Shippori Mincho",serif;font-size:1.42em;color:#fff}.data-section{margin:58px 0;padding:28px clamp(16px,4vw,34px);border:1px solid #34353a;border-radius:16px;background:#15161a}.table-scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;min-width:560px}th,td{text-align:left;padding:13px 12px;border-bottom:1px solid #303137;font-size:13px;vertical-align:top}th{font:11px "Bodoni Moda",serif;letter-spacing:1px;color:#c9b558}td{color:#c9c7c2}.data-note{font-size:11.5px;color:#74757b;margin-top:15px}.choices{margin:60px 0}.choice-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.choice{padding:22px;background:linear-gradient(145deg,#1a1b1f,#131417);border:1px solid #34353a;border-radius:14px}.choice h3{font:500 18px "Shippori Mincho",serif;color:#f3f0eb;margin-bottom:9px}.choice p{font-size:13.5px;line-height:1.85;color:#bdbbb6}.faq{margin:64px 0}.faq details{border-top:1px solid #303137;padding:17px 3px}.faq details:last-child{border-bottom:1px solid #303137}.faq summary{cursor:pointer;font:500 15px "Shippori Mincho",serif;color:#e5e2dd}.faq details p{font-size:13.5px;color:#aaa8a3;line-height:1.9;padding:12px 0 0}.note-timeline{padding:12px 0}.note-layer{display:grid;grid-template-columns:75px 150px 1fr;gap:12px;align-items:center;margin:12px 0}.note-layer b{font:11px "Bodoni Moda",serif}.note-layer span{font-size:12px;color:#a9a7a2}.note-layer i{height:13px;border-radius:999px}.note-layer.top i{width:38%;background:#aeb0b6}.note-layer.middle i{width:72%;background:#c9b558}.note-layer.last i{width:100%;background:#c4889c}.time-axis{display:flex;justify-content:space-between;margin-left:237px;border-top:1px solid #45464c;padding-top:7px;font-size:10px;color:#74757b}.body-map svg{width:100%;height:auto}.concentration-chart{height:250px;display:flex;align-items:flex-end;justify-content:center;gap:clamp(18px,5vw,54px);border-bottom:1px solid #44454b;padding:0 12px}.conc{height:100%;width:72px;display:flex;flex-direction:column;justify-content:flex-end;align-items:center}.conc-bar{width:100%;background:linear-gradient(#c4889c,#c9b558);border-radius:10px 10px 0 0;opacity:.82}.conc b{font:10px "Bodoni Moda",serif;margin-top:9px}.conc span{font-size:10px;color:#7f8087}.season-matrix{display:grid;grid-template-columns:1fr 1fr;gap:10px}.season-matrix div{padding:20px;border:1px solid #393a40;border-radius:12px;background:rgba(255,255,255,.02)}.season-matrix b,.season-matrix span,.season-matrix small{display:block}.season-matrix b{font:14px "Shippori Mincho",serif;color:#f0ede8}.season-matrix span{font-size:12px;color:#c9b558;margin:7px 0}.season-matrix small{font-size:11px;color:#898a90}.flow-chart,.story-loop{display:flex;align-items:center;justify-content:center;gap:8px}.flow-step,.story-loop div{flex:1;min-width:0;text-align:center;padding:17px 8px;border:1px solid #393a40;border-radius:12px;background:rgba(255,255,255,.025)}.flow-step span,.story-loop span{display:block;font:11px "Bodoni Moda",serif;color:#c9b558}.flow-step b,.story-loop b{display:block;font:500 14px "Shippori Mincho",serif;margin-top:5px}.flow-step i,.story-loop>i{position:absolute;color:#65666c}.flow-step{position:relative}.flow-step i{right:-10px;top:35%}.story-loop>i{position:static}.story-loop small{display:block;font-size:10px;color:#808187;margin-top:6px}.related,.featured,.other,.related-columns,.share-tools{margin-top:48px;border-top:1px solid #303137;padding-top:25px}.related h2,.featured h2,.other h2,.related-columns h2{font:italic 18px "Cormorant",serif;color:#aaa9ae;margin-bottom:14px}.chips{display:flex;flex-wrap:wrap;gap:8px}.chips a{display:inline-flex;align-items:center;min-height:44px;padding:7px 15px;border:1px solid #3a3b40;border-radius:999px;color:#e2dfda;text-decoration:none;font:12px "Bodoni Moda",serif}.featured a,.other a{display:block;color:#c9c7c2;text-decoration:none;font-size:13.5px;padding:11px 0;border-bottom:1px solid #25262b}.related-list{list-style:none;padding:0;display:grid;grid-template-columns:1fr;gap:12px}.related-list li{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 16px;background:rgba(233,231,227,.02);border:1px solid rgba(233,231,227,.06);border-radius:4px;transition:background .2s ease,border-color .2s ease}.related-list li:hover{background:rgba(233,231,227,.04);border-color:rgba(201,181,88,.3)}.related-list a{color:#e9e7e3;text-decoration:none;font-size:13.5px;line-height:1.6;flex-grow:1;border:none;padding:0;display:block;min-height:auto}.cat-badge{font:italic 11px Georgia,serif;color:#c9b558;letter-spacing:.4px;flex-shrink:0;opacity:.8}.column-cta{margin:48px 0 40px;padding:36px 22px;background:linear-gradient(180deg,rgba(196,136,156,.04),rgba(201,181,88,.03));border:1px solid rgba(201,181,88,.15);border-radius:6px;text-align:center}.cta-lead{font:500 20px "Shippori Mincho",serif;color:#e9e7e3;margin:0 0 24px;letter-spacing:.06em}.cta-grid{display:grid;grid-template-columns:1fr;gap:12px}.cta-card{display:flex;flex-direction:column;align-items:center;gap:8px;padding:22px 16px;background:rgba(13,14,16,.5);border:1px solid rgba(233,231,227,.08);border-radius:4px;text-decoration:none;min-height:44px;transition:transform .2s ease,border-color .2s ease,background .2s ease}.cta-card:hover{transform:translateY(-2px);border-color:#c9b558;background:rgba(13,14,16,.7)}.cta-icon{font:20px/1 Georgia,serif;color:#c9b558}.cta-title{font-size:15px;color:#e9e7e3;font-weight:500;letter-spacing:.04em}.cta-desc{font-size:11px;color:#8c8c92;line-height:1.5}@media(min-width:720px){.related-list{grid-template-columns:1fr 1fr;gap:14px}.cta-grid{grid-template-columns:repeat(3,1fr);gap:16px}}.share-tools p{font:italic 14px "Cormorant",serif;color:#88898f;margin-bottom:12px}.share-actions{display:flex;flex-wrap:wrap;gap:8px}.share-actions a,.share-actions button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:8px 17px;border:1px solid #393a40;border-radius:999px;background:transparent;color:#e9e7e3;text-decoration:none;font:500 12px "Zen Kaku Gothic New",sans-serif;cursor:pointer}.backhome{display:inline-block;margin-top:45px;color:#e8e5df;text-decoration:none;border-bottom:1px solid #c9b558;font:italic 16px "Cormorant",serif}footer{background:#141519;border-top:1px solid #2b2c31;padding:35px clamp(18px,5vw,58px);font-size:11.5px;color:#83848a;line-height:1.8}footer a{color:#aaa9ae}@media(max-width:680px){.pr-tag{display:none}.article-shell{padding-top:32px}.takeaway-grid,.choice-grid{grid-template-columns:1fr}.takeaway-grid div{min-height:0}.score-row{grid-template-columns:72px 1fr 24px}.note-layer{grid-template-columns:54px 1fr}.note-layer i{grid-column:1/-1}.time-axis{margin-left:0}.season-matrix{grid-template-columns:1fr}.flow-chart,.story-loop{flex-wrap:wrap}.flow-step,.story-loop div{flex:1 1 42%}.flow-step i,.story-loop>i{display:none}.visual-panel{border-radius:14px}.body-map svg text{font-size:11px}.concentration-chart{gap:10px}.conc{width:58px}}
.trait-list{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:#34353a;border:1px solid #34353a}.trait-list div{display:flex;justify-content:space-between;gap:18px;background:#17181c;padding:16px}.trait-list dt{color:#9c9da3}.trait-list dd{color:#f0ede8;font-family:"Shippori Mincho",serif}.article-meta{display:flex;flex-wrap:wrap;gap:8px 20px;margin:18px 0 0;color:#87888e;font-size:12px}.category-link{display:inline-flex;align-items:center;min-height:38px;color:#c9b558;text-decoration:none;border-bottom:1px solid #7b6e38}.sources,.article-credit{margin-top:48px;border-top:1px solid #303137;padding-top:25px}.sources h2,.article-credit h2{font:italic 18px "Cormorant",serif;color:#aaa9ae;margin-bottom:14px}.source-list{list-style:none}.source-list a{display:block;color:#c9c7c2;text-decoration:none;font-size:13.5px;padding:11px 0;border-bottom:1px solid #25262b}.source-list span{display:block;color:#85868c;font-size:11px}.editorial-note,.article-credit p{font-size:12.5px;color:#99999f;line-height:1.9}caption{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}a:focus-visible,button:focus-visible,summary:focus-visible{outline:2px solid #c9b558;outline-offset:4px}@media(max-width:680px){.trait-list{grid-template-columns:1fr}.table-scroll{overflow:visible}table{min-width:0}thead{position:absolute;width:1px;height:1px;overflow:hidden}table,tbody,tr,th,td{display:block}tr{padding:12px 0;border-bottom:1px solid #303137}th,td{border:0;padding:4px 0}tbody th{font-size:13px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
.browse{margin-top:48px;border-top:1px solid #303137;padding-top:25px}.browse h2{font:italic 18px "Cormorant",serif;color:#aaa9ae;margin-bottom:14px}.browse-links{display:grid;grid-template-columns:1fr 1fr;gap:10px}.browse a{display:flex;align-items:center;min-height:48px;padding:10px 14px;border:1px solid #34353a;color:#e1ded8;text-decoration:none;font-size:13px}@media(max-width:680px){.browse-links{grid-template-columns:1fr}td[data-label]:before{content:attr(data-label);display:block;font-size:10px;letter-spacing:1px;color:#8d8e94}}
</style></head><body><header class="topbar"><a class="logo" href="/">Sillage</a><span class="pr-tag">PR・アフィリエイト広告を含みます</span></header>
<main class="article-shell"><p class="crumb"><a href="/">Sillage</a> ／ <a href="/guides.html">香水コラム</a> ／ ${esc(category.label)}</p><header class="hero"><a class="category-link" href="/guides.html#category-${esc(article.category)}">${esc(category.label)}の記事一覧</a><span class="eyebrow">${esc(article.tag)} ／ SILLAGE EDITORIAL</span><h1>${esc(article.title)}</h1><p class="lead">${esc(article.lead)}</p><p class="article-meta"><span>著者：Sillage編集部</span><span>公開日：<time datetime="${publishedAt}">${displayDate(publishedAt)}</time></span><span>更新日：<time datetime="${modifiedAt}">${displayDate(modifiedAt)}</time></span></p></header>
<aside class="answer-box"><span>30秒で分かる結論</span><p>${esc(article.answer)}</p></aside>${renderVisual(article.visual)}
<nav class="toc" aria-label="目次"><span>contents ／ この記事で分かること</span>${toc}<a href="#data"><span>DATA</span>${esc(article.table.title)}</a></nav>
<section class="takeaways"><h2>先に押さえる3つ</h2><div class="takeaway-grid">${article.takeaways.map(x=>`<div>${esc(x)}</div>`).join("")}</div></section><div class="body">${sections}</div><div id="data">${renderTable(article.table)}</div>
<section class="choices"><h2>あなたには、こちら</h2><div class="choice-grid">${article.choices.map(x=>`<div class="choice"><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`).join("")}</div></section>
<section class="faq"><h2>よくある質問</h2>${article.faq.map(x=>`<details><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join("")}</section>
<nav class="browse" aria-label="香調・シーン別の商品一覧"><h2>香調・シーンから香水を探す</h2><div class="browse-links"><a href="/#fragrance-wheel">香調ホイールから香水を絞り込む</a><a href="/#find-fragrances">シーン・季節の条件から香水を絞り込む</a></div></nav>
<section class="related"><h2>登場・関連ブランド</h2><div class="chips">${article.brands.map(x=>`<a href="${x.href}">${esc(x.name)}</a>`).join("")}</div></section>
<section class="featured"><h2>関連する香水を詳しく見る</h2>${items.map(x=>`<a href="/items/${x.slug}">${esc(x.name)}の香りを見る →</a>`).join("")}</section>
<section class="related-columns"><h2>次に読む</h2><ul class="related-list">${others.map(x=>`<li><a href="/columns/${x.slug}">${esc(x.title)}</a>${x.relatedCategory?`<span class="cat-badge">${esc(x.relatedCategory)}</span>`:""}</li>`).join("")}</ul></section>
<section class="column-cta"><p class="cta-lead">読んで、実際に選ぶ。</p><div class="cta-grid"><a class="cta-card" href="/#diagnosis"><span class="cta-icon">◇</span><span class="cta-title">診断で見つける</span><span class="cta-desc">6問で自分に合うブランドを診断</span></a><a class="cta-card" href="/#find-fragrances"><span class="cta-icon">○</span><span class="cta-title">香調から探す</span><span class="cta-desc">系統色で92本の香水を比較</span></a><a class="cta-card" href="/#brand-index"><span class="cta-icon">△</span><span class="cta-title">ブランドで探す</span><span class="cta-desc">47ブランドの掲載一覧</span></a></div></section>
<section class="sources"><h2>情報源と編集区分</h2>${sourceHtml?`<ul class="source-list">${sourceHtml}</ul>`:""}<p class="editorial-note">商品名・濃度・ノート等は掲載商品の公式情報を優先し、使う量・場面・選び方はSillage編集部の判断として区別して記載しています。製品の表示と各施設のルールを優先してください。</p></section>
<section class="article-credit"><h2>この記事について</h2><p>Sillage編集部が、公開情報と掲載中の商品データを照合して作成しました。詳しい確認方法は<a href="/about.html#update-policy">編集方針・更新ポリシー</a>をご覧ください。</p></section>
<section class="share-tools"><p>share ／ 役立ったら共有</p><div class="share-actions"><a href="${xUrl}" target="_blank" rel="noopener">Xで共有</a><a href="${lineUrl}" target="_blank" rel="noopener">LINEで送る</a><button type="button" onclick="shareSillage(this)">リンクをコピー</button></div></section><a class="backhome" href="/">← Sillageトップへ戻る</a></main>
<footer>当サイトはアフィリエイトプログラムを利用し、商品紹介により収益を得ています。本文とグラフはブランド公開情報と香調構成をもとにしたSillage編集部の独自整理であり、香りの感じ方には個人差があります。<br><a href="/">${esc(SITE_COPY.footerLabel)}</a> ・ <a href="/about.html#update-policy">編集方針・更新ポリシー</a></footer>
<script>async function shareSillage(button){if(navigator.share){try{await navigator.share({title:document.title,url:location.href});return}catch(e){if(e&&e.name==='AbortError')return}}if(navigator.clipboard){await navigator.clipboard.writeText(location.href);button.textContent='コピーしました'}}</script></body></html>`;
}

function renderGuideIndex() {
  const canonical = `${SITE}/guides.html`;
  const title = `香水コラム｜初心者の疑問・つけ方・選び方を解説｜${SITE_COPY.shortName}`;
  const description = "香水初心者の一本目から、つけ方、試香、保存、シーン別の選び方、ブランド比較まで。疑問から読めるSillageの香水コラム一覧です。";
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Sillage 香水コラム",
    numberOfItems: allArticles.length,
    itemListElement: allArticles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE}/columns/${article.slug}`,
      name: article.title,
    })),
  };
  const categoryNav = Object.entries(COLUMN_CATEGORIES).map(([key, category]) =>
    `<a href="#category-${key}">${esc(category.heading)}</a>`
  ).join("");
  const categorySections = Object.entries(COLUMN_CATEGORIES).map(([key, category]) => {
    const categoryArticles = allArticles.filter((article) => article.category === key);
    const startArticle = categoryArticles.find((article) => article.slug === category.startSlug) || categoryArticles[0];
    const cards = categoryArticles.map((article) => `<article class="guide-card">
      <span>${esc(category.label)} ／ ${esc(article.tag)}</span>
      <h3><a href="/columns/${article.slug}">${esc(article.title)}</a></h3>
      <p>${esc(article.description)}</p>
      <a class="read" href="/columns/${article.slug}" aria-label="${esc(article.title)}を読む">「${esc(article.title)}」を読む →</a>
    </article>`).join("");
    return `<section class="category-section" id="category-${key}" aria-labelledby="category-${key}-title">
      <div class="category-head"><p class="eyebrow">${esc(category.label)}</p><h2 id="category-${key}-title">${esc(category.heading)}</h2><p>${esc(category.description)}</p>${startArticle?`<a class="start-link" href="/columns/${startArticle.slug}">最初に読む「${esc(startArticle.title)}」</a>`:""}</div>
      <div class="guide-grid">${cards}</div>
    </section>`;
  }).join("");
  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0d0e10">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="google-site-verification" content="UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q">
<!-- Google tag (gtag.js) --><script async src="https://www.googletagmanager.com/gtag/js?id=G-60BQRQWB5M"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-60BQRQWB5M');</script>
<link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${SITE}/ogp-default.png"><meta property="og:site_name" content="${esc(SITE_COPY.shortName)}"><meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(itemListLd)}</script>
<style>*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#0d0e10;color:#e9e7e3;font-family:system-ui,-apple-system,"Yu Gothic",sans-serif;line-height:1.8}.top{display:flex;justify-content:space-between;align-items:center;padding:15px clamp(18px,4vw,52px);border-bottom:1px solid #292a2f}.top a{color:#eeeae4;text-decoration:none}.logo{font-family:Georgia,serif;font-size:24px;letter-spacing:2px}.top nav{display:flex;gap:18px;font-size:12px}.shell{max-width:1180px;margin:auto;padding:clamp(54px,8vw,92px) clamp(18px,4vw,48px) 100px}.eyebrow{font:italic 13px Georgia,serif;color:#c9b558;letter-spacing:2px}.hero h1{font-family:"Yu Mincho",serif;font-size:clamp(31px,5vw,55px);line-height:1.45;max-width:18ch;margin:12px 0 20px}.hero>p,.category-head>p{max-width:700px;color:#bdbbb7;font-size:15px}.category-nav{display:flex;flex-wrap:wrap;gap:8px;margin:36px 0 76px}.category-nav a{display:inline-flex;align-items:center;min-height:44px;padding:8px 15px;border:1px solid #35363b;color:#ddd9d2;text-decoration:none;font-size:12px}.category-section{scroll-margin-top:20px;margin-top:82px}.category-head h2{font-family:"Yu Mincho",serif;font-size:clamp(25px,4vw,38px);margin:5px 0 12px}.start-link{display:inline-block;margin-top:15px;color:#c9b558;text-decoration:none;border-bottom:1px solid #766a39}.guide-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#303137;border:1px solid #303137;margin-top:28px}.guide-card{background:#15161a;padding:28px 25px;min-height:295px;display:flex;flex-direction:column}.guide-card>span{font:11px Georgia,serif;color:#8f8f95;letter-spacing:1px}.guide-card h3{font-family:"Yu Mincho",serif;font-size:20px;line-height:1.65;margin:12px 0}.guide-card h3 a{color:#f1eee8;text-decoration:none}.guide-card p{color:#aaa8a3;font-size:13px;margin:0 0 20px}.read{margin-top:auto;color:#c9b558;text-decoration:none;font-size:12px}.guide-card :focus-visible,.top a:focus-visible,.category-nav a:focus-visible,.start-link:focus-visible{outline:2px solid #c9b558;outline-offset:4px}.back{display:inline-block;margin-top:68px;color:#ddd9d2;text-decoration:none;border-bottom:1px solid #c9b558}@media(max-width:900px){.guide-grid{grid-template-columns:1fr 1fr}}@media(max-width:600px){.top nav{display:none}.guide-grid{grid-template-columns:1fr}.guide-card{min-height:0}.shell{padding-top:48px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}</style></head>
<body><header class="top"><a class="logo" href="/">Sillage</a><nav aria-label="主要ナビゲーション"><a href="/#fragrances">香水を探す</a><a href="/#diagnosis">香水診断</a></nav></header>
<main class="shell"><header class="hero"><p class="eyebrow">SILLAGE EDITORIAL GUIDE</p><h1>香水の疑問から、選び方を見つける。</h1><p>${esc(description)}</p></header>
<nav class="category-nav" aria-label="コラムカテゴリ">${categoryNav}</nav>${categorySections}<a class="back" href="/">Sillageトップへ戻る</a>　<a class="back" href="/about.html#update-policy">編集方針・更新ポリシー</a></main></body></html>`;
}

for (const article of allArticles) {
  const html = renderArticle(article, allArticles).replace(/[ \t]+\n/g, "\n");
  writeFileSync(join(OUT, `${article.slug}.html`), html);
}
writeFileSync(join("public", "guides.html"), renderGuideIndex().replace(/[ \t]+\n/g, "\n"));

function renderHomeColumns() {
  const groups = [
    { heading: "初心者向け", description: "最初の一本を選ぶ順番から確認する。", slugs: ["first-fragrance", "perfume-bottle-size", "how-to-test-perfume"] },
    { heading: "よく読まれる悩み", description: "起きやすい失敗を、次の行動へ変える。", slugs: ["too-much-perfume", "why-cant-smell-own-perfume", "perfume-on-clothes"] },
    { heading: "新着・更新", description: "量、持続、贈り方を具体的に見直す。", slugs: ["how-many-sprays", "make-perfume-last-longer", "perfume-gift-guide"] },
  ];
  const sections = groups.map((group) => {
    const cards = group.slugs.map((slug) => {
      const article = allArticles.find((candidate) => candidate.slug === slug);
      if (!article) throw new Error(`home column missing: ${slug}`);
      return `<a class="home-column-card" href="/columns/${article.slug}"><span>${esc(COLUMN_CATEGORIES[article.category].label)}</span><strong>${esc(article.title)}</strong><small>${esc(article.description)}</small></a>`;
    }).join("");
    return `<section class="home-column-group"><div><h3>${esc(group.heading)}</h3><p>${esc(group.description)}</p></div><div class="home-column-grid">${cards}</div></section>`;
  }).join("");
  return `<style data-home-columns>
.home-columns{max-width:1240px;margin:80px auto 0;padding:0 clamp(16px,4vw,48px) 30px}.home-column-group{margin-top:38px}.home-column-group>div:first-child{display:flex;align-items:baseline;justify-content:space-between;gap:20px;margin-bottom:14px}.home-column-group h3{font:500 clamp(20px,3vw,27px) "Shippori Mincho",serif;color:#f2efea}.home-column-group p{font-size:12px;color:#88898f}.home-column-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#303137;border:1px solid #303137}.home-column-card{display:flex;flex-direction:column;gap:8px;min-height:210px;padding:24px;background:#15161a;color:#e9e7e3;text-decoration:none}.home-column-card>span{font:10px "Bodoni Moda",serif;letter-spacing:1px;color:#c9b558}.home-column-card strong{font:500 17px/1.7 "Shippori Mincho",serif;color:#f4f1ec}.home-column-card small{font-size:12px;line-height:1.8;color:#96969c}.home-column-card:focus-visible,.home-columns-link:focus-visible{outline:2px solid #c9b558;outline-offset:4px}.home-columns-link{display:inline-block;margin-top:28px;color:#c9b558;text-decoration:none;border-bottom:1px solid #776b39}@media(max-width:768px){.home-column-group>div:first-child{display:block}.home-column-grid{grid-template-columns:1fr}.home-column-card{min-height:0}.home-column-group p{margin-top:5px}}@media(prefers-reduced-motion:reduce){.home-column-card{transition:none}}
</style><section class="home-columns" aria-labelledby="home-columns-title"><div class="section-head"><p class="kick">— editorial guide</p><h2 id="home-columns-title">香水選びを、疑問から学ぶ</h2><p class="section-copy">トップでは9記事だけを厳選。すべての記事は、悩みや目的に合うカテゴリから探せます。</p></div>${sections}<a class="home-columns-link" href="/guides.html">香水コラムをカテゴリからすべて見る →</a></section>`;
}

const homeFragmentPath = join("public", "index.html");
const homeFragment = readFileSync(homeFragmentPath, "utf8");
const homeStart = "<!-- generated:home-columns:start -->";
const homeEnd = "<!-- generated:home-columns:end -->";
const homeStartIndex = homeFragment.indexOf(homeStart);
const homeEndIndex = homeFragment.indexOf(homeEnd);
if (homeStartIndex === -1 || homeEndIndex === -1 || homeEndIndex < homeStartIndex) {
  throw new Error("home column markers missing");
}
const homeBlock = `${homeStart}\n${renderHomeColumns()}\n${homeEnd}`;
writeFileSync(homeFragmentPath, `${homeFragment.slice(0, homeStartIndex)}${homeBlock}${homeFragment.slice(homeEndIndex + homeEnd.length)}`);
console.log(`Generated ${allArticles.length} enriched column pages in ${Object.keys(COLUMN_CATEGORIES).length} categories`);
