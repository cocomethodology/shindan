/* 診断完了を集計する軽量エンドポイント（Vercel Serverless + Vercel KV / Upstash REST）。
   送るのは {dom, wk, day, type} の集計値だけ。個人情報は一切扱わない。
   KV未接続でも 200 を返して診断側は壊さない（集計されないだけ）。 */
module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ ok: false }); return; }
  var url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  var token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) { res.status(200).json({ ok: false, reason: "kv-not-configured" }); return; }

  var body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (!body || typeof body !== "object") body = {};

  var DOMS = ["kankei", "soshiki"], WKS = ["w1", "w2"], TYPES = ["HH", "HL", "LH", "LL", "center"];
  var dom = DOMS.indexOf(body.dom) >= 0 ? body.dom : null;
  var wk = WKS.indexOf(body.wk) >= 0 ? body.wk : null;
  var type = TYPES.indexOf(body.type) >= 0 ? body.type : null;
  var day = parseInt(body.day, 10);
  if (isNaN(day) || day < -1 || day > 6) day = -1;
  if (!dom || !wk || !type) { res.status(400).json({ ok: false }); return; }

  var kv = function (path) {
    return fetch(url + "/" + path, { method: "POST", headers: { Authorization: "Bearer " + token } });
  };
  try {
    await Promise.all([
      kv("hincrby/type:" + dom + ":" + wk + "/" + type + "/1"),
      kv("hincrby/entry:" + dom + ":" + wk + "/" + day + "/1"),
      kv("hincrby/daytype:" + dom + ":" + wk + "/" + day + "_" + type + "/1"),
      kv("incr/total:" + dom + ":" + wk)
    ]);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: false, reason: "kv-error" });
  }
};
