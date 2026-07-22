/* 集計の読み出し（非公開）。STATS_KEY を設定していれば ?key=... 必須。
   返すのは型分布・入口別・日×型・合計の集計値のみ。 */
module.exports = async (req, res) => {
  var url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  var token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  var KEY = process.env.STATS_KEY;
  var given = (req.query && req.query.key) || "";
  if (KEY && given !== KEY) { res.status(401).json({ error: "unauthorized" }); return; }
  if (!url || !token) { res.status(200).json({ configured: false }); return; }

  var hgetall = async function (key) {
    var r = await fetch(url + "/hgetall/" + key, { headers: { Authorization: "Bearer " + token } });
    var j = await r.json();
    var arr = (j && j.result) || [];
    var o = {};
    for (var i = 0; i < arr.length; i += 2) o[arr[i]] = Number(arr[i + 1]);
    return o;
  };
  var getn = async function (key) {
    var r = await fetch(url + "/get/" + key, { headers: { Authorization: "Bearer " + token } });
    var j = await r.json();
    return Number((j && j.result) || 0);
  };

  try {
    var out = {};
    var doms = ["kankei", "soshiki"], wks = ["w1", "w2", "w3"];
    for (var a = 0; a < doms.length; a++) {
      out[doms[a]] = {};
      for (var b = 0; b < wks.length; b++) {
        out[doms[a]][wks[b]] = {
          total: await getn("total:" + doms[a] + ":" + wks[b]),
          type: await hgetall("type:" + doms[a] + ":" + wks[b]),
          entry: await hgetall("entry:" + doms[a] + ":" + wks[b]),
          daytype: await hgetall("daytype:" + doms[a] + ":" + wks[b])
        };
      }
    }
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ configured: true, stats: out });
  } catch (e) {
    res.status(200).json({ configured: true, error: "read-failed" });
  }
};
