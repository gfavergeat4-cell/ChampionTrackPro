const express = require("express");
const cors = require("cors");
const http = require("http");
const https = require("https");
const { URL } = require("url");

const app = express();
app.use(cors());

function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === "https:" ? https : http;
    const req = lib.get(u, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error("HTTP " + res.statusCode));
        return;
      }
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
  });
}

app.get("/ics", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url");
  try {
    const text = await fetchRaw(url);
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.send(text);
  } catch (e) {
    console.error("Proxy error:", e.message);
    res.status(500).send("Proxy failed: " + e.message);
  }
});

const PORT = 8787;
app.listen(PORT, () => console.log(`✅ Proxy ICS actif sur http://127.0.0.1:${PORT}`));
