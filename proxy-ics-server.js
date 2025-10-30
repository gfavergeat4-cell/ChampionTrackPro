import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware pour CORS
app.use(cors());

// Servir les fichiers statiques
app.use(express.static(__dirname));

// Route pour proxy les fichiers ICS
app.get('/proxy-ics', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log('📅 Proxying ICS request for:', url);
    
    // Si c'est le fichier de test local, le servir directement
    if (url.includes('localhost:3001/test-calendar.ics')) {
      const fs = await import('fs');
      const path = await import('path');
      
      try {
        const filePath = path.join(__dirname, 'test-calendar.ics');
        const icsContent = fs.readFileSync(filePath, 'utf8');
        
        console.log('✅ Test calendar served directly, length:', icsContent.length);
        
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(icsContent);
        return;
      } catch (fileError) {
        console.error('❌ Error reading test file:', fileError);
        throw new Error('Test calendar file not found');
      }
    }
    
    // Pour les autres URLs, utiliser fetch
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ChampionTrackPro/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const icsContent = await response.text();
    
    console.log('✅ ICS content retrieved, length:', icsContent.length);
    
    // Retourner le contenu ICS avec les bons headers
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(icsContent);
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 ICS Proxy server running on http://localhost:${PORT}`);
  console.log(`📅 Use: http://localhost:${PORT}/proxy-ics?url=YOUR_ICS_URL`);
});
