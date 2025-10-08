import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/ics", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url");

  try {
    const r = await fetch(url);
    const text = await r.text();
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.send(text);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy failed");
  }
});

const PORT = 8787;
app.listen(PORT, () => console.log(`✅ Proxy ICS actif sur http://127.0.0.1:${PORT}`));
