/* ===================================================================
   shindan-post.js
   投稿markdown（#src に埋め込み）を解析し、
   「A〜Dを選ぶ → 対応する読みが出る」診断UIとして描画する。
   内容の単一ソースは各HTMLに埋め込まれた markdown。ここでは表示のみ。
   =================================================================== */
(function () {
  "use strict";

  var MEMBERSHIP = "https://note.com/coconocanvas/membership?from=self";

  var app = document.getElementById("app");
  var src = document.getElementById("src");
  if (!app || !src) return;

  var raw = src.textContent.replace(/\r\n/g, "\n").trim();
  var post = parse(raw);
  if (post) {
    document.title = post.subtitle + " ｜ 関係の温度と距離を整える技術";
  }
  renderQuestion(post);

  /* ---------- 解析 ---------- */
  function parse(md) {
    var lines = md.split("\n");

    // H1 → 日付とサブタイトル
    var h1 = "";
    for (var i = 0; i < lines.length; i++) {
      if (/^#\s+/.test(lines[i])) { h1 = lines[i].replace(/^#\s+/, "").trim(); break; }
    }
    var date = h1, subtitle = h1;
    var barAt = h1.indexOf("|");
    if (barAt === -1) barAt = h1.indexOf("｜");
    if (barAt !== -1) {
      date = h1.slice(0, barAt).trim();
      subtitle = h1.slice(barAt + 1).trim();
    }

    // ``` フェンスで囲まれたコードブロックを取り出す（奇数番目が中身）
    var parts = md.split("```");
    var blocks = [];
    for (var j = 1; j < parts.length; j += 2) blocks.push(parts[j].replace(/^\n/, "").replace(/\n$/, ""));
    if (blocks.length < 2) return null;
    var qBlock = blocks[0];   // 質問投稿
    var rBlock = blocks[1];   // 返信欄

    // --- 質問ブロック ---
    var qLines = qBlock.split("\n");
    var options = [];         // {key, label}
    var rest = [];
    qLines.forEach(function (ln) {
      var m = ln.match(/^([A-D])[.．]\s+(.+)$/);
      if (m) { options.push({ key: m[1], label: m[2].trim() }); return; }
      if (/^A〜D/.test(ln.trim())) return;         // 運用上の指示行は除外
      if (ln.trim() === "") { rest.push(""); return; }
      rest.push(ln.trim());
    });
    // 空行を段落境界として intro / question を作る
    var restNonEmpty = rest.filter(function (x) { return x !== ""; });
    var question = restNonEmpty.length ? restNonEmpty[restNonEmpty.length - 1] : "";
    var introLines = restNonEmpty.slice(0, restNonEmpty.length - 1);
    var intro = groupParagraphs(rest, introLines);

    // --- 返信欄ブロック ---
    var segs = rBlock.split(/─{5,}/).map(function (s) { return s.trim(); }).filter(function (s) { return s !== ""; });
    var readings = {};         // key → {head, body[]}
    var closing = [];
    segs.forEach(function (seg, idx) {
      var m = seg.match(/^([A-D])｜(.*)$/m);
      if (m && /^[A-D]｜/.test(seg)) {
        var segLines = seg.split("\n");
        var head = segLines[0].replace(/^[A-D]｜/, "").trim();
        var body = paragraphsFrom(segLines.slice(1));
        readings[m[1]] = { head: head, body: body };
      } else if (idx === 0) {
        // 先頭のリード段落は表示では省略（intro と重複するため）
      } else {
        closing = closing.concat(paragraphsFrom(seg.split("\n")));
      }
    });

    return {
      date: date, subtitle: subtitle,
      intro: intro, question: question,
      options: options, readings: readings, closing: closing
    };
  }

  // 空行区切りで段落配列を作る（順序保持のため元 rest を使い、対象行のみ拾う）
  function groupParagraphs(restWithBlanks, targetLines) {
    var set = {};
    targetLines.forEach(function (t) { set[t] = true; });
    var paras = [], cur = [];
    restWithBlanks.forEach(function (ln) {
      if (ln === "") { if (cur.length) { paras.push(cur.join("")); cur = []; } return; }
      if (set[ln]) cur.push(ln);
    });
    if (cur.length) paras.push(cur.join(""));
    return paras;
  }

  // 行配列 → 空行区切りの段落配列
  function paragraphsFrom(arr) {
    var paras = [], cur = [];
    arr.forEach(function (ln) {
      var t = ln.trim();
      if (t === "") { if (cur.length) { paras.push(cur.join("")); cur = []; } return; }
      cur.push(t);
    });
    if (cur.length) paras.push(cur.join(""));
    return paras;
  }

  /* ---------- 描画 ---------- */
  function el(html) { var d = document.createElement("div"); d.innerHTML = html; return d.firstElementChild; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function pTags(arr, cls) {
    return arr.map(function (p) { return "<p" + (cls ? ' class="' + cls + '"' : "") + ">" + esc(p) + "</p>"; }).join("");
  }

  function renderQuestion(post) {
    if (!post) { app.innerHTML = '<p class="lede">投稿を読み込めませんでした。</p>'; return; }
    var cards = post.options.map(function (o) {
      return '<button class="card" data-k="' + o.key + '"><span class="k">' + o.key + '</span>' + esc(o.label) + "</button>";
    }).join("");
    app.innerHTML =
      '<div class="fade">' +
        '<p class="eyebrow">The Art of Temperature &amp; Distance</p>' +
        '<p class="code">' + esc(post.date) + " &mdash;&mdash; 距離の手記</p>" +
        '<h1 class="post-title">' + esc(post.subtitle) + "</h1>" +
        '<div class="intro">' + pTags(post.intro) + "</div>" +
        '<div class="rule"></div>' +
        '<p class="qtext">' + esc(post.question) + "</p>" +
        cards +
        '<p class="sig">近いものを、ひとつ選ぶ。<br><span>Coco Methodology</span></p>' +
      "</div>";
    app.querySelectorAll("[data-k]").forEach(function (b) {
      b.onclick = function () { renderReading(post, b.getAttribute("data-k")); };
    });
  }

  function renderReading(post, key) {
    var r = post.readings[key];
    if (!r) { renderQuestion(post); return; }
    app.innerHTML =
      '<div class="fade">' +
        '<p class="code">READING &mdash;&mdash; ' + key + "</p>" +
        '<h2 class="tname">' + esc(r.head) + "</h2>" +
        '<div class="reading">' + pTags(r.body) + "</div>" +
        '<div class="rule"></div>' +
        '<div class="closing">' + pTags(post.closing) + "</div>" +
        '<div class="rule"></div>' +
        '<a class="cta primary" href="' + MEMBERSHIP + '" target="_blank" rel="noopener">メンバーシップを読む<small>タイプ別の設計を、毎月ひとつずつ</small></a>' +
        '<button class="ghost" id="back">ほかの選択肢も読む</button>' +
      "</div>";
    document.getElementById("back").onclick = function () { renderQuestion(post); };
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
})();
