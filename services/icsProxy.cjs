const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors({ origin: true }));

app.get("/health", (_req, res) => res.status(200).send("ok"));

app.get("/ics", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url");
  try {
    const r = await axios.get(url, {
      responseType: "text",
      maxRedirects: 5,
      headers: { "User-Agent": "ics-proxy/1.0" },
      validateStatus: () => true,
    });
    if (r.status < 200 || r.status >= 300) {
      console.error("Upstream non-2xx:", r.status, r.statusText);
      return res.status(r.status).send("Upstream HTTP " + r.status);
    }
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.send(r.data);
  } catch (e) {
    const msg = (e.response?.status ? `HTTP ${e.response.status}` : (e.code || e.message || String(e)));
    console.error("Proxy error:", msg);
    res.status(500).send("Proxy failed: " + msg);
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`✅ Proxy actif sur http://localhost:${PORT}`));
