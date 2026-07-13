/* =====================================================================
   曜日別・深堀り診断 ── 共有エンジン
   各ページが window.DEEPDIVE にその日のデータをセットして読み込む。
   1テーマ・8問2択 → 1軸の二極（どっち側か）→ メンバーシップ。
   ===================================================================== */
(function () {
  "use strict";
  var MEMBERSHIP = "https://note.com/coconocanvas/membership?from=self";
  var DATA = window.DEEPDIVE;
  var app = document.getElementById("app");
  if (!DATA || !app) return;

  var idx = 0, picks = [];

  /* 1軸マップ：pos は -1(左) .. +1(右) */
  function scale(pos, lit) {
    var cx = 150 + pos * 116;
    return '<div class="scale"><svg viewBox="0 0 300 64" role="img" aria-label="'
      + DATA.axis.left.name + 'と' + DATA.axis.right.name + 'の現在地">'
      + '<line class="track" x1="34" y1="34" x2="266" y2="34"/>'
      + '<text x="30" y="20" text-anchor="start">' + DATA.axis.left.en + '</text>'
      + '<text class="jp" x="30" y="56" text-anchor="start">' + DATA.axis.left.name + '</text>'
      + '<text x="270" y="20" text-anchor="end">' + DATA.axis.right.en + '</text>'
      + '<text class="jp" x="270" y="56" text-anchor="end">' + DATA.axis.right.name + '</text>'
      + (lit ? '<circle class="halo" cx="' + cx + '" cy="34" r="13"/>' : '')
      + '<circle class="halo" cx="' + cx + '" cy="34" r="' + (lit ? 9 : 7) + '"/>'
      + '<circle class="dot" cx="' + cx + '" cy="34" r="' + (lit ? 5 : 4) + '"/>'
      + '</svg></div>';
  }
  function partialPos() {
    var n = picks.length; if (!n) return 0;
    var a = 0; for (var i = 0; i < n; i++) { if (picks[i] === 'A') a++; }
    return (a / n) * 2 - 1;
  }

  function home() {
    var d = DATA.home;
    app.innerHTML = '<div class="fade">'
      + '<p class="eyebrow">' + d.eyebrow + '</p>'
      + '<p class="kicker">' + DATA.date + '（' + DATA.weekday + '） ── ' + DATA.theme + '</p>'
      + '<h1>' + d.title + '</h1>'
      + '<p class="lede">' + d.lede + '</p>'
      + '<div class="rule"></div>'
      + '<button class="start" id="go">8問ではじめる<small>2択・約1分・あなたがどっち側か出る</small></button>'
      + '<p class="sig">延べ5万人超との対話から。<br><span>Coco Methodology</span></p>'
      + '</div>';
    document.getElementById("go").onclick = function () { idx = 0; picks = []; question(); };
  }

  function question() {
    var item = DATA.q[idx], ticks = "";
    for (var i = 0; i < DATA.q.length; i++) { ticks += '<div class="tick' + (i < idx ? " on" : "") + '"></div>'; }
    app.innerHTML = '<div class="fade">'
      + '<div class="top"><span class="qnum">Q <b>' + (idx + 1) + '</b> / 8</span><div class="ticks">' + ticks + '</div></div>'
      + scale(partialPos(), false)
      + '<p class="qtext">' + item.t + '</p>'
      + '<button class="card" data-s="' + item.a.side + '"><span class="k">A</span>' + item.a.label + '</button>'
      + '<button class="card" data-s="' + item.b.side + '"><span class="k">B</span>' + item.b.label + '</button>'
      + (idx > 0 ? '<button class="ghost" id="back">ひとつ戻る</button>' : '')
      + '</div>';
    var cs = app.querySelectorAll('[data-s]');
    for (var j = 0; j < cs.length; j++) {
      (function (b) {
        b.onclick = function () {
          picks[idx] = b.getAttribute('data-s'); idx++;
          if (idx < DATA.q.length) { question(); } else { done(); }
          window.scrollTo({ top: 0, behavior: "smooth" });
        };
      })(cs[j]);
    }
    var bk = document.getElementById("back");
    if (bk) bk.onclick = function () { idx--; picks.pop(); question(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  }

  function done() {
    var ticks = "";
    for (var i = 0; i < DATA.q.length; i++) { ticks += '<div class="tick on"></div>'; }
    app.innerHTML = '<div class="fade">'
      + '<div class="top"><span class="qnum">8 <b>/</b> 8　完了</span><div class="ticks">' + ticks + '</div></div>'
      + '<div class="done-wrap">'
      + '<p class="done-mark">ALL DONE ── 8問、おわり</p>'
      + '<div class="done-check" aria-hidden="true"></div>'
      + '<p class="done-h">ぜんぶ、答えました。</p>'
      + '<p class="done-sub">あなたがどっち側か、出ました。</p>'
      + '<button class="start" id="see">結果を見る<small>あなたの側と、その理由</small></button>'
      + '</div></div>';
    document.getElementById("see").onclick = function () { result(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  }

  function result() {
    var a = 0; for (var i = 0; i < picks.length; i++) { if (picks[i] === 'A') a++; }
    var side = a >= 4 ? "A" : "B";
    var deg = Math.max(a, 8 - a);
    var R = DATA.results[side];
    var pos = (a / 8) * 2 - 1;
    var body = R.body.map(function (p, i) { return '<p' + (i === R.body.length - 1 ? ' class="strong"' : '') + '>' + p + '</p>'; }).join("");
    app.innerHTML = '<div class="fade">'
      + '<div class="result-banner"><span class="rb-line"></span><span class="rb-label">診断結果</span><span class="rb-line"></span></div>'
      + '<p class="r-code">YOUR SIDE ── ' + DATA.theme + '</p>'
      + '<h2 class="r-name">' + R.name + '</h2>'
      + '<p class="r-sub">' + R.sub + '</p>'
      + '<p class="r-deg">' + deg + ' ／ 8</p>'
      + scale(pos, true)
      + '<div class="body">' + body + '</div>'
      + '<div class="rule"></div>'
      + '<div class="bridge"><p class="lead">ただ、これは「なぜそうなるか」の話。「どうするか」ではない。</p><p>' + R.bridge + '</p></div>'
      + '<a class="cta" href="' + MEMBERSHIP + '" target="_blank" rel="noopener">その先は、チームCoco で<small>チームCoco ―― 恋愛と関係</small></a>'
      + '<button class="ghost" id="again">もう一度診断する</button>'
      + '<p class="sig">感情はある。依存はしない。<br><span>Coco Methodology</span></p>'
      + '</div>';
    document.getElementById("again").onclick = function () { idx = 0; picks = []; home(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  }

  home();
})();
