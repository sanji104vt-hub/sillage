
/* ---------- families + scent line-art icons (24x24, centered at 12,12) ---------- */
const ICONS = {
  citrus:`<circle cx="12" cy="12" r="8"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="6.3" y1="6.3" x2="17.7" y2="17.7"/><line x1="17.7" y1="6.3" x2="6.3" y2="17.7"/><circle cx="12" cy="12" r="1.4"/>`,
  aromatic:`<line x1="12" y1="3" x2="12" y2="21"/><path d="M12 8 C 15 7, 17 8, 18 6"/><path d="M12 12 C 9 11, 7 12, 6 10"/><path d="M12 16 C 15 15, 17 16, 18 14"/>`,
  floral:`<circle cx="12" cy="12" r="2.3"/><ellipse cx="12" cy="6.2" rx="2.3" ry="3.6"/><ellipse cx="12" cy="6.2" rx="2.3" ry="3.6" transform="rotate(72 12 12)"/><ellipse cx="12" cy="6.2" rx="2.3" ry="3.6" transform="rotate(144 12 12)"/><ellipse cx="12" cy="6.2" rx="2.3" ry="3.6" transform="rotate(216 12 12)"/><ellipse cx="12" cy="6.2" rx="2.3" ry="3.6" transform="rotate(288 12 12)"/>`,
  fruity:`<circle cx="11" cy="14" r="6"/><path d="M13 8 C 15 4, 18 4, 19 5 C 18 8, 15 9, 13 8 Z"/><line x1="12.5" y1="9" x2="11.5" y2="11.5"/>`,
  gourmand:`<path d="M9 3 C 6 8, 6 16, 9 21 C 12 16, 12 8, 9 3 Z"/><path d="M15 3 C 12 8, 12 16, 15 21 C 18 16, 18 8, 15 3 Z"/>`,
  amber:`<path d="M12 3 C 7 10, 8 20, 12 20 C 16 20, 17 10, 12 3 Z"/><path d="M12 9 C 10.5 12, 11 16, 12 16.5"/>`,
  woody:`<path d="M3.5 13 a8.5 8.5 0 0 1 17 0"/><path d="M6.5 13 a5.5 5.5 0 0 1 11 0"/><path d="M9.5 13 a2.5 2.5 0 0 1 5 0"/><line x1="12" y1="13" x2="12" y2="20"/>`,
  chypre:`<path d="M12 3 C 6 7, 6 16, 12 21 C 18 16, 18 7, 12 3 Z"/><line x1="12" y1="6" x2="12" y2="19"/><path d="M12 10 L 8.5 8"/><path d="M12 10 L 15.5 8"/><path d="M12 14 L 8.5 12.5"/><path d="M12 14 L 15.5 12.5"/>`,
  musk:`<path d="M12 12 m-1 0 a1 1 0 1 1 2 0.4 a3 3 0 1 1 -5 -1 a5.4 5.4 0 1 1 9.5 2.5 a7.8 7.8 0 1 1 -13 -3"/>`,
  aquatic:`<path d="M3 9 q3 -3 6 0 t6 0 t6 0"/><path d="M3 14 q3 -3 6 0 t6 0 t6 0"/><path d="M3 19 q3 -3 6 0 t6 0 t6 0"/>`,
};
const FAMILIES = [
  {key:"citrus", ja:"シトラス", en:"CITRUS", color:"#c9b558", desc:"レモンやベルガモットが弾ける、最も明るく清潔感のある系統。日中や夏、香水入門に向き、誰からも好かれやすい。"},
  {key:"aromatic", ja:"アロマティック", en:"AROMATIC", color:"#93a384", desc:"ラベンダーやハーブを核にした伝統的な清潔感。フゼアとも呼ばれ、石けんのような安心感でビジネスの定番。"},
  {key:"floral", ja:"フローラル", en:"FLORAL", color:"#c4889c", desc:"花束のような華やかさ。花の種類や組み合わせで、透明感のあるものから濃密なものまで幅広い。"},
  {key:"fruity", ja:"フルーティ", en:"FRUITY", color:"#d18a64", desc:"りんごやベリーなど果実の甘酸っぱさ。親しみやすく華やかで、デートや若い世代に好まれる。"},
  {key:"gourmand", ja:"グルマン", en:"GOURMAND", color:"#ba8a57", desc:"バニラやキャラメル、コーヒーを思わせる甘い系統。秋冬や、距離の近い夜の場面で魅力を放つ。"},
  {key:"amber", ja:"アンバー", en:"AMBER", color:"#c98c42", desc:"樹脂やスパイスの温かく官能的な甘さ。オリエンタルとも呼ばれ、冬やフォーマルで強い存在感を出す。"},
  {key:"woody", ja:"ウッディ", en:"WOODY", color:"#927152", desc:"サンダルウッドやシダーなど乾いた木の香り。落ち着きと品格があり、日常からフォーマルまで合わせやすい。"},
  {key:"chypre", ja:"シプレ", en:"CHYPRE", color:"#7f8d5a", desc:"ベルガモットとオークモスの対比が生む、ほろ苦く知的な系統。クラシックで個性が際立つ。"},
  {key:"musk", ja:"ムスク", en:"MUSK", color:"#a59cb4", desc:"肌のぬくもりのような清潔で官能的な残り香。軽く万人受けし、素肌っぽい自然な香りづけに。"},
  {key:"aquatic", ja:"アクアティック", en:"AQUATIC", color:"#6c98ad", desc:"海風や水を思わせる透明感のある清涼系。夏やスポーツ、ビジネスで爽やかに香らせたいときに。"},
];
const FAM = Object.fromEntries(FAMILIES.map(f=>[f.key,f]));

/* ---------- sample data (brand & notes = public info; verdict = our own editorial) ---------- */
let PERFUMES = [];

let BRANDS = [];
const GENDER={men:"メンズ",women:"レディース",unisex:"ユニセックス"};
const SCENE={business:"ビジネス",date:"デート",formal:"フォーマル",daily:"デイリー",sports:"スポーツ"};
const SEASON={spring:"春",summer:"夏",autumn:"秋",winter:"冬"};
const PRICE={petit:"プチプラ",mid:"ミドル",high:"ハイブランド"};
const state={family:null,scene:null,season:null,gender:null,price:null};

/* ---------- geometry ---------- */
const SVGNS="http://www.w3.org/2000/svg";
const CX=150,CY=150,R_O=128,R_I=62,R_ICON=86,R_NAME=116,R_NUM=140;
function polar(r,aDeg){const a=(aDeg-90)*Math.PI/180;return[CX+r*Math.cos(a),CY+r*Math.sin(a)];}
function arc(rO,rI,a0,a1){
  const[xo0,yo0]=polar(rO,a0),[xo1,yo1]=polar(rO,a1),[xi1,yi1]=polar(rI,a1),[xi0,yi0]=polar(rI,a0);
  const big=a1-a0>180?1:0;
  return`M${xo0} ${yo0} A${rO} ${rO} 0 ${big} 1 ${xo1} ${yo1} L${xi1} ${yi1} A${rI} ${rI} 0 ${big} 0 ${xi0} ${yi0} Z`;
}
function el(tag,attrs,html){const e=document.createElementNS(SVGNS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(html!=null)e.innerHTML=html;return e;}

/* ---------- build wheel ---------- */
function buildWheel(){
  const root=document.getElementById("wheelRoot");
  const n=FAMILIES.length,step=360/n;
  FAMILIES.forEach((f,i)=>{
    const a0=i*step,a1=(i+1)*step,mid=(a0+a1)/2;
    const g=el("g",{class:"sector","data-fam":f.key,tabindex:"0",role:"button","aria-label":`${f.ja}で香水を絞り込む`,"aria-pressed":"false"});
    g.style.cursor="pointer";
    g.addEventListener("click",()=>toggleFamily(f.key));
    g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggleFamily(f.key);}});
    g.addEventListener("mouseenter",()=>setHub(f.key));
    g.addEventListener("mouseleave",()=>setHub(state.family));

    // faint colored sector face
    g.appendChild(el("path",{d:arc(R_O,R_I,a0,a1),fill:f.color,class:"seg-face"}));

    // scent line-art icon, centered on sector
    const[ix,iy]=polar(R_ICON,mid);
    const ic=el("g",{class:"ficon",stroke:f.color,
      transform:`translate(${ix.toFixed(2)} ${iy.toFixed(2)}) scale(0.92) translate(-12 -12)`}, ICONS[f.key]);
    g.appendChild(ic);

    // english family name along the arc (outer band)
    let na0=a0,na1=a1,sweep=1;
    if(mid>90&&mid<270){na0=a1;na1=a0;sweep=0;}
    const[nx0,ny0]=polar(R_NAME,na0),[nx1,ny1]=polar(R_NAME,na1);
    const big=Math.abs(na1-na0)>180?1:0,pid="nm"+i;
    g.appendChild(el("path",{id:pid,d:`M${nx0} ${ny0} A${R_NAME} ${R_NAME} 0 ${big} ${sweep} ${nx1} ${ny1}`,fill:"none"}));
    const nt=el("text",{class:"wname"});
    const ntp=el("textPath",{startOffset:"50%"}); ntp.setAttribute("text-anchor","middle");
    ntp.setAttribute("href","#"+pid); ntp.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","#"+pid);
    ntp.textContent=f.en; nt.appendChild(ntp); g.appendChild(nt);

    // index number, horizontal, outermost
    const[numx,numy]=polar(R_NUM,mid);
    g.appendChild(el("text",{class:"wnum",x:numx.toFixed(2),y:(numy+2.5).toFixed(2),"text-anchor":"middle"},
      String(i+1).padStart(2,"0")));

    root.appendChild(g);
  });
  setHub(null);
}
function setHub(famKey){
  const main=document.getElementById("hubMain"),sub=document.getElementById("hubSub");
  if(famKey){
    const f=FAM[famKey];
    main.textContent=f.ja;
    main.setAttribute("style",'font-family:"Shippori Mincho",serif;font-weight:600;font-size:14px;letter-spacing:1px;fill:#f2f0ec');
    sub.textContent=f.en;
  }else{
    main.textContent="Sillage";
    main.setAttribute("style",'font-family:"Bodoni Moda",serif;font-style:italic;font-weight:500;font-size:18px;letter-spacing:1px;fill:#f0eeea');
    sub.textContent="FRAGRANCE WHEEL";
  }
}
function toggleFamily(k){
  state.family=state.family===k?null:k;
  loadDeferredHome().then(safeRender).catch(()=>{});
}

/* ---------- chips ---------- */
function buildChips(id,map,field){
  const box=document.getElementById(id);
  Object.entries(map).forEach(([val,label])=>{
    const b=document.createElement("button");
    b.type="button";b.className="chip";b.textContent=label;b.dataset.val=val;b.setAttribute("aria-pressed","false");
    b.onclick=()=>{state[field]=state[field]===val?null:val;safeRender();};
    box.appendChild(b);
  });
}

function prefersReducedMotion(){return window.matchMedia("(prefers-reduced-motion: reduce)").matches;}
function initAnchorNavigation(){
  document.querySelectorAll('.hero-actions a[href^="#"],.beginner-card[href^="#"]').forEach(link=>{
    if(link.dataset.anchorBound==="true")return;
    link.dataset.anchorBound="true";
    link.addEventListener("click",async event=>{
      const hash=link.getAttribute("href");
      let target=document.querySelector(hash);
      if(!target){
        event.preventDefault();
        history.pushState(null,"",hash);
        try{
          await loadDeferredHome();
          target=document.querySelector(hash);
        }catch{
          return;
        }
      }
      if(!target)return;
      event.preventDefault();
      if(location.hash!==hash)history.pushState(null,"",hash);
      const top=target.getBoundingClientRect().top+window.scrollY-78;
      window.scrollTo({top,behavior:prefersReducedMotion()?"auto":"smooth"});
    });
  });
}
function initFilterShortcuts(){
  document.querySelectorAll(".filter-shortcut").forEach(button=>{
    if(button.dataset.shortcutBound==="true")return;
    button.dataset.shortcutBound="true";
    button.addEventListener("click",async()=>{
      const field=button.dataset.filterField,value=button.dataset.filterValue;
      if(!(field in state))return;
      state[field]=state[field]===value?null:value;
      try{await loadDeferredHome();}catch{return;}
      safeRender();
      document.getElementById("fragrances").scrollIntoView({behavior:prefersReducedMotion()?"auto":"smooth",block:"start"});
    });
  });
}
function applyFiltersFromUrl(){
  const params=new URLSearchParams(window.location.search);
  const allowed={family:FAM,scene:SCENE,season:SEASON,gender:GENDER,price:PRICE};
  Object.entries(allowed).forEach(([field,values])=>{
    const value=params.get(field);
    if(value&&Object.prototype.hasOwnProperty.call(values,value))state[field]=value;
  });
}

