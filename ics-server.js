import express from 'express';
import cors from 'cors';
import { importIcsForTeam } from './server-ics-import.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/import-ics', async (req, res) => {
  try {
    const { teamId, icsUrl } = req.body;
    
    if (!teamId || !icsUrl) {
      return res.status(400).json({ 
        ok: false, 
        error: 'teamId and icsUrl required' 
      });
    }

    console.log(`[ICS-SERVER] Starting import for team ${teamId} with URL: ${icsUrl}`);

    const result = await importIcsForTeam(teamId, icsUrl);
    
    console.log(`[ICS-SERVER] Import completed:`, result);
    res.json({ ok: true, ...result });

  } catch (e) {
    console.error('[ICS-SERVER] Error:', e);
    res.status(500).json({ 
      ok: false, 
      error: e.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 ICS Import Server running on port ${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/import-ics`);
});
