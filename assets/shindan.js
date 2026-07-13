/* =====================================================================
   関係の温度と距離を整える技術 ── 共有診断エンジン
   温度×距離の2軸を、全8問が同時に測る。単一選択 → 4タイプ。
   軸は共有（商品名の核）。ドメインごとに設問・型・結果文だけ差し替える。
     window.SHINDAN = ドメインデータ（domainLabel, hubUrl, ctaLabel,
       tempNames, distNames, field, Q, TYPES, DAY_ANSWER）
     window.ENTRY   = { start:0..6|null, home:{...} }（入口）
   start を指定すると、その日の問いを1問目にして残りへ進む（残り7問＋Q8）。
   ===================================================================== */
(function () {
  "use strict";
  var D = window.SHINDAN || {};
  var CFG = window.ENTRY || {};
  var MEMBERSHIP = "https://note.com/coconocanvas/membership?from=self";

  var TEMP_NAMES = D.tempNames;
  var DIST_NAMES = D.distNames;
  var Q = D.Q;
  var TYPES = D.TYPES;
  var DAY_ANSWER = D.DAY_ANSWER;
  var FIELD = D.field || { top: "溢れる", bottom: "隠す", left: "閉じる", right: "明け渡す" };
  var HUB = D.hubUrl || "/";

  /* 出題順：start を先頭にして、残りの投稿分 → Q8 は常に最後 */
  var order;
  if (typeof CFG.start === "number" && CFG.start >= 0 && CFG.start <= 6) {
    order = [CFG.start];
    for (var i = 0; i < 7; i++) { if (i !== CFG.start) order.push(i); }
    order.push(7);
  } else {
    order = [0, 1, 2, 3, 4, 5, 6, 7];
  }

  var idx = 0, answers = [], app = document.getElementById("app");
  if (!app || !D.Q) return;

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
      + '<text class="jp" x="150" y="24" text-anchor="middle" dominant-baseline="hanging">' + FIELD.top + '</text>'
      + '<text x="150" y="230" text-anchor="middle">FREEZE</text>'
      + '<text class="jp" x="150" y="216" text-anchor="middle">' + FIELD.bottom + '</text>'
      + '<text x="8" y="112">CLOSE</text>'
      + '<text class="jp" x="8" y="126">' + FIELD.left + '</text>'
      + '<text x="292" y="112" text-anchor="end">OPEN</text>'
      + '<text class="jp" x="292" y="126" text-anchor="end">' + FIELD.right + '</text>'
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
    var title = h.title || "温度と距離";
    var lede = h.lede || "8つの問いで、いまどこに立っているかが出る。所要 約2分。";
    var startSmall = h.startSmall || "1問ずつ・全8問・単一選択";
    app.innerHTML = '<div class="fade">'
      + '<button class="hub-back" id="pageBack" type="button">&larr; 戻る</button>'
      + '<p class="eyebrow">' + eyebrow + '</p>'
      + kicker
      + '<h1>' + title + '</h1>'
      + '<p class="lede">' + lede + '</p>'
      + '<div class="rule"></div>'
      + '<button class="start" id="go">はじめる<small>' + startSmall + '</small></button>'
      + '<p class="sig">ネイル・飲食・BAR運営20年。延べ5万人超との対話から。<br><span>Coco Methodology</span></p>'
      + '</div>';
    document.getElementById("go").onclick = function () { idx = 0; answers = []; question(); };
    var pb = document.getElementById("pageBack");
    if (pb) pb.onclick = function () { if (history.length > 1) history.back(); else location.assign(HUB); };
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
      + '<button class="ghost" id="back">ひとつ戻る</button>'
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
    if (bk) bk.onclick = function () {
      if (idx > 0) { idx--; answers[order[idx]] = null; question(); }
      else { home(); }
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
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
    var b3 = (typeof CFG.start === "number" && DAY_ANSWER[CFG.start] && DAY_ANSWER[CFG.start][key])
      ? DAY_ANSWER[CFG.start][key] : { q: T.ansQ, ans: T.ans };
    var ans3 = b3.ans.map(function (p, i) {
      return '<p' + (i === b3.ans.length - 1 ? ' class="strong"' : '') + '>' + p + '</p>';
    }).join("");

    app.innerHTML = '<div class="fade">'
      + '<div class="result-banner"><span class="rb-line"></span><span class="rb-label">診断結果</span><span class="rb-line"></span></div>'
      + '<p class="r-code">YOUR TYPE ── ' + D.domainLabel + '</p>'
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
        + '<div class="answer"><p class="a-q">' + b3.q + '</p>' + ans3 + '</div>'
      + '</div>'
      + '<div class="block">'
        + '<div class="b-label"><span class="b-num">4</span><span class="b-title">ここから</span></div>'
        + '<p>ただ、これは「なぜそうなるか」の説明であって、「どうするか」ではない。</p>'
        + '<p>' + T.bridge + '</p>'
        + '<a class="cta" href="' + MEMBERSHIP + '" target="_blank" rel="noopener">' + D.ctaLabel + '<small>整える順番を、ひとつずつ</small></a>'
      + '</div>'
      + '<div class="result-nav"><button class="ghost" id="again">もう一度診断する</button><a class="ghost" href="' + HUB + '">診断一覧へ</a></div>'
      + '<p class="sig">感情はある。依存はしない。<br><span>Coco Methodology</span></p>'
      + '</div>';
    document.getElementById("again").onclick = function () { idx = 0; answers = []; home(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  }

  home();
})();