/* ---------- render ---------- */
function matches(p){
  if(state.family&&p.family!==state.family)return false;
  if(state.scene&&!p.scenes.includes(state.scene))return false;
  if(state.season&&!p.seasons.includes(state.season))return false;
  if(state.gender&&p.gender!==state.gender)return false;
  if(state.price&&p.priceTier!==state.price)return false;
  return true;
}
function card(p){
  const f=FAM[p.family];const c=f.color;
  const visual = p.img
    ? `<div class="flacon"><img class="photo" src="${p.img}" alt="${p.brand} ${p.name}" loading="lazy">
        <span class="fam-pill" style="background:${c}">${f.ja}</span>
        <span class="gender-pill">${GENDER[p.gender]}</span>
      </div>`
    : `<div class="flacon no-photo" style="background:radial-gradient(120% 90% at 50% 122%,${c}33,transparent 70%)">
        <span class="fam-pill" style="background:${c}">${f.ja}</span>
        <span class="gender-pill">${GENDER[p.gender]}</span>
        <div class="bottle" style="background:linear-gradient(165deg,${c}d9,${c}6b)"></div>
      </div>`;
  const buyHref = p.purchaseLinks?.rakuten?.url || "#";
  return`
  <article class="card" style="--family:${c}">
    ${visual}
    <div class="card-body">
      <div class="product-heading">
        <span class="brandname">${p.brand}</span>
        <h3 class="pname">${p.slug?`<a class="product-name-link" href="/items/${p.slug}">${p.name}</a>`:p.name}</h3>
      </div>
      <div class="info-label">香りの変化</div>
      <div class="pyramid">
        <div class="row"><span class="lv lv-top">Top</span><span>${p.top}</span></div>
        <div class="row"><span class="lv lv-mid">Mid</span><span>${p.mid}</span></div>
        <div class="row"><span class="lv lv-last">Last</span><span>${p.last}</span></div>
      </div>
      <div class="meta-wrap">
        <div class="info-label">似合う季節・場面</div>
        <div class="meta">
          ${p.seasons.map(s=>`<span class="tag">${SEASON[s]}</span>`).join("")}
          ${p.scenes.map(s=>`<span class="tag">${SCENE[s]}</span>`).join("")}
        </div>
      </div>
      <p class="verdict" style="border-left-color:${c}"><span class="vlabel">Sillage の見立て</span>${p.verdict}</p>
      <div class="card-foot">
        <span class="price"><span class="price-label">参考価格</span>${p.price}<span class="tier">${PRICE[p.priceTier]}</span></span>
      </div>
      <div class="card-actions">
        ${p.slug?`<a class="item-link" href="/items/${p.slug}">香りを詳しく見る</a>`:`<span></span>`}
        <a class="buy" href="${buyHref}" target="_blank" rel="nofollow sponsored noopener">楽天で価格を見る ↗</a>
      </div>
    </div>
  </article>`;
}
function render(){
  if(!Array.isArray(PERFUMES)||!PERFUMES.length)throw new Error("香水データを利用できません");
  const grid=document.getElementById("grid");
  grid.setAttribute("aria-busy","true");
  document.querySelectorAll(".sector").forEach(s=>{
    const k=s.getAttribute("data-fam");
    s.classList.toggle("active",k===state.family);
    s.classList.toggle("dim",state.family&&k!==state.family);
    s.setAttribute("aria-pressed",String(k===state.family));
  });
  setHub(state.family);
  [["sceneChips","scene"],["seasonChips","season"],["genderChips","gender"],["priceChips","price"]]
    .forEach(([id,field])=>document.querySelectorAll("#"+id+" .chip")
      .forEach(c=>{const on=state[field]===c.dataset.val;c.classList.toggle("on",on);c.setAttribute("aria-pressed",String(on));}));
  document.querySelectorAll(".filter-shortcut").forEach(button=>{
    const on=state[button.dataset.filterField]===button.dataset.filterValue;
    button.classList.toggle("is-active",on);button.setAttribute("aria-pressed",String(on));
  });
  const list=PERFUMES.filter(matches);
  const filtered=Object.values(state).some(Boolean);
  const summary=document.getElementById("resultsSummary");
  summary.innerHTML=list.length?(filtered?`<b>${list.length}</b>件が見つかりました`:`全<b>${list.length}</b>件の香水`):"条件に合う香水がありません";
  document.getElementById("activeFam").textContent=state.family?FAM[state.family].ja:"";
  grid.innerHTML=list.length?list.map(card).join("")
    :`<div class="empty"><div class="big">条件に合う香水がありません</div>条件をゆるめるか、「reset all」で全件に戻せます。</div>`;
  [...grid.children].forEach((el,i)=>el.style.animationDelay=(i*40)+"ms");
  grid.setAttribute("aria-busy","false");
}
function showProductError(error){
  console.error("香水一覧の表示に失敗しました",error);
  document.getElementById("resultsSummary").textContent="香水の表示に失敗しました";
  const grid=document.getElementById("grid");
  grid.setAttribute("aria-busy","false");
  grid.innerHTML=`<div class="empty" role="alert"><div class="big">香水を表示できませんでした</div>ページを再読み込みして、もう一度お試しください。</div>`;
}
function safeRender(){try{render();}catch(error){showProductError(error);}}


/* ---------- columns (original editorial) ---------- */
const COLUMNS = [
 {tag:"GUIDE", slug:"how-to-wear", visual:"body", title:"香水のつけ方、適量という正解",
  lead:"香水は「足りない」より「やりすぎ」で失敗する。強さの設計こそ、最初に覚えたい作法。",
  body:["香水でまず失敗するのは、量だ。自分の鼻はすぐに香りに慣れる（順応する）ため、つけた本人ほど『弱い』と感じてしまい、つい重ねがけしてしまう。だが周囲はそうではない。基本は、オードトワレで1〜2プッシュ、濃度の高いオードパルファンなら1プッシュで十分だと考えておきたい。",
   "つける位置は、体温が高く香りが立ちのぼる場所——手首、首筋の少し下、胸元が定番だ。ただしビジネスや満員電車を想定するなら、あえて足首や腰など下半身につけ、香りをふんわり上らせる方が上品にまとまる。こすり合わせると分子が壊れて香りが変わるため、手首は自然に乾かすこと。",
   "シーンで強さを変えるのも大人の流儀。オフィスや会食では『すれ違ってほのかに香る』程度、プライベートのデートでは『距離が近づいて気づく』程度が心地よい。香りすぎたと思ったら、無香料の保湿クリームを上から重ねると角が取れる。最後に、つけてから外出までは10分ほど置くと、アルコールが飛んで本来の香りで出かけられる。"]},
 {tag:"BASICS", slug:"notes-pyramid", visual:"timeline", title:"トップ・ミドル・ラストの読み方",
  lead:"ひとつの香水は、時間とともに三幕で表情を変える。香調ピラミッドが読めると、選び方が変わる。",
  body:["香水の香りは一定ではない。揮発の速い順に、トップノート（つけて数分〜10分）、ミドルノート（30分〜2時間)、ラストノート（数時間後〜)へと移り変わる。この三層構造を『香調ピラミッド』と呼ぶ。店頭でムエットに吹いた瞬間の香りはトップでしかなく、本当の印象はミドルからラストで決まる。",
   "トップは第一印象を担う華やかなパート。シトラスやハーブなど軽い香料が置かれることが多い。ミドルは香水の『顔』で、フローラルやスパイスなどそのフレグランスの個性が現れる。ラストは肌に残る土台で、ウッディやムスク、バニラなど重く長く続く香料が支える。残り香（シヤージュ）の印象は、ほぼここで決まる。",
   "だから試香では、つけてすぐ判断せず、最低でも数時間は肌で追ってほしい。本サイトの各商品カードにはこの三層を明記している。トップが好みでも、ラストが好みと違えば長くは愛用できない。逆に、トップが地味でもラストに惹かれる香りは、長く付き合える一本になりやすい。"]},
 {tag:"MEN'S", slug:"business-fragrance", visual:"business", title:"ビジネスで外さない香りの条件",
  lead:"仕事の場で問われるのは、強さではなく節度。清潔感を最短で手に入れる選び方。",
  body:["ビジネスシーンの香りは、自己主張ではなく配慮で選ぶ。原則は三つ。ひとつ、香調は清潔感のある系統——シトラス、アロマティック（フゼア)、軽いウッディ、ムスクが無難。甘いグルマンや濃厚なアンバーは魅力的だが、日中のオフィスでは重く感じられやすい。",
   "ふたつ、濃度と量を抑える。オードトワレを1プッシュ、もしくは肌にごく近い距離でだけ香る『パーソナルスペース内』の強さに留める。会議室や商談の密室で香りが充満するのは、能力評価とは別のところで印象を損なう。香りは、相手が近づいたときに『清潔な人だ』と感じる程度がちょうどいい。",
   "みっつ、季節に合わせる。夏は涼しげなアクアティックやシトラスで爽やかに、冬は乾いたウッディで落ち着いた品格を。迷うなら、ブルー ドゥ シャネルやアクア ディ ジオのような『万人が清潔だと感じる』定番から始めるのが安全だ。香りで個性を出すのは、信頼を得てからでも遅くない。"]},
 {tag:"BASICS", slug:"concentration-guide", visual:"concentration", title:"EDT・EDP・パルファムの違い",
  lead:"濃いほど上質、長いほど優秀とは限らない。時間と距離から、自分に必要な濃度を選ぶ。",
  body:["EDT、EDP、パルファムは香料濃度の一般的な目安。ただしブランドを横断する厳密な境界ではなく、同じEDPでも広がり方や持続は異なる。","長く残ることと遠くまで香ることも別。仕事では肌の近くに留まる香り、屋外では短時間でも輪郭が出る香りが扱いやすい。","同じ名前のEDTとEDPも別作品として左右の手首で比較する。30分後と帰宅後のどちらが生活に合うかで決めたい。"]},
 {tag:"VISUAL GUIDE", slug:"season-scene-map", visual:"matrix", title:"季節×シーンで選ぶメンズ香水マップ",
  lead:"気温と人との距離を掛け合わせると、好きな香りを置くべき場所が見えてくる。",
  body:["暑い日は香りが立ちやすく、甘さも強く感じやすい。寒い日は乾いたウッドやアンバーの厚みが心地よくなる。","会議室や会食は距離が近く、屋外は空気が動く。同じ夏でも、密室と海辺では必要な強さが違う。","季節で好きな香りを禁止するのではなく、つける位置と量を変えて生活へ合わせるのが上手な使い方。"]},
 {tag:"START HERE", slug:"first-fragrance", visual:"flow", title:"香水初心者の一本目｜失敗しない5ステップ",
  lead:"人気順位からではなく、使う場面から選ぶ。初めてでも迷わない順番を一枚の図に。",
  body:["最初に仕事、休日、デートのうち最も使う場面を一つ決める。用途が決まると必要な強さと香調が絞れる。","一日に試すのは三本まで。ムエットから二本を残し、左右の手首で30分後と数時間後を比べる。","最初は小容量やサンプルを優先する。大容量の割安感より、一本を使い切る経験が次の選択を上手にする。"]},
];

