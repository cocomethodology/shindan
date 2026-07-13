/* =====================================================================
   関係の温度と距離を整える技術 ── 恋愛と関係の診断（共有エンジン）
   温度×距離の2軸を、全8問が同時に測る。単一選択 → 4タイプ。
   window.KANKEI = { start:0..6|null, home:{...} } で入口を切り替える。
   start を指定すると、その日の問いを1問目にして残りへ進む（残り7問＋Q8）。
   ===================================================================== */
(function () {
  "use strict";
  var CFG = window.KANKEI || {};
  var MEMBERSHIP = "https://note.com/coconocanvas/membership?from=self";

  var TEMP_NAMES = ["凍結", "隠す", "選ぶ", "溢れる"];   // 温度：低→高
  var DIST_NAMES = ["閉じる", "守る", "測る", "明け渡す"]; // 距離：低→高

  var Q = [
    { hook:"「こんなに良くしてくれるのに、なんで好きになれないんだろう」",
      q:"新しい人と近づくとき、自分に一番近いのはどれ？",
      o:[
        {k:"A", t:"好条件を出されるほど、逆に「何か下心があるのでは」と身構えてしまう", temp:2, dist:2},
        {k:"B", t:"相手の条件より、一緒にいて素の自分でいられるかを、いちばん最初に見てしまう", temp:3, dist:3},
        {k:"C", t:"相手の肩書きや羽振りの良さに、気づけば好意より先に憧れが先行してしまう", temp:4, dist:4},
        {k:"D", t:"「こんなに良くしてくれるなら」と、条件の良さで好きになろうとしてしまう", temp:1, dist:4}
      ]},
    { hook:"「今度は絶対に変える」——その言葉を、もう何回聞いただろう。",
      q:"その「なんか違う」に一番近いのはどれ？",
      o:[
        {k:"A", t:"「今度こそ」という言葉を、何度も本気で信じてしまう", temp:4, dist:4},
        {k:"B", t:"言い訳の内容が毎回変わることに、うっすら違和感を覚えながらも流してしまう", temp:2, dist:4},
        {k:"C", t:"一度改善したのを見て安心した矢先、また同じことが起きてがっかりする", temp:4, dist:3},
        {k:"D", t:"「言ってることとやってることが違う」と気づいた瞬間、静かに距離を測り直す", temp:2, dist:3}
      ]},
    { hook:"「は？」と思った瞬間、頭が真っ白になった。",
      q:"動揺したときの自分に、一番近いパターンはどれ？",
      o:[
        {k:"A", t:"動揺した後、少し時間を置いてから、落ち着いて言葉を選び直せる", temp:3, dist:3},
        {k:"B", t:"動揺した瞬間、感情がそのまま声や態度に出てしまう", temp:4, dist:4},
        {k:"C", t:"揺れたことを誰にも見せまいと、平気なふりで押し通してしまう", temp:2, dist:2},
        {k:"D", t:"一度動揺すると、何日も引きずって同じ場面を思い出してしまう", temp:4, dist:2}
      ]},
    { hook:"「そんなに大事にしてくれなくていいのに」",
      q:"自分に一番近いのはどれ？",
      o:[
        {k:"A", t:"大切にしてもらうと、まず「ごめんね、悪いよ」と謝る言葉が先に出てしまう", temp:2, dist:4},
        {k:"B", t:"優しくされるほど、「これ、何かのお返しを期待されてるのかな」と身構えてしまう", temp:2, dist:2},
        {k:"C", t:"素直に「ありがとう、嬉しい」と、受け取った気持ちをそのまま言葉にできる", temp:3, dist:3},
        {k:"D", t:"大事にされた瞬間はすごく嬉しいのに、後になってから急に照れくさくなって離れたくなる", temp:4, dist:2}
      ]},
    { hook:"「〇〇さんが、あなたのことこう言ってたよ」",
      q:"そんな時、自分に一番近いのはどれ？",
      o:[
        {k:"A", t:"「本人に直接言ってくれればいいのに」ともやもやしながら、結局何も言わずその場をやり過ごす", temp:2, dist:4},
        {k:"B", t:"気になって、話をした人の周りの反応を、それとなく探ってしまう", temp:3, dist:4},
        {k:"C", t:"黙っていられず、噂の出どころまで直接確かめに行ってしまう", temp:4, dist:4},
        {k:"D", t:"又聞きした瞬間は動揺しても、時間が経てば「本人の言葉じゃない」と自然に距離を置ける", temp:3, dist:2}
      ]},
    { hook:"「もうこれで最後にして」——何度目かの約束を、また同じ相手と交わした。",
      q:"それを変えたい時、自分に一番近いのはどれ？",
      o:[
        {k:"A", t:"「この行動はやめてほしい。でも、あなたのことは大切に思ってる」と、行動と気持ちを分けて伝えられる", temp:3, dist:3},
        {k:"B", t:"言ったつもりが「結局、そういう人だよね」と、気づけば人格を否定するような言い方になっている", temp:4, dist:4},
        {k:"C", t:"傷ついたことを伝えると相手を否定してしまう気がして、結局注意すること自体を諦めてしまう", temp:2, dist:2},
        {k:"D", t:"注意はできても、その後に「大丈夫、ここは変わらず好きだよ」と伝えるのを忘れてしまう", temp:2, dist:3}
      ]},
    { hook:"何かがこじれた関係を、少しだけ整え直してみる。",
      q:"関係を仕切り直すとき、自分に一番近いのはどれ？",
      o:[
        {k:"A", t:"気まずさを早く終わらせたくて、大丈夫じゃないのに「もう大丈夫」と急いで元に戻そうとする", temp:2, dist:4},
        {k:"B", t:"一度でも不安になったことがあると、なかなか元のペースに戻れない自分がいる", temp:4, dist:2},
        {k:"C", t:"少しずつ、様子を見ながら、無理のない範囲で関係を戻していける", temp:3, dist:3},
        {k:"D", t:"「もう関わらない」と決めたはずなのに、気づけばまた元のペースに戻ってしまっている", temp:4, dist:4}
      ]},
    { hook:"",
      q:"しんどい時、自分に一番近いのはどれ？",
      o:[
        {k:"A", t:"しんどい時、感情がそのまま全部こぼれてしまう", temp:4, dist:4},
        {k:"B", t:"しんどいと、相手を選んで「今しんどい」と言える", temp:3, dist:3},
        {k:"C", t:"しんどくても、心配をかけたくなくて平気なふりをする", temp:2, dist:2},
        {k:"D", t:"しんどいことに、自分でも気づかないまま動き続けている", temp:1, dist:1}
      ]}
  ];

  var TYPES = {
    "HH": { name:"溶ける人", tag:"感情も距離も差し出す。愛は深いが、境界が消える。",
      anchors:[1,2,5,6],
      punch:"バラバラに見えるが、全部おなじことをしている。感じたことを、そのまま、まるごと相手に渡している。温度も距離も、手元に何ひとつ残していない。",
      ansQ:"なぜ、いつも相手でいっぱいになってしまうのか。",
      ans:[
        "温度が高く、距離も明け渡している。感じた分だけ相手に流し込み、いつのまにか相手の基準で自分を決めている。だから、好きになるほど、自分の輪郭が薄くなっていく。",
        "愛が足りないのではない。むしろ、注ぎ方に蓋がないだけだ。境界は、冷たさではない。深く愛しつづけるために、いちばん要る器だ。"
      ],
      bridge:"溶ける人に要るのは、温度を下げることではない。要るのは、距離の置き方。ただ、距離から整えるのか、温度の出口を先につくるのか——順番を間違えると、たいてい元に戻る。" },
    "HL": { name:"灯す人", tag:"感情はあるのに、渡す相手を選びすぎる。中で燃やす。",
      anchors:[2,3,5,6],
      punch:"バラバラに見えるが、全部おなじことをしている。内側の熱は高い。なのに、その熱を渡す手前で、そっと引いている。温度は溢れそうで、距離は閉じている。",
      ansQ:"なぜ、こんなに想っているのに、伝わらないのか。",
      ans:[
        "温度は高い。ただ、渡す相手を選びすぎて、熱を内側で燃やしている。守っているつもりで、届けそこねている。",
        "想いが薄いのではない。むしろ濃いからこそ、軽々しくは手渡せないだけだ。灯は、消えてはいない。まだ、そっと覆われているだけだ。"
      ],
      bridge:"灯す人に要るのは、熱を上げることではない。すでに、充分に熱い。要るのは、その熱を渡す距離の開き方。ただ、どこから開けるかには、順番がある。" },
    "LH": { name:"尽くす人", tag:"相手は入れるが、自分の感情は出さない。役割で愛する。",
      anchors:[0,1,3,5],
      punch:"バラバラに見えるが、全部おなじことをしている。相手は入れる。でも、自分の感情は出さない。距離は明け渡し、温度は隠す。",
      ansQ:"なぜ、こんなに良くしてくれる人を、好きになれないのか。",
      ans:[
        "距離を明け渡すのが、早すぎる。感情が追いつく前に、相手がもう中に入ってきている。だから、好きになる前に「近い」が成立してしまう。",
        "好きになれないのではない。好きになる時間が、なかっただけだ。"
      ],
      bridge:"尽くす人に要るのは、もっと尽くすことではない。温度から上げようとすると、役割が増えるだけで、たいてい元に戻る。整える順番には、向きがある。" },
    "LL": { name:"守る人", tag:"揺れない。ただし、届かない。",
      anchors:[0,2,3,5],
      punch:"バラバラに見えるが、全部おなじことをしている。揺れないように、感じすぎないように、入れすぎないように。温度は隠し、距離は閉じている。守りは、ほとんど完璧だ。",
      ansQ:"なぜ、誰かを好きになっても、どこか遠いのか。",
      ans:[
        "揺れないことで、ずっと自分を守ってきた。温度を出さず、距離も開かない。それは弱さではなく、身につけた強さだ。",
        "ただ、その同じ壁が、届くはずの相手も外側に留めている。冷たいのではない。安全の内側から、まだ手を伸ばしていないだけだ。"
      ],
      bridge:"守る人に要るのは、いきなり心を開くことではない。それは怖いし、続かない。要るのは、どちらを先にゆるめるか——温度か、距離か。順番を間違えると、たいてい元に戻る。" }
  };

  /* 出題順：start を先頭にして、残りの投稿分 → Q8（弱っている）は常に最後 */
  var order;
  if (typeof CFG.start === "number" && CFG.start >= 0 && CFG.start <= 6) {
    order = [CFG.start];
    for (var i = 0; i < 7; i++) { if (i !== CFG.start) order.push(i); }
    order.push(7);
  } else {
    order = [0, 1, 2, 3, 4, 5, 6, 7];
  }

  var idx = 0, answers = [], app = document.getElementById("app");
  if (!app) return;

  function clampIdx(a) { return a < 1 ? 1 : (a > 4 ? 4 : a); }
  function nameOf(names, score) { return names[clampIdx(Math.round(score / 8)) - 1]; }

  function field(px, py, lit) {
    var q = "";
    if (lit) {
      var qx = px > 0 ? 156 : 12, qy = py > 0 ? 12 : 116;
      q = '<rect class="quad lit" x="' + qx + '" y="' + qy + '" width="132" height="104" rx="4"/>';
    }
    var cx = 150 + px * 62, cy = 116 - py * 48;
    return '<svg class="field" viewBox="0 0 300 236" role="img" aria-label="温度と距離の現在地">'
      + q
      + '<line class="grid-line" x1="150" y1="14" x2="150" y2="218"/>'
      + '<line class="grid-line" x1="12" y1="116" x2="288" y2="116"/>'
      + '<text x="150" y="9" text-anchor="middle" dominant-baseline="hanging">HEAT</text>'
      + '<text class="jp" x="150" y="24" text-anchor="middle" dominant-baseline="hanging">溢れる</text>'
      + '<text x="150" y="230" text-anchor="middle">FREEZE</text>'
      + '<text class="jp" x="150" y="216" text-anchor="middle">隠す</text>'
      + '<text x="8" y="112">CLOSE</text>'
      + '<text class="jp" x="8" y="126">閉じる</text>'
      + '<text x="292" y="112" text-anchor="end">OPEN</text>'
      + '<text class="jp" x="292" y="126" text-anchor="end">明け渡す</text>'
      + '<circle class="halo" cx="' + cx + '" cy="' + cy + '" r="15"/>'
      + '<circle class="dot" cx="' + cx + '" cy="' + cy + '" r="4.5"/>'
      + '</svg>';
  }

  function partialPos() {
    var n = 0, ts = 0, ds = 0;
    for (var i = 0; i < answers.length; i++) { if (answers[i]) { ts += answers[i].temp; ds += answers[i].dist; n++; } }
    if (n === 0) return { x: 0, y: 0 };
    var ty = (ts / n - 2.5) / 1.5, tx = (ds / n - 2.5) / 1.5;
    return { x: Math.max(-1, Math.min(1, tx)), y: Math.max(-1, Math.min(1, ty)) };
  }

  function home() {
    var h = CFG.home || {};
    var eyebrow = h.eyebrow || "The Art of Temperature &amp; Distance";
    var kicker = h.kicker ? '<p class="kicker">' + h.kicker + '</p>' : '';
    var title = h.title || "恋愛と関係の<br>温度と距離";
    var lede = h.lede || "関係がうまくいかないとき、原因は愛情の量でも相性でもない。感情の温度と、相手との距離。その2つの立ち位置にある。8つの問いで、いまどこに立っているかが出る。所要 約2分。";
    var startSmall = h.startSmall || "1問ずつ・全8問・単一選択";
    app.innerHTML = '<div class="fade">'
      + '<p class="eyebrow">' + eyebrow + '</p>'
      + kicker
      + '<h1>' + title + '</h1>'
      + '<p class="lede">' + lede + '</p>'
      + '<div class="rule"></div>'
      + '<button class="start" id="go">はじめる<small>' + startSmall + '</small></button>'
      + '<p class="sig">ネイル・飲食・BAR運営20年。延べ5万人超との対話から。<br><span>Coco Methodology</span></p>'
      + '</div>';
    document.getElementById("go").onclick = function () { idx = 0; answers = []; question(); };
  }

  function question() {
    var oi = order[idx];
    var item = Q[oi];
    var ticks = "";
    for (var i = 0; i < 8; i++) { ticks += '<div class="tick' + (i < idx ? " on" : "") + '"></div>'; }
    var pos = partialPos();
    var cards = item.o.map(function (o) {
      return '<button class="card" data-k="' + o.k + '"><span class="k">' + o.k + '</span>' + o.t + '</button>';
    }).join("");
    app.innerHTML = '<div class="fade">'
      + '<div class="top"><span class="qnum">Q <b>' + (idx + 1) + '</b> / 8</span><div class="ticks">' + ticks + '</div></div>'
      + field(pos.x, pos.y, false)
      + (item.hook ? '<p class="hook">' + item.hook + '</p>' : '')
      + '<p class="qtext">' + item.q + '</p>'
      + cards
      + (idx > 0 ? '<button class="ghost" id="back">ひとつ戻る</button>' : '')
      + '</div>';
    var btns = app.querySelectorAll("[data-k]");
    for (var j = 0; j < btns.length; j++) {
      (function (b) {
        b.onclick = function () {
          var key = b.getAttribute("data-k");
          for (var m = 0; m < item.o.length; m++) { if (item.o[m].k === key) { answers[oi] = item.o[m]; } }
          idx++;
          if (idx < 8) { question(); } else { done(); }
          window.scrollTo({ top: 0, behavior: "smooth" });
        };
      })(btns[j]);
    }
    var bk = document.getElementById("back");
    if (bk) bk.onclick = function () { idx--; answers[order[idx]] = null; question(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  }

  function done() {
    var ticks = "";
    for (var i = 0; i < 8; i++) { ticks += '<div class="tick on"></div>'; }
    app.innerHTML = '<div class="fade">'
      + '<div class="top"><span class="qnum">8 <b>/</b> 8　完了</span><div class="ticks">' + ticks + '</div></div>'
      + '<div class="done-wrap">'
      + '<p class="done-mark">ALL DONE ── 8問、おわり</p>'
      + '<div class="done-check" aria-hidden="true"></div>'
      + '<p class="done-h">ぜんぶ、答えました。</p>'
      + '<p class="done-sub">いま、どこに立っているか。出ました。</p>'
      + '<button class="start" id="see">結果を見る<small>あなたの型と、その理由</small></button>'
      + '</div></div>';
    document.getElementById("see").onclick = function () { result(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  }

  function result() {
    var ts = 0, ds = 0;
    for (var i = 0; i < answers.length; i++) { if (answers[i]) { ts += answers[i].temp; ds += answers[i].dist; } }
    var tempHigh = ts >= 21, distHigh = ds >= 21;
    var key = (tempHigh ? "H" : "L") + (distHigh ? "H" : "L");
    var T = TYPES[key];
    var tName = nameOf(TEMP_NAMES, ts), dName = nameOf(DIST_NAMES, ds);
    var px = Math.max(-1, Math.min(1, (ds / 8 - 2.5) / 1.5));
    var py = Math.max(-1, Math.min(1, (ts / 8 - 2.5) / 1.5));

    var lines = T.anchors.map(function (qi) {
      return '<li><span class="lq">Q' + (qi + 1) + '</span>' + answers[qi].t + '</li>';
    }).join("");
    var ans3 = T.ans.map(function (p, i) {
      return '<p' + (i === T.ans.length - 1 ? ' class="strong"' : '') + '>' + p + '</p>';
    }).join("");

    app.innerHTML = '<div class="fade">'
      + '<div class="result-banner"><span class="rb-line"></span><span class="rb-label">診断結果</span><span class="rb-line"></span></div>'
      + '<p class="r-code">YOUR TYPE ── 恋愛と関係</p>'
      + '<h2 class="r-name">' + T.name + '</h2>'
      + '<p class="r-tag">' + T.tag + '</p>'
      + '<div class="axes">'
        + '<div class="axis"><p class="a-label">TEMP ／ 温度</p><p class="a-name">' + tName + '</p>'
          + '<p class="a-score">' + ts + ' ／ 32</p><div class="a-bar"><div class="a-fill" style="width:' + Math.round((ts - 8) / 24 * 100) + '%"></div></div></div>'
        + '<div class="axis"><p class="a-label">DIST ／ 距離</p><p class="a-name">' + dName + '</p>'
          + '<p class="a-score">' + ds + ' ／ 32</p><div class="a-bar"><div class="a-fill" style="width:' + Math.round((ds - 8) / 24 * 100) + '%"></div></div></div>'
      + '</div>'
      + field(px, py, true)
      + '<div class="block">'
        + '<div class="b-label"><span class="b-num">2</span><span class="b-title">ひとつの線でつなぐ</span></div>'
        + '<p>選んだのは、別々の場面のはずだった。</p>'
        + '<ul class="lines">' + lines + '</ul>'
        + '<p class="strong">' + T.punch + '</p>'
      + '</div>'
      + '<div class="block">'
        + '<div class="b-label"><span class="b-num">3</span><span class="b-title">問いに、答えを返す</span></div>'
        + '<div class="answer"><p class="a-q">' + T.ansQ + '</p>' + ans3 + '</div>'
      + '</div>'
      + '<div class="block">'
        + '<div class="b-label"><span class="b-num">4</span><span class="b-title">ここから</span></div>'
        + '<p>ただ、これは「なぜそうなるか」の説明であって、「どうするか」ではない。</p>'
        + '<p>' + T.bridge + '</p>'
        + '<a class="cta" href="' + MEMBERSHIP + '" target="_blank" rel="noopener">チームCoco ―― 恋愛と関係<small>整える順番を、ひとつずつ</small></a>'
      + '</div>'
      + '<button class="ghost" id="again">もう一度診断する</button>'
      + '<p class="sig">感情はある。依存はしない。<br><span>Coco Methodology</span></p>'
      + '</div>';
    document.getElementById("again").onclick = function () { idx = 0; answers = []; home(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  }

  home();
})();
