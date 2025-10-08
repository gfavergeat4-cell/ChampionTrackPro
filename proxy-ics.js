const express = require("express");
const fetch = require("node-fetch"); // v2
const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, *");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/health", (req, res) => res.status(200).json({ ok: true, ts: Date.now() }));

app.get("/ics", async (req, res) => {
  const url = req.query.url;
  console.log(`[proxy] GET /ics url=${url}`);
  if (!url) return res.status(400).send("missing_url");
  try {
    const r = await fetch(url, { timeout: 20000 });
    console.log(`[proxy] upstream status=${r.status}`);
    if (!r.ok) {
      const t = await r.text().catch(()=> "");
      console.error("[proxy] upstream body:", t.slice(0,200));
      return res.status(502).send("upstream_" + r.status);
    }
    const text = await r.text();
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(text);
  } catch (e) {
    console.error("[proxy] error:", e && e.stack || e);
    return res.status(500).send("proxy_error");
  }
});

const PORT = 8787;
app.listen(PORT, "0.0.0.0", () => console.log("ICS proxy listening http://127.0.0.1:"+PORT));