function editorialPreview(type){
  if(type==="timeline")return `<div class="editorial-preview"><svg viewBox="0 0 360 148" aria-hidden="true"><text x="20" y="28" fill="#77787e" font-size="9">SCENT TIMELINE</text><rect x="20" y="48" width="104" height="9" rx="5" fill="#aeb0b6"/><rect x="20" y="70" width="208" height="9" rx="5" fill="#c9b558"/><rect x="20" y="92" width="312" height="9" rx="5" fill="#c4889c"/><text x="20" y="126" fill="#6f7076" font-size="9">0 min</text><text x="302" y="126" fill="#6f7076" font-size="9">6 hours</text></svg></div>`;
  if(type==="body")return `<div class="editorial-preview"><svg viewBox="0 0 360 148" aria-hidden="true"><circle cx="180" cy="30" r="13" fill="none" stroke="#d8d5ce"/><path d="M180 43v50m-34-35 34 12 34-12m-34 35-18 42m18-42 18 42" fill="none" stroke="#d8d5ce" stroke-width="2"/><g fill="#c9b558"><circle cx="180" cy="53" r="5"/><circle cx="147" cy="91" r="5"/></g><g fill="#c4889c"><circle cx="180" cy="88" r="5"/><circle cx="197" cy="127" r="5"/></g><text x="22" y="29" fill="#77787e" font-size="9">SPRAY MAP</text></svg></div>`;
  if(type==="concentration")return `<div class="editorial-preview"><svg viewBox="0 0 360 148" aria-hidden="true"><text x="20" y="26" fill="#77787e" font-size="9">CONCENTRATION</text>${[[55,42],[115,62],[175,86],[235,112]].map(([x,h],i)=>`<rect x="${x}" y="${132-h}" width="38" height="${h}" rx="6" fill="${i%2?'#c9b558':'#c4889c'}" opacity=".75"/>`).join("")}<text x="56" y="143" fill="#77787e" font-size="8">EDC</text><text x="116" y="143" fill="#77787e" font-size="8">EDT</text><text x="176" y="143" fill="#77787e" font-size="8">EDP</text><text x="230" y="143" fill="#77787e" font-size="8">PARFUM</text></svg></div>`;
  if(type==="matrix")return `<div class="editorial-preview"><svg viewBox="0 0 360 148" aria-hidden="true"><text x="20" y="25" fill="#77787e" font-size="9">SEASON × SCENE</text><g transform="translate(58 38)"><rect width="118" height="42" rx="7" fill="#6c98ad" opacity=".35"/><rect x="126" width="118" height="42" rx="7" fill="#c9b558" opacity=".35"/><rect y="50" width="118" height="42" rx="7" fill="#8d6f64" opacity=".35"/><rect x="126" y="50" width="118" height="42" rx="7" fill="#c4889c" opacity=".35"/></g></svg></div>`;
  if(type==="flow")return `<div class="editorial-preview"><svg viewBox="0 0 360 148" aria-hidden="true"><text x="20" y="27" fill="#77787e" font-size="9">5 STEP FLOW</text>${[30,96,162,228,294].map((x,i)=>`<circle cx="${x}" cy="79" r="19" fill="none" stroke="${i<3?'#c9b558':'#c4889c'}"/><text x="${x-7}" y="83" fill="#d8d5ce" font-size="9">0${i+1}</text>${i<4?`<path d="M${x+22} 79h20" stroke="#55565b"/>`:""}`).join("")}</svg></div>`;
  return `<div class="editorial-preview"><svg viewBox="0 0 360 148" aria-hidden="true"><text x="20" y="27" fill="#77787e" font-size="9">EDITORIAL GRAPH</text><g transform="translate(22 50)">${[["清潔感",92],["落ち着き",78],["拡散",32]].map(([n,w],i)=>`<text x="0" y="${i*25+8}" fill="#77787e" font-size="8">${n}</text><rect x="48" y="${i*25}" width="${w*2.55}" height="9" rx="5" fill="${i===2?'#c4889c':'#c9b558'}" opacity=".8"/>`).join("")}</g></svg></div>`;
}

function buildGuide(){
  const box=document.getElementById("guideGrid");
  FAMILIES.forEach((f,i)=>{
    const c=document.createElement("div");
    c.className="gcard";
    c.innerHTML=`
      <div class="ghead">
        <span class="gicon" style="background:${f.color}1f">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${f.color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${ICONS[f.key]}</svg>
        </span>
        <div>
          <div class="gnum">${String(i+1).padStart(2,"0")} ／ <span class="gen">${f.en}</span></div>
          <div class="gja">${f.ja}</div>
        </div>
      </div>
      <p class="gdesc">${f.desc}</p>
      <span class="gmore">この香りの香水を見る →</span>`;
    c.onclick=()=>{
      state.family=f.key; render();
      document.querySelector(".filters").scrollIntoView({behavior:"smooth"});
    };
    box.appendChild(c);
  });
}

function buildColumns(){
  const box=document.getElementById("colGrid");
  COLUMNS.forEach(col=>{
    const c=document.createElement("article");
    c.className="colcard";
    c.innerHTML=`
      <div class="ctop">
        <span class="ctag">${col.tag}</span>
        <h3 class="ctitle">${col.title}</h3>
        <p class="clead">${col.lead}</p>
      </div>
      ${editorialPreview(col.visual)}
      <div class="cbody">${col.body.map(p=>`<p>${p}</p>`).join("")}</div>
      <button class="ctoggle">概要を読む ＋</button>
      <a class="permalink" href="/columns/${col.slug}">図解つきの記事を読む →</a>`;
    const btn=c.querySelector(".ctoggle");
    btn.onclick=()=>{
      const open=c.classList.toggle("open");
      btn.textContent=open?"閉じる －":"概要を読む ＋";
    };
    box.appendChild(c);
  });
}


/* ---------- scrollytelling intro ---------- */
const SP = [
  {kick:"— a fragrance is a memory", h:'香りは、<br>記憶の地図になる。', p:"空気にとけて、すぐに消える。<br>けれど、誰かのその香りだけは、何年経っても残る。"},
  {kick:"— the trail you leave",     h:'残り香、という<br>もう一つの顔。', p:"通り過ぎたあとに、人は香りで思い出される。<br>纏う香りは、見えないが、確かに名刺になる。"},
  {kick:"— ten families, one you",   h:'ひとつだけ、<br>あなたの香りを。',  p:"フレグランスホイールの十の世界。<br>その中に、まだ会っていないあなたの香りがある。"},
];

/* 香層(kaso): 実データから第4パネル(香りは時間で層になる)を動的生成 */
const KASO_FEATURED = {
  slug:"dior-2",
  brand:"Dior",
  name:"ソヴァージュ EDT",
  top:"ベルガモット",
  mid:"シチュアンペッパー",
  last:"アンブロキサン",
};
function buildNotesPanel(pick=KASO_FEATURED){
  const split = s=>s.split(/[・,、]/).map(x=>x.trim()).filter(Boolean);
  SP.push({
    kick: `— ${pick.brand}`,
    h: `${pick.name}は、<br>三幕で香りを<span>変える</span>。`,
    p: "つけた瞬間から、香りは層を渡り歩く。<br>今見えているのは、そのひとつの層でしかない。",
    notes: {top:split(pick.top), mid:split(pick.mid), last:split(pick.last)}
  });
  return pick;
}
buildNotesPanel();

function initScrolly(){
  const sec=document.getElementById("scrolly");
  const sp=document.getElementById("sp"), spk=document.getElementById("spk"),
        sph=document.getElementById("sph"), spp=document.getElementById("spp"),
        spPyr=document.getElementById("spPyr");
  const pyrEls={top:document.getElementById("pyrTop"),mid:document.getElementById("pyrMid"),last:document.getElementById("pyrLast")};
  let idx=-1;
  const N=SP.length; // 4
  function applyPanel(i){
    const fade=[spk,sph,spp];
    fade.forEach(el=>el.style.opacity=0);
    setTimeout(()=>{
      spk.textContent=SP[i].kick;
      sph.innerHTML=SP[i].h;
      spp.innerHTML=SP[i].p;
      fade.forEach(el=>el.style.opacity=1);
      if(SP[i].notes){
        spPyr.style.display="flex";
        sp.classList.add("notes-panel-active");
        pyrEls.top.querySelector("span").textContent=SP[i].notes.top.join(" / ");
        pyrEls.mid.querySelector("span").textContent=SP[i].notes.mid.join(" / ");
        pyrEls.last.querySelector("span").textContent=SP[i].notes.last.join(" / ");
      } else {
        spPyr.style.display="none";
        sp.classList.remove("notes-panel-active");
      }
    },180);
  }
  function tick(){
    const r=sec.getBoundingClientRect();
    const total=sec.offsetHeight - innerHeight;
    const prog=Math.min(1,Math.max(0,(-r.top)/total));
    sec.classList.toggle("is-active", prog>0.02 && prog<0.98);
    const seg=1/N;
    const i=Math.min(N-1, Math.floor(prog/seg));
    if(i!==idx){ idx=i; applyPanel(i); }
    // subtle parallax within current panel
    const local=(prog%seg)/seg;
    sp.style.transform=`translateY(${(local-0.5)*-22}px)`;
    sp.style.opacity=String(0.55 + Math.sin(local*Math.PI)*0.45);

    // 第4パネル内では、ノートの層(top→mid→last)を進行に合わせてハイライト
    if(i===N-1){
      const noteIdx = local<0.34?0:local<0.67?1:2;
      const keys=["top","mid","last"];
      keys.forEach((k,ki)=> pyrEls[k].classList.toggle("on", ki===noteIdx));
    }

    // 3Dパーティクルへ連動(mist→burst→bloom→strata、シークエンス全体で一つの連続量)
    if(window.kasoSetProgress) window.kasoSetProgress(prog);
  }
  [spk,sph,spp].forEach(el=>el.style.transition="opacity .35s ease");
  sp.style.transition="transform .25s ease, opacity .35s ease";
  addEventListener("scroll",tick,{passive:true});
  tick();
}

/* ---------- timeline ---------- */
function buildTimeline(){
  const root=document.getElementById("tl");
  const dated=PERFUMES.filter(p=>p.releaseYear).sort((a,b)=>b.releaseYear-a.releaseYear);
  const byYear={};
  dated.forEach(p=>{(byYear[p.releaseYear]=byYear[p.releaseYear]||[]).push(p)});
  const years=Object.keys(byYear).map(Number).sort((a,b)=>b-a);

  const INIT=5; // 直近5年分まずに表示
  function renderYears(n){
    root.innerHTML="";
    years.slice(0,n).forEach(y=>{
      const list=byYear[y];
      const yEl=document.createElement("div");yEl.className="tl-year";
      yEl.innerHTML=`
        <span class="ynum">${y}</span>
        <span class="ydot"></span>
        <p class="ycount">${list.length} fragrance${list.length>1?"s":""}</p>
        <div class="tl-items"></div>`;
      const items=yEl.querySelector(".tl-items");
      list.forEach(p=>{
        const f=FAM[p.family];
        const c=document.createElement("div");c.className="tlcard";
        c.innerHTML=`
          <span class="tfam" style="background:${f.color}">${f.ja}</span>
          <span class="tbrand">${p.brand}</span>
          <span class="tname">${p.name}</span>`;
        c.onclick=()=>{state.family=p.family;render();
          document.querySelector(".filters").scrollIntoView({behavior:"smooth"})};
        items.appendChild(c);
      });
      root.appendChild(yEl);
    });
    if(n<years.length){
      const more=document.createElement("button");
      more.className="tl-more";more.textContent="さらに過去を見る ＋";
      more.onclick=()=>renderYears(years.length);
      root.appendChild(more);
    }
  }
  renderYears(INIT);
}

/* ---------- brands ---------- */
const brandState={tier:"all", sort:"count"};
function buildBrandTools(){
  const tierBox=document.getElementById("brandTierChips");
  [["all","すべて"],["luxury","ラグジュアリー"],["niche","ニッチ"],["midrange","ミドル"],["petit","プチプラ"]].forEach(([v,l])=>{
    const b=document.createElement("button");b.className="chip";b.textContent=l;
    if(v==="all")b.classList.add("on");
    b.onclick=()=>{brandState.tier=v;
      tierBox.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===b));
      renderBrands();attachHearts();};
    tierBox.appendChild(b);
  });
  const sortBox=document.getElementById("brandSortChips");
  [["count","掲載数順"],["alpha","A–Z"],["founded","創業年順"]].forEach(([v,l])=>{
    const b=document.createElement("button");b.className="chip";b.textContent=l;
    if(v==="count")b.classList.add("on");
    b.onclick=()=>{brandState.sort=v;
      sortBox.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===b));
      renderBrands();};
    sortBox.appendChild(b);
  });
}
function brandStats(name){
  const items=PERFUMES.filter(p=>p.brand===name);
  const fams={};items.forEach(p=>fams[p.family]=(fams[p.family]||0)+1);
  const top=Object.entries(fams).sort((a,b)=>b[1]-a[1]).slice(0,4)
    .map(([k,v])=>({color:FAM[k].color, weight:v}));
  return {count:items.length, fams:top, items};
}
function renderBrands(){
  const grid=document.getElementById("brandGrid");
  let list=BRANDS.filter(b=>brandStats(b.name).count>0);
  if(brandState.tier!=="all")list=list.filter(b=>b.tier===brandState.tier);
  if(brandState.sort==="count")list.sort((a,b)=>brandStats(b.name).count-brandStats(a.name).count);
  else if(brandState.sort==="alpha")list.sort((a,b)=>a.name.localeCompare(b.name));
  else if(brandState.sort==="founded")list.sort((a,b)=>(a.founded||9999)-(b.founded||9999));
  grid.innerHTML="";
  list.forEach((b,i)=>{
    const s=brandStats(b.name);
    const total=s.fams.reduce((a,x)=>a+x.weight,0)||1;
    const strip=s.fams.map(x=>`<span style="background:${x.color};flex:${x.weight}"></span>`).join("");
    const card=document.createElement("article");card.className="bcard";
    card.innerHTML=`
      ${brandState.sort==="count"?`<span class="rank">No.${String(i+1).padStart(2,"0")}</span>`:""}
      <span class="bmeta">${b.country} ／ est. ${b.founded}</span>
      <h3 class="bname">${b.name}</h3>
      <div class="bstrip">${strip}</div>
      <span class="bcount">${s.count} fragrances 掲載中</span>`;
    card.onclick=()=>openBrandModal(b);
    grid.appendChild(card);
  });
}
function openBrandModal(b){
  const back=document.getElementById("brandModal");
  const m=document.getElementById("brandModalInner");
  const s=brandStats(b.name);
  const ranked=s.items.slice().sort((a,b)=>(b.releaseYear||0)-(a.releaseYear||0));
  m.innerHTML=`
    <button class="close" aria-label="close">×</button>
    <div class="mhead">
      <span class="country">${b.country}</span>
      <h3>${b.name}</h3>
      <p class="est">established ${b.founded}</p>
    </div>
    <p class="mstory">${b.desc}</p>
    <div class="msec">
      <h4>本サイト掲載のフレグランス</h4>
      <div class="mplist">${ranked.map(p=>{
        const f=FAM[p.family];
        return `<div class="mp">
          <span class="mpfam" style="background:${f.color}">${f.ja}</span>
          <span class="mpname">${p.name}</span>
          <span class="mpyear">${p.releaseYear||"—"}</span>
        </div>`;
      }).join("")}</div>
    </div>
    <p class="mnote">創業年・拠点はブランドが公表している公知情報です。「ブランドの一文」は本サイト編集部による公開情報の要約であり、ブランドからの提供文ではありません。各ブランドの詳しい歴史・新作・在庫情報については各公式サイトをご確認ください。</p>`;
  back.classList.add("open");
  document.body.style.overflow="hidden";
  m.querySelector(".close").onclick=closeBrandModal;
  back.onclick=(e)=>{if(e.target===back)closeBrandModal();};
}
function closeBrandModal(){
  document.getElementById("brandModal").classList.remove("open");
  document.body.style.overflow="";
}
addEventListener("keydown",e=>{if(e.key==="Escape")closeBrandModal();});


/* ---------- favorites (localStorage with safe fallback) ---------- */
const FAV={p:new Set(),b:new Set()};
function favLoad(){
  try{
    const raw=localStorage.getItem("sillage_fav");
    if(raw){const d=JSON.parse(raw);(d.p||[]).forEach(x=>FAV.p.add(x));(d.b||[]).forEach(x=>FAV.b.add(x));}
  }catch(e){}
}
function favSave(){
  try{localStorage.setItem("sillage_fav",JSON.stringify({p:[...FAV.p],b:[...FAV.b]}));}catch(e){}
}
function favKey(p){return p.brand+"|"+p.name;}
function togglePerfumeFav(p,heartEl){
  const k=favKey(p);
  if(FAV.p.has(k))FAV.p.delete(k); else FAV.p.add(k);
  favSave();updateFavCount();
  if(heartEl){heartEl.classList.toggle("on",FAV.p.has(k));heartEl.classList.add("pop");
    setTimeout(()=>heartEl.classList.remove("pop"),400);}
}
function toggleBrandFav(b,heartEl){
  if(FAV.b.has(b.name))FAV.b.delete(b.name); else FAV.b.add(b.name);
  favSave();updateFavCount();
  if(heartEl){heartEl.classList.toggle("on",FAV.b.has(b.name));heartEl.classList.add("pop");
    setTimeout(()=>heartEl.classList.remove("pop"),400);}
}
function updateFavCount(){
  const n=FAV.p.size+FAV.b.size;
  document.getElementById("favCount").textContent=n;
  document.getElementById("favBtn").classList.toggle("has",n>0);
}
function heartSvg(){return `<svg viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-4.5-9.5-9.5C.5 7.5 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 4 23.5 7.5 21.5 11.5 19 16.5 12 21 12 21z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;}

/* attach hearts to product/brand cards after render */
function attachHearts(){
  document.querySelectorAll(".card").forEach(c=>{
    if(c.querySelector(".heart"))return;
    const titleEl=c.querySelector(".pname"), brandEl=c.querySelector(".brandname");
    if(!titleEl||!brandEl)return;
    const p={brand:brandEl.textContent.trim(),name:titleEl.textContent.trim()};
    const h=document.createElement("button");h.className="heart";h.innerHTML=heartSvg();
    h.setAttribute("aria-label","お気に入りに追加");
    if(FAV.p.has(favKey(p)))h.classList.add("on");
    h.onclick=(e)=>{e.stopPropagation();togglePerfumeFav(p,h);};
    (c.querySelector(".flacon")||c).appendChild(h);
  });
  document.querySelectorAll(".bcard").forEach(c=>{
    if(c.querySelector(".heart"))return;
    const nameEl=c.querySelector(".bname");if(!nameEl)return;
    const b=BRANDS.find(x=>x.name===nameEl.textContent.trim());if(!b)return;
    const h=document.createElement("button");h.className="heart";h.innerHTML=heartSvg();
    h.setAttribute("aria-label","お気に入りに追加");
    if(FAV.b.has(b.name))h.classList.add("on");
    h.onclick=(e)=>{e.stopPropagation();toggleBrandFav(b,h);};
    c.appendChild(h);
  });
}

/* favorites overlay */
function openFavorites(){
  const back=document.getElementById("brandModal");
  const m=document.getElementById("brandModalInner");
  const favPerf=PERFUMES.filter(p=>FAV.p.has(favKey(p)));
  const favBr=BRANDS.filter(b=>FAV.b.has(b.name));
  m.innerHTML=`
    <button class="fp-close" aria-label="close">×</button>
    <div class="fp-hero" style="min-height:38vh">
      <div class="fpinner">
        <span class="fpcountry">YOUR LIST</span>
        <h2 class="fpname" style="font-size:clamp(40px,7vw,88px)">Favorites</h2>
        <p class="fpest">気になる香水とブランドの記録</p>
      </div>
    </div>
    <div class="fp-body">
      <div class="fp-items">
        <h3>香水 <span style="font-family:'Bodoni Moda',serif;font-size:14px;color:#8c8c92;letter-spacing:1px;margin-left:8px">${favPerf.length}</span></h3>
        ${favPerf.length?`<div class="fpgrid2">${favPerf.map(p=>{const f=FAM[p.family];return `
          <div class="fpitem" data-fav-perf='${JSON.stringify({brand:p.brand,name:p.name}).replace(/'/g,"&#39;")}'>
            <span class="ipill" style="background:${f.color}">${f.ja}</span>
            <span style="font-family:'Bodoni Moda',serif;font-size:10.5px;color:#9a9a9f;letter-spacing:1.5px">${p.brand}</span>
            <span class="iname">${p.name}</span>
            <span class="iyear">${p.releaseYear||"—"}</span>
            <span class="inotes">${p.top} ／ ${p.mid} ／ ${p.last}</span>
          </div>`}).join("")}</div>`
          :`<p class="empty-fav">まだ気になる香水がありません。<br>商品カードのハートマークから追加できます。</p>`}
      </div>
      <div class="fp-items" style="margin-top:60px">
        <h3>ブランド <span style="font-family:'Bodoni Moda',serif;font-size:14px;color:#8c8c92;letter-spacing:1px;margin-left:8px">${favBr.length}</span></h3>
        ${favBr.length?`<div class="fpgrid2">${favBr.map(b=>{
          const s=brandStats(b.name);const main=s.fams[0]?s.fams[0].color:"#aeb0b6";
          return `<div class="fpitem" data-fav-brand="${b.name}">
            <span class="ipill" style="background:${main}">${b.country}</span>
            <span class="iname">${b.name}</span>
            <span class="iyear">est. ${b.founded}</span>
            <span class="inotes">${b.desc}</span>
          </div>`}).join("")}</div>`
          :`<p class="empty-fav">まだ気になるブランドがありません。<br>ブランドカードのハートマークから追加できます。</p>`}
      </div>
    </div>`;
  back.classList.add("open");document.body.style.overflow="hidden";
  m.querySelector(".fp-close").onclick=closeBrandModal;
  m.querySelectorAll("[data-fav-brand]").forEach(el=>{
    el.onclick=()=>{const b=BRANDS.find(x=>x.name===el.dataset.favBrand);if(b)openBrandModal(b);};
  });
  m.querySelectorAll("[data-fav-perf]").forEach(el=>{
    el.onclick=()=>{
      const d=JSON.parse(el.dataset.favPerf.replace(/&#39;/g,"'"));
      const p=PERFUMES.find(x=>x.brand===d.brand&&x.name===d.name);
      if(p){state.family=p.family;closeBrandModal();render();
        document.querySelector(".filters").scrollIntoView({behavior:"smooth"});}
    };
  });
}

/* ---------- brand score & ranking chart ---------- */
function brandScore(b){
  const s=brandStats(b.name);
  if(!s.count)return 0;
  const countScore=Math.log(s.count+1)*22;
  const divScore=s.fams.length*6;
  const tierBonus={luxury:14,niche:18,midrange:8,petit:4}[b.tier]||0;
  const recencyBonus=s.items.some(p=>p.releaseYear&&p.releaseYear>=2015)?8:0;
  return Math.round(countScore+divScore+tierBonus+recencyBonus);
}
function buildRanking(){
  const root=document.getElementById("rankChart");
  const scored=BRANDS.map(b=>({b,s:brandScore(b),st:brandStats(b.name)}))
    .filter(x=>x.st.count>0).sort((a,b)=>b.s-a.s).slice(0,10);
  const max=Math.max(...scored.map(x=>x.s),1);
  root.innerHTML=scored.map((x,i)=>{
    const w=Math.round(x.s/max*100);
    const strip=x.st.fams.map(f=>`<span style="background:${f.color};flex:${f.weight}"></span>`).join("");
    return `<div class="rank-row${i<3?" top"+(i+1):""}" data-bn="${x.b.name}">
      <span class="rk">${String(i+1).padStart(2,"0")}</span>
      <div>
        <div class="rname">${x.b.name} <span style="font-family:'Cormorant',serif;font-style:italic;font-size:12px;color:#8c8c92;margin-left:6px">${x.b.country} ・ ${x.st.count} fragrances</span></div>
        <div class="rbar" style="width:${w}%">${strip}</div>
      </div>
      <span class="rscore">${x.s}</span>
    </div>`;
  }).join("");
  root.querySelectorAll(".rank-row").forEach(r=>{
    r.onclick=()=>{const b=BRANDS.find(x=>x.name===r.dataset.bn);if(b)openBrandModal(b);};
  });
}

/* ---------- fullscreen brand page (overrides previous modal) ---------- */
function slugifyBrand(name){
  const norm=name.normalize("NFD").replace(/[̀-ͯ]/g,"");
  return norm.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}
function openBrandModal(b){
  const back=document.getElementById("brandModal");
  const m=document.getElementById("brandModalInner");
  const s=brandStats(b.name);
  const items=s.items.slice().sort((a,b)=>(b.releaseYear||0)-(a.releaseYear||0));
  const main=s.fams[0]?s.fams[0].color:"#aeb0b6";
  const strip=s.fams.map(f=>`<span style="background:${f.color};flex:${f.weight}"></span>`).join("");
  const yearsAvail=items.filter(p=>p.releaseYear).map(p=>p.releaseYear);
  const newest=yearsAvail.length?Math.max(...yearsAvail):null;
  const oldest=yearsAvail.length?Math.min(...yearsAvail):null;
  const score=brandScore(b);
  const isFav=FAV.b.has(b.name);

  m.innerHTML=`
    <button class="fp-close" aria-label="close">×</button>
    <div class="fp-hero">
      <div class="fpwash" style="background:radial-gradient(circle at 30% 40%,${main} 0%,transparent 55%),radial-gradient(circle at 70% 70%,${main} 0%,transparent 55%)"></div>
      <div class="fpgrid"></div>
      <div class="fpinner">
        <span class="fpcountry">${b.country} · est. ${b.founded}</span>
        <h2 class="fpname">${b.name}</h2>
        <p class="fpest">${tierLabel(b.tier)}</p>
        <div class="fpstrip">${strip}</div>
        <a class="fp-fullpage-link" href="/brand-${slugifyBrand(b.name)}.html" style="display:inline-block;margin-top:14px;font-size:12px;letter-spacing:.5px;color:#c9b558;text-decoration:none;border-bottom:1px solid #c9b558;padding-bottom:2px">${b.name}の特集ページを見る →</a>
      </div>
    </div>
    <div class="fp-body">
      <div class="fp-cols">
        <div>
          <h4>about the house</h4>
          <p class="fpstory">${b.desc}</p>
          <p class="fpstory" style="margin-top:16px;color:#8c8c92;font-size:13px">本欄の記述は公開情報の要約です。各ブランドの正確な歴史や哲学については、必ず公式サイトをご確認ください。</p>
        </div>
        <div class="fp-stats">
          <div class="stat"><span class="skey">創業</span><span class="sval">${b.founded}</span></div>
          <div class="stat"><span class="skey">本拠地</span><span class="sval">${b.country}</span></div>
          <div class="stat"><span class="skey">掲載数</span><span class="sval">${s.count}</span></div>
          ${newest?`<div class="stat"><span class="skey">最新作 (掲載中)</span><span class="sval">${newest}</span></div>`:""}
          ${oldest&&oldest!==newest?`<div class="stat"><span class="skey">最古作 (掲載中)</span><span class="sval">${oldest}</span></div>`:""}
          <div class="stat"><span class="skey">Sillageスコア</span><span class="sval">${score}</span></div>
          <button class="fav-btn ${isFav?'has':''}" id="fpFav" style="margin:18px 0 0;width:100%;justify-content:center">
            ${heartSvg()}<span>${isFav?"気になるリストから外す":"気になるブランドに追加"}</span>
          </button>
        </div>
      </div>

      <div class="fp-fams">
        <h3>このブランドの香調</h3>
        <p class="ksub">本サイト掲載分から見た、得意とする香りの系統</p>
        <div class="fpfamlist">
          ${s.fams.map(f=>{
            const k=Object.keys(FAM).find(k=>FAM[k].color===f.color);
            const fam=FAM[k];
            return `<div class="fpfam">
              <div><span class="fdot" style="background:${fam.color}"></span><span class="fja">${fam.ja}</span></div>
              <span class="fcount">${f.weight} fragrance${f.weight>1?"s":""}</span>
            </div>`;
          }).join("")}
        </div>
      </div>

      <div class="fp-items">
        <h3>掲載中のフレグランス</h3>
        <div class="fpgrid2">${items.map(p=>{
          const f=FAM[p.family];
          return `<div class="fpitem" data-fam="${p.family}">
            <span class="ipill" style="background:${f.color}">${f.ja}</span>
            <span class="iname">${p.name}</span>
            <span class="iyear">${p.releaseYear?p.releaseYear:"—"}</span>
            <span class="inotes">${p.top} ／ ${p.mid} ／ ${p.last}</span>
          </div>`;
        }).join("")}</div>
      </div>

      <p class="fp-note">創業年・本拠地はブランドが公表している公知情報、または広く知られている事実に基づきます。「about the house」の本文は本サイト編集部による公開情報の要約であり、ブランドからの提供文ではありません。掲載中のフレグランスのトップ／ミドル／ラストノートは各メーカーの公開情報です。本サイトはアフィリエイトプログラムにより収益を得ています。</p>
    </div>`;

  back.classList.add("open");document.body.style.overflow="hidden";
  m.querySelector(".fp-close").onclick=closeBrandModal;
  back.onclick=(e)=>{if(e.target===back)closeBrandModal();};

  const favBtn=m.querySelector("#fpFav");
  favBtn.onclick=()=>{
    toggleBrandFav(b);
    const nowOn=FAV.b.has(b.name);
    favBtn.classList.toggle("has",nowOn);
    favBtn.querySelector("span").textContent=nowOn?"気になるリストから外す":"気になるブランドに追加";
  };
  m.querySelectorAll(".fpitem").forEach(el=>{
    el.onclick=()=>{state.family=el.dataset.fam;closeBrandModal();render();
      document.querySelector(".filters").scrollIntoView({behavior:"smooth"});};
  });
}
function tierLabel(t){return {luxury:"luxury maison",niche:"niche house",midrange:"midrange brand",petit:"affordable"}[t]||""}

/* ---------- particle floats in cinema hero ---------- */
function initParticles(){
  const box=document.getElementById("parts");if(!box)return;
  for(let i=0;i<28;i++){
    const s=document.createElement("span");
    s.style.left=(Math.random()*100)+"%";
    s.style.top=(60+Math.random()*40)+"%";
    s.style.setProperty("--d",(8+Math.random()*14)+"s");
    s.style.setProperty("--del",(-Math.random()*20)+"s");
    s.style.opacity=String(.2+Math.random()*.4);
    box.appendChild(s);
  }
}

/* ============================================================
   香層(kaso): 香りの三層を可視化する3Dパーティクル
   失敗してもscrollytelling本体やサイトの他機能には一切影響しない
   ============================================================ */
(function initKasoLayers(){
  // モバイル / reduced-motion では Three.js を読み込まず静的背景に切替
  const noHeavy = matchMedia("(max-width:768px)").matches ||
                  matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(noHeavy){
    const canvas=document.getElementById("kasoCanvas");
    if(canvas){
      const parent=canvas.parentElement;
      canvas.remove();
      if(parent && !parent.querySelector(".kaso-static")){
        const fb=document.createElement("div");
        fb.className="kaso-static";
        parent.insertBefore(fb, parent.firstChild);
      }
    }
    window.kasoSetProgress=function(){};
    return;
  }
  function loadScript(src){
    return new Promise((res,rej)=>{
      const s=document.createElement("script");
      s.src=src; s.onload=res; s.onerror=rej;
      document.head.appendChild(s);
    });
  }
  (async function(){
    try{
      if(typeof THREE==="undefined"){
        try{ await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"); }
        catch(e){ await loadScript("https://unpkg.com/three@0.128.0/build/three.min.js"); }
      }
      if(typeof THREE==="undefined") throw new Error("THREE unavailable");
      buildKasoScene();
    }catch(err){
      console.warn("[香層] 3D演出をスキップ(本文表示には影響なし):", err);
    }
  })();

  function buildKasoScene(){
    const canvas=document.getElementById("kasoCanvas");
    if(!canvas) return;
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile=window.innerWidth<720;
    const COUNT=mobile?4500:9000;

    const renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(55,1,0.1,100);
    camera.position.set(0,0,13);
    function resize(){
      const el=canvas.parentElement;
      const w=el.clientWidth,h=el.clientHeight;
      renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
    }
    resize(); window.addEventListener("resize",resize);

    const R=(a,b)=>a+Math.random()*(b-a);
    function make(fn){const a=new Float32Array(COUNT*3);for(let i=0;i<COUNT;i++){const p=fn(i);a[i*3]=p[0];a[i*3+1]=p[1];a[i*3+2]=p[2];}return a;}

    // 0 霧(記憶):漂う雲
    const mist=make(()=>{
      const r=Math.pow(Math.random(),0.5)*10, t=R(0,Math.PI*2), p=Math.acos(R(-1,1));
      return [r*Math.sin(p)*Math.cos(t)*1.5, r*Math.cos(p)*0.8, r*Math.sin(p)*Math.sin(t)];
    });
    // 1 迸り(残り香):火花状の放射
    const burst=make(()=>{
      const t=R(0,Math.PI*2), len=Math.pow(Math.random(),0.7)*8, sp=0.16+len*0.07;
      return [Math.cos(t)*len*sp, -3+len, Math.sin(t)*len*sp*0.8];
    });
    // 2 開花(十の系統):花輪
    const bloom=make(()=>{
      const t=R(0,Math.PI*2), petal=1+0.55*Math.cos(5*t), rr=4.2*petal+R(-0.4,0.4),
            th=R(0,Math.PI*2), tube=R(0,0.8);
      return [(rr+tube*Math.cos(th))*Math.cos(t), (tube*Math.sin(th))*1.3+Math.sin(2.5*t)*0.6, (rr+tube*Math.cos(th))*Math.sin(t)*0.8];
    });
    // 3 堆積(香りは時間で層になる):三段の地層
    const strata=make(()=>{
      const band=Math.floor(Math.random()*3);
      return [R(-10,10), -3+band*0.9+R(-0.15,0.15), R(-5,5)];
    });
    const forms=[mist,burst,bloom,strata];

    const geo=new THREE.BufferGeometry();
    const pos=new Float32Array(mist);
    geo.setAttribute("position", new THREE.BufferAttribute(pos,3));

    const colors=new Float32Array(COUNT*3);
    const ink=[0.91,0.91,0.89], gold=[0.79,0.71,0.35], pink=[0.77,0.54,0.61];
    for(let i=0;i<COUNT;i++){
      const roll=Math.random();
      const c = roll<0.72? ink : roll<0.88? gold : pink;
      const f=R(0.7,1.0);
      colors[i*3]=c[0]*f; colors[i*3+1]=c[1]*f; colors[i*3+2]=c[2]*f;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors,3));

    const mat=new THREE.PointsMaterial({size:mobile?0.05:0.042,vertexColors:true,transparent:true,opacity:0.42,depthWrite:false,sizeAttenuation:true});
    scene.add(new THREE.Points(geo,mat));

    const ease=t=>t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    let targetProg=0, currentProg=0, time=0;
    window.kasoSetProgress=(p)=>{ targetProg=p; };

    function frame(){
      time+=0.0035;
      currentProg += (targetProg-currentProg)*0.045;
      const seg=Math.min(currentProg*(forms.length-1), forms.length-1.0001);
      const i0=Math.floor(seg), i1=Math.min(i0+1,forms.length-1), t=ease(seg-i0);
      const A=forms[i0], B=forms[i1];
      for(let i=0;i<COUNT;i++){
        const j=i*3;
        pos[j]  =A[j]  +(B[j]  -A[j]  )*t + Math.sin(time+i*0.11)*0.1;
        pos[j+1]=A[j+1]+(B[j+1]-A[j+1])*t + Math.sin(time*2+i*0.37)*0.08;
        pos[j+2]=A[j+2]+(B[j+2]-A[j+2])*t + Math.cos(time+i*0.07)*0.1;
      }
      geo.attributes.position.needsUpdate=true;
      scene.rotation.y += 0.0006;
      renderer.render(scene,camera);
      if(!reduced) requestAnimationFrame(frame);
    }
    if(reduced){
      renderer.render(scene,camera);
      let tId=null;
      window.kasoSetProgress=(p)=>{
        targetProg=p;
        if(tId) return;
        tId=setTimeout(()=>{
          tId=null;
          const seg=Math.min(targetProg*(forms.length-1), forms.length-1.0001);
          const i0=Math.floor(seg), i1=Math.min(i0+1,forms.length-1), t=ease(seg-i0);
          const A=forms[i0], B=forms[i1];
          for(let i=0;i<COUNT*3;i++){ pos[i]=A[i]+(B[i]-A[i])*t; }
          geo.attributes.position.needsUpdate=true;
          renderer.render(scene,camera);
        },80);
      };
    } else {
      frame();
    }
  }
})();

/* ---------- patch render to attach hearts on re-render ---------- */
const _origRender=render;
render=function(){_origRender();attachHearts();};


/* ============================================================
   1) DIAGNOSIS QUIZ
   ============================================================ */
const QUIZ = [
  {q:"香水をまとう、いちばん多い場面は？", opts:[
    {jp:"オフィス・会議",en:"business",  w:{tier:{luxury:1,midrange:2}, fam:{aromatic:2,woody:2,citrus:1,musk:1},scene:{business:3}}},
    {jp:"デート・夜",   en:"date & night",w:{tier:{luxury:2,niche:2},   fam:{amber:2,gourmand:2,woody:1,chypre:1},scene:{date:3}}},
    {jp:"普段使い・日中",en:"daily",      w:{tier:{midrange:2,petit:1}, fam:{citrus:2,musk:2,aromatic:1},scene:{daily:3}}},
    {jp:"特別なフォーマル",en:"formal",   w:{tier:{luxury:2,niche:1},   fam:{woody:2,chypre:2,amber:1},scene:{formal:3}}},
  ]},
  {q:"好む季節は？", opts:[
    {jp:"春・夏",en:"spring/summer",w:{fam:{citrus:2,aquatic:2,aromatic:1,musk:1},season:{spring:2,summer:2}}},
    {jp:"秋・冬",en:"autumn/winter",w:{fam:{woody:2,amber:2,gourmand:1,chypre:1},season:{autumn:2,winter:2}}},
    {jp:"一年中",en:"all year",     w:{fam:{musk:1,woody:1,aromatic:1,citrus:1},season:{spring:1,summer:1,autumn:1,winter:1}}},
  ]},
  {q:"香りの強さの理想は？", opts:[
    {jp:"そっと纏う、肌に寄り添う",en:"subtle",w:{fam:{musk:3,citrus:2,aromatic:1}}},
    {jp:"適度に香る、ほどよく",en:"balanced",  w:{fam:{woody:2,aromatic:2,floral:1,fruity:1}}},
    {jp:"印象を残す、濃密に",  en:"intense",  w:{fam:{amber:3,gourmand:2,chypre:2}}},
  ]},
  {q:"あなたの好む世界観は？", opts:[
    {jp:"古典的・伝統的",en:"classic",w:{tier:{luxury:3},country:{FR:2,IT:1,UK:1}}},
    {jp:"モダン・洗練",  en:"modern", w:{tier:{niche:2,luxury:1},country:{US:2,FR:1,SE:1}}},
    {jp:"前衛・個性的",  en:"avant-garde",w:{tier:{niche:3}}},
    {jp:"親しみやすい",  en:"approachable",w:{tier:{midrange:2,petit:2}}},
  ]},
  {q:"予算感は？", opts:[
    {jp:"3,000円以下のプチプラ",en:"under ¥3,000", w:{tier:{petit:3},price:{petit:3}}},
    {jp:"5,000〜10,000円のミドル",en:"¥5,000–10,000", w:{tier:{midrange:3,luxury:1},price:{mid:3}}},
    {jp:"15,000〜25,000円のラグジュアリー",en:"¥15,000–25,000", w:{tier:{luxury:3},price:{high:3}}},
    {jp:"こだわるなら30,000円〜",en:"¥30,000+", w:{tier:{niche:3,luxury:2},price:{high:3}}},
  ]},
];

const emptyQuizWeights=()=>({tier:{},fam:{},country:{},scene:{},season:{},price:{}});
const quizState = {step:0, weights:emptyQuizWeights()};

function renderQuiz(){
  const card=document.getElementById("quizCard");
  if(quizState.step>=QUIZ.length){return showQuizResult();}
  const q=QUIZ[quizState.step];
  card.innerHTML=`
    <div class="quiz-step active">
      <p class="quiz-prog">QUESTION ${String(quizState.step+1).padStart(2,"0")} / ${String(QUIZ.length).padStart(2,"0")}</p>
      <h3 class="quiz-q">${q.q}</h3>
      <div class="quiz-opts">
        ${q.opts.map((o,i)=>`<button class="quiz-opt" data-i="${i}"><span class="ojp">${o.jp}</span><span class="oen">— ${o.en}</span></button>`).join("")}
      </div>
    </div>`;
  card.querySelectorAll(".quiz-opt").forEach(b=>{
    b.onclick=()=>{
      const o=q.opts[Number(b.dataset.i)];
      const w=o.w||{};
      ["tier","fam","country","scene","season","price"].forEach(k=>{
        if(w[k])Object.entries(w[k]).forEach(([key,val])=>{
          quizState.weights[k][key]=(quizState.weights[k][key]||0)+val;
        });
      });
      quizState.step++;renderQuiz();
    };
  });
}

function showQuizResult(){
  const card=document.getElementById("quizCard");
  const recommendation=window.SillageQuizRecommendation.recommend(PERFUMES,quizState.weights);
  // score brands
  const scores=BRANDS.map(b=>{
    const s=brandStats(b.name);
    if(!s.count)return null;
    let score=0;
    score+=quizState.weights.tier[b.tier]||0;
    score+=(quizState.weights.country[b.country]||0)*0.6;
    // family match
    s.fams.forEach(f=>{
      const k=Object.keys(FAM).find(k=>FAM[k].color===f.color);
      score+=(quizState.weights.fam[k]||0)*f.weight*0.4;
    });
    return {b,score:Math.round(score*10)/10,s};
  }).filter(Boolean).sort((a,b)=>b.score-a.score);

  const top=scores[0];
  const resultItems=[
    {role:"第一候補",className:"primary",product:recommendation.primary,reason:"回答した香調・シーン・季節・価格帯が最も多く重なる候補"},
    {role:"控えめな代替",className:"calm",product:recommendation.calm,reason:"同じ回答条件を保ちつつ、日常・仕事や軽快な香調を優先した候補"},
    {role:"個性的な代替",className:"distinctive",product:recommendation.distinctive,reason:"同じ回答条件を保ちつつ、デート・フォーマルや輪郭のある香調を優先した候補"},
  ];
  const resultCard=({role,className,product,reason})=>`<article class="quiz-product ${className}">
    <p class="quiz-role">${role}</p>
    <p class="qbrand">${product.brand}</p>
    <h4>${product.name}</h4>
    <dl>
      <div><dt>香調</dt><dd>${FAM[product.family].ja}</dd></div>
      ${product.concentration?.label?`<div><dt>濃度</dt><dd>${product.concentration.label}</dd></div>`:""}
      <div><dt>価格帯</dt><dd>${PRICE[product.priceTier]}</dd></div>
      <div><dt>場面</dt><dd>${product.scenes.map(scene=>SCENE[scene]).join("・")}</dd></div>
    </dl>
    <p class="qreason">${reason}</p>
    <a class="qdetail" href="/items/${product.slug}">${product.name}の詳細を見る →</a>
  </article>`;
  card.innerHTML=`
    <div class="quiz-result show">
      <h3>あなたへの香りの提案</h3>
      <p class="quiz-type">${FAM[recommendation.primary.family].ja}を軸に選びました</p>
      <p class="quiz-type-note">回答と掲載中92商品の既存属性を照合した3候補です。価格・濃度・使う場面を比べて、最後は肌で試してください。</p>
      <div class="quiz-products">
        ${resultItems.map(resultCard).join("")}
      </div>
      <div class="quiz-brand-supplement">
        <h3>ブランド傾向（補助結果）</h3>
        <p>ブランドの国・価格層まで含めると、${top.b.name}の傾向と重なります。商品3候補とは別の補助情報です。</p>
        <button class="show-result-btn" id="quizGoBrand">${top.b.name}を見る →</button>
      </div>
      <div class="share-block">
        <p class="share-lead">— your scent layer —</p>
        <button class="share-btn" id="quizShareBtn">診断結果をカードでシェア</button>
      </div>
      <button class="quiz-restart" id="quizRestart">もう一度診断する</button>
      <p style="font-size:11.5px;color:#67676d;margin-top:18px;line-height:1.7">本診断は、回答内容と掲載商品の香調・シーン・季節・価格帯を照合した編集上の目安です。香りの強さや好みを保証するものではありません。</p>
    </div>`;
  card.querySelector("#quizGoBrand").onclick=()=>openBrandModal(top.b);
  card.querySelector("#quizRestart").onclick=()=>{
    quizState.step=0;quizState.weights=emptyQuizWeights();renderQuiz();
  };
  card.querySelector("#quizShareBtn").onclick=()=>openShareCard(recommendation);
}

/* ============================================================
   香層シェアカード(集客導線): 診断結果を画像化してX/保存で拡散
   実データ(ブランド名・国・一致度)のみを使用し、架空の統計は作らない
   ============================================================ */
function drawKasoShareCard(result){
  const cvs=document.createElement("canvas");
  cvs.width=1200; cvs.height=630;
  const ctx=cvs.getContext("2d");

  // 背景(サイト本体と同じダークトーン)
  ctx.fillStyle="#0d0e10"; ctx.fillRect(0,0,1200,630);
  const grad=ctx.createRadialGradient(900,120,50,900,120,700);
  grad.addColorStop(0,"rgba(196,136,156,0.18)"); grad.addColorStop(1,"rgba(196,136,156,0)");
  ctx.fillStyle=grad; ctx.fillRect(0,0,1200,630);
  const grad2=ctx.createRadialGradient(220,560,50,220,560,600);
  grad2.addColorStop(0,"rgba(201,181,88,0.14)"); grad2.addColorStop(1,"rgba(201,181,88,0)");
  ctx.fillStyle=grad2; ctx.fillRect(0,0,1200,630);

  // 香層ドット(mist→burst→bloom→strataを模した並び)
  ctx.globalAlpha=0.5;
  for(let i=0;i<160;i++){
    const t=i/160;
    const x=100+t*1000+Math.sin(i*1.7)*30;
    const y=560-t*260+Math.cos(i*2.1)*18;
    ctx.fillStyle= i%5===0 ? "#c9b558" : i%9===0 ? "#c4889c" : "#e9e7e3";
    ctx.beginPath(); ctx.arc(x,y,1.6,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha=1;

  // ロゴ
  ctx.fillStyle="#e9e7e3";
  ctx.font="500 30px Georgia, serif";
  ctx.fillText("Sillage", 64, 76);
  ctx.fillStyle="#8c8c92"; ctx.font="14px sans-serif";
  ctx.fillText("シヤージュ ― 香調・シーン・季節から選ぶ香水ガイド", 64, 100);

  // 見出し
  ctx.fillStyle="#8c8c92"; ctx.font="italic 20px Georgia, serif";
  ctx.fillText("— your scent layer —", 64, 220);
  ctx.fillStyle="#ffffff"; ctx.font="600 50px 'Hiragino Mincho ProN', serif";
  ctx.fillText("あなたへの第一候補", 64, 280);
  ctx.fillStyle="#c9b558";
  fitCanvasText(ctx,result.primary.name,64,360,1060,64,36);
  ctx.fillStyle="#a8a8ae"; ctx.font="18px sans-serif";
  ctx.fillText(result.primary.brand,64,404);
  ctx.fillStyle="#c4889c"; ctx.font="16px sans-serif";
  ctx.fillText(`控えめな代替：${result.calm.name}`,64,455);
  ctx.fillText(`個性的な代替：${result.distinctive.name}`,64,490);

  ctx.fillStyle="#67676d"; ctx.font="14px sans-serif";
  ctx.fillText("sillage.asutelu.com", 64, 580);

  return cvs;
}
function fitCanvasText(ctx,text,x,y,maxW,startSize,minSize){
  let size=startSize;
  do{
    ctx.font=`600 ${size}px 'Hiragino Mincho ProN', serif`;
    size-=2;
  }while(ctx.measureText(text).width>maxW&&size>=minSize);
  ctx.fillText(text,x,y);
}
function openShareCard(result){
  let back=document.getElementById("shareBack");
  if(!back){
    back=document.createElement("div");
    back.id="shareBack"; back.className="share-back";
    back.innerHTML=`<div class="share-modal">
      <button class="share-close" id="shareClose">×</button>
      <canvas id="shareCanvas"></canvas>
      <div class="share-actions">
        <a id="shareTweet" target="_blank" rel="noopener" class="share-cta primary">Xでシェア</a>
        <a id="shareDownload" download="sillage-kaso-result.png" class="share-cta">画像を保存</a>
      </div>
      <p class="share-note">画像を保存してポストに添付すると、より伝わりやすくなります。</p>
    </div>`;
    document.body.appendChild(back);
    back.querySelector("#shareClose").onclick=()=>back.classList.remove("open");
    back.addEventListener("click",e=>{ if(e.target===back) back.classList.remove("open"); });
  }
  const cvs=drawKasoShareCard(result);
  const target=back.querySelector("#shareCanvas");
  target.width=cvs.width; target.height=cvs.height;
  target.getContext("2d").drawImage(cvs,0,0);
  const dataUrl=cvs.toDataURL("image/png");
  back.querySelector("#shareDownload").href=dataUrl;
  const text=encodeURIComponent(`香水診断の第一候補は「${result.primary.name}」でした。\n控えめな代替：${result.calm.name}\n個性的な代替：${result.distinctive.name}\n#Sillage #香水診断`);
  const url=encodeURIComponent("https://sillage.asutelu.com/");
  back.querySelector("#shareTweet").href=`https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  back.classList.add("open");
}

/* ============================================================
   2) MEGA INTERACTIVE TIMELINE
   ============================================================ */
const mtlState={filter:"all"};
function buildMegaTimeline(){
  // build event list: brand foundings + product releases
  const evs=[];
  BRANDS.forEach(b=>{
    if(!b.founded)return;
    const stats=brandStats(b.name);
    if(stats.count===0)return; // only show brands we cover
    evs.push({year:Number(b.founded),type:"founding",brand:b.name,name:b.name+" 創業",country:b.country});
  });
  PERFUMES.filter(p=>p.releaseYear).forEach(p=>{
    evs.push({year:p.releaseYear,type:"release",brand:p.brand,name:p.name,family:p.family,perfume:p});
  });
  // filter chips
  const fbox=document.getElementById("mtlFilterChips");
  [["all","すべて"],["release","発売作品のみ"],["founding","ブランド創業のみ"],["since2000","2000年以降"],["before2000","1999年以前"]].forEach(([v,l])=>{
    const b=document.createElement("button");b.className="chip";b.textContent=l;
    if(v==="all")b.classList.add("on");
    b.onclick=()=>{mtlState.filter=v;
      fbox.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===b));
      renderMtl(evs);};
    fbox.appendChild(b);
  });
  renderMtl(evs);
}
function renderMtl(evs){
  let list=evs.slice();
  if(mtlState.filter==="release")list=list.filter(e=>e.type==="release");
  else if(mtlState.filter==="founding")list=list.filter(e=>e.type==="founding");
  else if(mtlState.filter==="since2000")list=list.filter(e=>e.year>=2000);
  else if(mtlState.filter==="before2000")list=list.filter(e=>e.year<2000);
  list.sort((a,b)=>b.year-a.year);
  // decades indicator
  const decadeBox=document.getElementById("mtlDecades");
  const years=list.map(e=>e.year);
  const minY=Math.min(...years), maxY=Math.max(...years);
  const decades=[];
  for(let d=Math.floor(minY/10)*10; d<=Math.ceil(maxY/10)*10; d+=10) decades.push(d);
  decadeBox.innerHTML=decades.map(d=>`<span>${d}s</span>`).join("");
  // grouped
  const byYear={};
  list.forEach(e=>{(byYear[e.year]=byYear[e.year]||[]).push(e)});
  const sortedYears=Object.keys(byYear).map(Number).sort((a,b)=>b-a);
  const root=document.getElementById("mtl");
  root.innerHTML=sortedYears.map(y=>{
    const items=byYear[y];
    return `<div class="mtl-year-block">
      <div class="yhead"><span class="yn">${y}</span><span class="yc">${items.length} event${items.length>1?"s":""}</span></div>
      <div class="mtl-events-list">
        ${items.map(e=>{
          if(e.type==="founding"){
            return `<div class="mev found" data-bn="${e.brand}">
              <span class="mt">founding</span>
              <span class="mn">${e.brand} 創業</span>
              <span class="mb">${e.country}</span>
            </div>`;
          }else{
            const f=FAM[e.family];
            return `<div class="mev" data-perf="${e.brand}|${e.name}" style="border-left:2px solid ${f.color}">
              <span class="mt" style="color:${f.color}">${f.ja}</span>
              <span class="mn">${e.name}</span>
              <span class="mb">${e.brand}</span>
            </div>`;
          }
        }).join("")}
      </div>
    </div>`;
  }).join("");
  root.querySelectorAll("[data-bn]").forEach(el=>{
    el.onclick=()=>{const b=BRANDS.find(x=>x.name===el.dataset.bn);if(b)openBrandModal(b);};
  });
  root.querySelectorAll("[data-perf]").forEach(el=>{
    el.onclick=()=>{
      const [br,nm]=el.dataset.perf.split("|");
      const p=PERFUMES.find(x=>x.brand===br&&x.name===nm);
      if(p){state.family=p.family;render();
        document.querySelector(".filters").scrollIntoView({behavior:"smooth"});}
    };
  });
}

/* ============================================================
   3) COMPARE ARTICLES
   ============================================================ */
const COMPARES = [
  {tag:"COMPARE", a:"Chanel", b:"Dior",
   title:"シャネルとディオール、パリ二大メゾンの違い",
   lead:"ともにパリのオートクチュール出身。香水ではどちらも王道とされるが、性格は対照的。",
   body:[
    "シャネルは1910年、ガブリエル・シャネルが帽子店から始めたブランド。1921年のN°5で「抽象的なアルデヒドを核とした近代香水」を発明し、現代フレグランスの規範を作った。一貫して引き算の美学があり、メンズのブルー ドゥ シャネルやアンテウスにも、ノートをぎりぎりまで削いだ端正さがある。",
    "一方ディオールは1947年、戦後ファッションを変えたクリスチャン・ディオールが立ち上げた。香水ではミス ディオール(1947)から始まり、ファーレンハイト(1988)、ディオール オム(2005)、ソヴァージュ(2015)と、時代ごとに大胆な解釈を世に出してきた。劇的で、わかりやすく目を引く構築美が共通項。",
    "選び分けるなら、礼節や端正さで攻めたいときはシャネル、自分を一段押し出したいときはディオール、と整理できる。価格帯はほぼ同等、どちらも長く付き合える伝統メゾンであることは間違いない。",
   ],
   related:["Hermès","YSL","Guerlain"]},

  {tag:"COMPARE", a:"Le Labo", b:"Jo Malone",
   title:"ル ラボとジョー マローン、現代ニッチの2大スター",
   lead:"両者とも、香水文化に「軽さと重ねづけ」を持ち込んだブランド。アプローチは異なる。",
   body:[
    "ジョー マローンは1994年ロンドン創業。シングルノートに近いシンプルさと、複数の香水を重ねる「コロン カクテル」の文化を広めた。ライムバジル & マンダリン(1999)、イングリッシュ ペアー & フリージア(2010)、ウッドセージ & シーソルト(2014)など、すべて「ひと言で言える香り」が個性。英国式の上品さと日常性の両立が魅力。",
    "ル ラボは2006年ニューヨーク創業。サンタル33(2011)で「性別を越えた抽象的なウッディ」を打ち立て、ニッチ香水の新基準を作った。フォントだけのラベル、製造日と名前の手書き、店舗での量り売りなど、世界観全体がブランドの一部になっている。",
    "ジョー マローンは「贈り物にも使える、開かれた上品さ」、ル ラボは「個人的で、所有の儀式感がある」。どちらも初めてのニッチ入門に向くが、世界観の好みで選ぶといい。",
   ],
   related:["Byredo","Diptyque","Maison Margiela"]},

  {tag:"COMPARE", a:"Tom Ford", b:"Creed",
   title:"トム フォードとクリード、高級メンズの頂点を比較",
   lead:"どちらも高級メンズ香水の代名詞。だが歴史も路線も大きく違う。",
   body:[
    "クリードはもともとロンドンの歴史ある調香一族が源流とされ、現在はフランス拠点。アバントゥス(2010)が世界的なステータス香水となり、「成功者の香り」と称されるまでになった。フルーティなパイナップルから樺の煙へ落ちる構築は、模倣不可能と言われる。",
    "トム フォードは2005年、元グッチのクリエイティブディレクターが立ち上げた新興ラグジュアリー。ブラック オーキッド(2006)、トバコ バニラ(2007)、オード ウッド(2007)など、官能的で大胆なグルマン・ウッディを連発し、香水コレクションを一気に確立した。",
    "クリードは「古典の重み」、トム フォードは「現代の濃度」。前者は静かな自信を、後者は明確な押し出しを求める人に向く。価格帯はトム フォードがやや幅広く、クリードは一律で高い。",
   ],
   related:["Maison Francis Kurkdjian","Parfums de Marly","Dior"]},

  {tag:"COMPARE", a:"Aesop", b:"Diptyque",
   title:"アエソップとディプティック、ナチュラル系ニッチの本流",
   lead:"植物的・アート寄りで似ているようで、実は系譜が違う2つの老舗ニッチ。",
   body:[
    "ディプティックは1961年、パリの3人の創業者がセレクトショップとして始めた。アーティストや文化人と関わりながらキャンドルとオードトワレを展開し、タムダオ(2003)など瞑想的で文学的な香りが知られる。アートとしての香りという立ち位置を一貫している。",
    "アエソップは1987年、オーストラリア・メルボルン創業。スキンケアから出発した経緯もあり、植物原料と化学への深いこだわりが特徴。タシット(2015)はユズとバジル、ベチバーで「香りで涼を演出する」という発想を体現している。",
    "ディプティックは「世界観の演出」、アエソップは「素材への信仰」。どちらもパッケージから世界観が一貫しており、空間や生活に置きたくなる類のブランド。香りの強さは両者とも控えめで、ニッチ入門に最適。",
   ],
   related:["Le Labo","Byredo","Hermès"]},

  {tag:"COMPARE", a:"Maison Margiela", b:"Byredo",
   title:"マルジェラとバイレード、モダンニッチの新世代",
   lead:"2000年代以降に台頭したニッチ。コンセプトはどちらも文学的だが、温度が違う。",
   body:[
    "マルジェラのレプリカ コレクションは2012年から始まった。各香水に「ジャズクラブ」「レイジー サンデー モーニング」のような場面の名前が付けられ、特定の記憶や情景を香りで再現するという、極めてコンセプチュアルな試み。SNSで「香りでストーリーが浮かぶ」と話題になり、若い世代のニッチ入門の代名詞となった。",
    "バイレードは2006年ストックホルム創業。ジプシー ウォーター(2008)に代表される、文学的で北欧的なミニマリズム。ベルやアン、ベン・ゴーラムによる詩的なネーミングと、グレーや白を基調にしたパッケージ設計が、都市的な知性層に支持されている。",
    "マルジェラは「物語の引き金」、バイレードは「静かな佇まい」。前者は若い世代やSNS世代に響き、後者は内省的なファンを掴む。価格帯は近く、どちらも香水好きの2本目以降にふさわしい。",
   ],
   related:["Le Labo","Diptyque","Jo Malone"]},

  {tag:"COMPARE", a:"Hermès", b:"Acqua di Parma",
   title:"エルメスとアクア ディ パルマ、老舗の上品さの違い",
   lead:"ともに100年超のヨーロッパ老舗。だが「品の出方」が違う。",
   body:[
    "エルメスは1837年、パリの馬具工房から始まった。香水部門にも一流の調香師が関わり、テール ド エルメス(2006)はベチバーの鉱物的な乾きで「大地」を主題化した名作。気品があり、押し出すよりも余韻で語るタイプの香り。",
    "アクア ディ パルマは1916年、イタリア・パルマで創業。代表作コロニアは100年以上ほぼ変わらないレシピで愛され続け、シチリアンレモンを使った地中海的な明るさが核。エルメスより親しみやすく、軽やかさで上品さを伝える。",
    "エルメスは「フランスの内省的な品格」、アクア ディ パルマは「イタリアの陽性の上品さ」。ビジネスや会食でフォーマルに使うならどちらも安全だが、佇まいで選ぶならエルメス、明るさで選ぶならアクア ディ パルマ。",
   ],
   related:["Guerlain","Chanel","Jo Malone"]},

  {tag:"COMPARE", a:"Bvlgari", b:"Versace",
   title:"ブルガリとヴェルサーチ、イタリア二大ブランドの香水比較",
   lead:"どちらもイタリア生まれの高級ブランド。香水の性格は全く異なる。",
   body:[
    "ブルガリは1884年ローマのジュエラー創業。香水ではブルガリ プールオム(1996)、アクア プールオム(2005)など、清潔感と透明感を重視した端正な路線。日本人にも非常に馴染みやすく、ビジネスで使える定番として根強い人気を持つ。",
    "ヴェルサーチは1978年ミラノ創業。エロス(2012)に代表される、わかりやすく華やかで官能的な路線。青リンゴとミントのフレッシュ感に温かい甘さを乗せた構成は、特に若い世代のデート向け定番として強い。",
    "ブルガリは「控えめな上品さ」、ヴェルサーチは「華やかな押し出し」。同じイタリアでも、ローマの古典 vs ミラノの煌びやかさという対比そのものが香りに現れている。",
   ],
   related:["Dolce&Gabbana","Giorgio Armani","Acqua di Parma"]},

  {tag:"FOCUS", a:"Maison Margiela", b:"",
   title:"なぜマルジェラのレプリカは人気なのか",
   lead:"ニッチ香水を一般層まで広げた、現代の現象としてのレプリカ コレクション。",
   body:[
    "マルジェラのレプリカが他のニッチと違うのは、香水のネーミング自体が「物語の入口」になっている点だ。ジャズクラブ、レイジー サンデー モーニング、ビーチウォーク、レインドロップス オン ア グリーンハウス——名前を聞いただけで情景が浮かぶように設計されている。",
    "香り自体も、その情景を裏切らない具体性で組まれている。ジャズクラブにはラムとタバコの煙、レイジー サンデー モーニングには洗いたてのシーツを思わせる清潔なムスクとアイリスの粉っぽさ。香水を「コンセプチュアル・アート」として体験できる稀有なコレクション。",
    "SNSで「この香水がぴったり」と紹介しやすく、贈り物としても説明しやすい。価格帯も初〜中級ニッチの範囲で、若い世代のニッチ入門としても機能している。ニッチが大衆化した象徴的なブランドと言える。",
   ],
   related:["Le Labo","Byredo","Diptyque"]},
];

const COMPARE_PREVIEW_SCORES=[[92,84,72,94],[76,91,88,62],[62,82,97,91],[96,82,78,96],[84,80,98,91],[86,95,72,66],[95,82,64,94],[88,82,94,76]];
function comparePreview(c,i){
  const s=COMPARE_PREVIEW_SCORES[i]||[82,78,76,88];
  return `<div class="compare-preview"><div class="cp-head"><span>${c.a}</span><span class="cp-vs">versus</span><span>${c.b||"FOCUS"}</span></div><div class="cp-bars"><div class="cp-row"><span>清潔感</span><div class="cp-track"><i style="width:${s[0]}%"></i><i style="width:${s[1]}%"></i></div></div><div class="cp-row"><span>存在感</span><div class="cp-track"><i style="width:${s[2]}%"></i><i style="width:${s[3]}%"></i></div></div><div class="cp-row"><span>個性</span><div class="cp-track"><i style="width:${Math.min(98,s[0]+4)}%"></i><i style="width:${Math.min(98,s[3]+2)}%"></i></div></div></div></div>`;
}
function buildCompares(){
  const box=document.getElementById("cmpGrid");
  COMPARES.forEach((c,i)=>{
    const card=document.createElement("article");card.className="cmpcard";
    card.innerHTML=`
      ${comparePreview(c,i)}
      <div class="cmp-head">
        ${c.b?'<span class="vs">vs</span>':''}
        <span class="ctag">${c.tag}</span>
        <h3 class="ctitle">${c.title}</h3>
        <div class="pair">
          <span>${c.a}</span>
          ${c.b?`<span>${c.b}</span>`:''}
        </div>
        <p class="clead">${c.lead}</p>
      </div>
      <div class="cbody">${c.body.map(p=>`<p>${p}</p>`).join("")}</div>
      <div class="cnav">
        <span class="cnav-label">この記事に登場するブランド ／ 関連ブランド</span>
        <div class="cnav-chips">
          ${[c.a,c.b,...c.related].filter(Boolean).map(n=>`<button data-bn="${n}">${n}</button>`).join("")}
        </div>
      </div>
      <button class="ctoggle">続きを読む ＋</button>`;
    const btn=card.querySelector(".ctoggle");
    btn.onclick=()=>{
      const open=card.classList.toggle("open");
      btn.textContent=open?"閉じる －":"続きを読む ＋";
    };
    card.querySelectorAll(".cnav-chips button").forEach(b=>{
      b.onclick=()=>{const br=BRANDS.find(x=>x.name===b.dataset.bn);if(br)openBrandModal(br);};
    });
    box.appendChild(card);
  });
}

/* ============================================================
   4) BRAND NETWORK (injected into brand modal)
   ============================================================ */
function brandNetwork(b){
  const all=BRANDS.filter(x=>x.name!==b.name && brandStats(x.name).count>0);
  // same country
  const sameCountry=all.filter(x=>x.country===b.country).slice(0,4);
  // same tier
  const sameTier=all.filter(x=>x.tier===b.tier && x.country!==b.country).slice(0,4);
  // same era (founded within ±15 years)
  const sameEra=all.filter(x=>Math.abs((x.founded||0)-(b.founded||0))<=15 && x.country!==b.country && x.tier!==b.tier).slice(0,4);
  // shared dominant family
  const myFams=new Set(brandStats(b.name).fams.map(f=>Object.keys(FAM).find(k=>FAM[k].color===f.color)));
  const sharedFam=all.filter(x=>{
    const xf=new Set(brandStats(x.name).fams.map(f=>Object.keys(FAM).find(k=>FAM[k].color===f.color)));
    return [...myFams].some(k=>xf.has(k));
  }).filter(x=>!sameCountry.includes(x)).slice(0,4);

  function group(title,sub,arr){
    if(!arr.length)return "";
    return `<div class="fp-net-col"><h5>${title}<span style="font-family:'Cormorant',serif;font-style:italic;font-size:12px;color:#67676d;margin-left:6px">${sub}</span></h5>
      ${arr.map(x=>`<div class="bnchip" data-bn="${x.name}"><span class="bnn">${x.name}</span><span class="bnm">${x.country} ／ est. ${x.founded}</span></div>`).join("")}</div>`;
  }
  return `<div class="fp-network">
    <h3>関連ブランドマップ</h3>
    <p class="ksub">同じ国・同じ世代・同じ価格帯・近い香調のブランド</p>
    <div class="fp-net-groups">
      ${group("同じ国","same country",sameCountry)}
      ${group("同じ価格帯","same tier",sameTier)}
      ${group("同じ世代","±15 years",sameEra)}
      ${group("似た香調","shared family",sharedFam)}
    </div>
  </div>`;
}

/* patch openBrandModal to append network */
const _origOpenBrandModal=openBrandModal;
openBrandModal=function(b){
  _origOpenBrandModal(b);
  const m=document.getElementById("brandModalInner");
  // 挿入: fp-note の直前にネットワークを差し込む
  const note=m.querySelector(".fp-note");
  if(note){
    note.insertAdjacentHTML("beforebegin", brandNetwork(b));
    m.querySelectorAll(".fp-network .bnchip").forEach(el=>{
      el.onclick=()=>{const bb=BRANDS.find(x=>x.name===el.dataset.bn);if(bb){closeBrandModal();setTimeout(()=>openBrandModal(bb),250);}};
    });
  }
};

const ARTICLE_SLUGS={"シャネルとディオール、パリ二大メゾンの違い": "chanel-vs-dior", "ル ラボとジョー マローン、現代ニッチの2大スター": "lelabo-vs-jomalone", "トム フォードとクリード、高級メンズの頂点を比較": "tomford-vs-creed", "アエソップとディプティック、ナチュラル系ニッチの本流": "aesop-vs-diptyque", "マルジェラとバイレード、モダンニッチの新世代": "margiela-vs-byredo", "エルメスとアクア ディ パルマ、老舗の上品さの違い": "hermes-vs-acquadiparma", "ブルガリとヴェルサーチ、イタリア二大ブランドの香水比較": "bvlgari-vs-versace", "なぜマルジェラのレプリカは人気なのか": "why-margiela-replica", "香水のつけ方、適量という正解": "how-to-wear", "トップ・ミドル・ラストの読み方": "notes-pyramid", "ビジネスで外さない香りの条件": "business-fragrance", "EDT・EDP・パルファムの違い": "concentration-guide", "季節×シーンで選ぶメンズ香水マップ": "season-scene-map", "香水初心者の一本目｜失敗しない5ステップ": "first-fragrance"};

/* 内部リンク: 各記事カードに静的ページへのリンクを追加 */
function addArticleLinks(){
  document.querySelectorAll(".cmpcard, .colcard").forEach(card=>{
    const t=card.querySelector(".ctitle");
    if(!t)return;
    const slug=ARTICLE_SLUGS[t.textContent.trim()];
    if(!slug||card.querySelector(".permalink"))return;
    const a=document.createElement("a");
    a.className="permalink";
    a.href="/columns/"+slug;
    a.textContent="図解つきの記事を読む →";
    card.appendChild(a);
  });
}

/* ---------- staged home loading ---------- */
let deferredHomePromise=null;
let deferredHomeInitialized=false;

async function fetchHomeResource(url,type){
  const response=await fetch(url,{credentials:"same-origin"});
  if(!response.ok)throw new Error(`${url} returned ${response.status}`);
  return type==="json"?response.json():response.text();
}

function initializeDeferredHome(){
  if(deferredHomeInitialized)return;
  initAnchorNavigation();
  initFilterShortcuts();
  buildChips("sceneChips",SCENE,"scene");
  buildChips("seasonChips",SEASON,"season");
  buildChips("genderChips",GENDER,"gender");
  buildChips("priceChips",PRICE,"price");
  applyFiltersFromUrl();
  document.getElementById("resetBtn").onclick=()=>{Object.keys(state).forEach(k=>state[k]=null);safeRender();};
  buildGuide();
  safeRender();
  buildRanking();
  buildBrandTools();
  renderBrands();
  renderQuiz();
  buildColumns();
  buildMegaTimeline();
  buildCompares();
  addArticleLinks();
  deferredHomeInitialized=true;
}

function showDeferredHomeError(){
  const host=document.getElementById("deferredHome");
  if(!host)return;
  host.classList.remove("is-loaded");
  host.setAttribute("aria-busy","false");
  host.innerHTML=`<div class="deferred-error" role="alert">
    <p>香水データを読み込めませんでした。通信状況を確認して、もう一度お試しください。</p>
    <button type="button" id="deferredRetry">再読み込み</button>
  </div>`;
  document.getElementById("deferredRetry").onclick=()=>loadDeferredHome().catch(()=>{});
}

function loadDeferredHome(){
  if(deferredHomeInitialized)return Promise.resolve();
  if(deferredHomePromise)return deferredHomePromise;
  const host=document.getElementById("deferredHome");
  if(!host)return Promise.reject(new Error("Deferred home container not found."));
  host.setAttribute("aria-busy","true");
  deferredHomePromise=Promise.all([
    fetchHomeResource("/partials/home-deferred.html","text"),
    fetchHomeResource("/data/fragrances.json","json"),
    fetchHomeResource("/data/brands.json","json"),
  ]).then(([fragment,fragrances,brands])=>{
    if(!Array.isArray(fragrances)||fragrances.length!==92)throw new Error("Expected 92 fragrances.");
    if(!Array.isArray(brands)||brands.length!==47)throw new Error("Expected 47 brands.");
    PERFUMES=fragrances;
    BRANDS=brands;
    host.innerHTML=fragment;
    host.classList.add("is-loaded");
    host.setAttribute("aria-busy","false");
    initializeDeferredHome();
    window.__SILLAGE_HOME_DATA_READY__=true;
  }).catch(error=>{
    console.error("Deferred home loading failed.",error);
    deferredHomePromise=null;
    showDeferredHomeError();
    throw error;
  });
  return deferredHomePromise;
}

function observeDeferredHome(){
  const host=document.getElementById("deferredHome");
  if(!host)return;
  if("IntersectionObserver" in window){
    const observer=new IntersectionObserver(entries=>{
      if(!entries.some(entry=>entry.isIntersecting))return;
      observer.disconnect();
      loadDeferredHome().catch(()=>{});
    },{rootMargin:"800px 0px"});
    observer.observe(host);
  }else{
    const fallback=()=>{
      if(host.getBoundingClientRect().top>window.innerHeight+800)return;
      window.removeEventListener("scroll",fallback);
      loadDeferredHome().catch(()=>{});
    };
    window.addEventListener("scroll",fallback,{passive:true});
    fallback();
  }
}

initFilterShortcuts();
initAnchorNavigation();
applyFiltersFromUrl();
favLoad();
updateFavCount();
buildWheel();
initScrolly();
initParticles();
document.getElementById("favBtn").onclick=()=>loadDeferredHome().then(openFavorites).catch(()=>{});
observeDeferredHome();
if(location.hash&&location.hash!=="#fragrance-wheel"){
  const initialHash=location.hash;
  loadDeferredHome().then(()=>{
    const target=document.querySelector(initialHash);
    if(target)requestAnimationFrame(()=>target.scrollIntoView({behavior:"auto",block:"start"}));
  }).catch(()=>{});
}
const initialFilterParams=new URLSearchParams(location.search);
if(["family","scene","season","gender","price"].some(key=>initialFilterParams.has(key))){
  loadDeferredHome().catch(()=>{});
}
