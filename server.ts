import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dataService } from './server/dataService.js';
import {
  classifyCitizenRequest,
  summarizeVillageData,
  generateProjectRecommendation,
  runAICommandAnalysis,
  runGeminiChat
} from './server/geminiService.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. KPI Stats Endpoint
  app.get('/api/stats', (req, res) => {
    try {
      const stats = dataService.getStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Villages Endpoint
  app.get('/api/villages', (req, res) => {
    try {
      const villages = dataService.getAllVillages();
      res.json(villages);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Single Village Details
  app.get('/api/villages/:code', (req, res) => {
    try {
      const code = parseInt(req.params.code, 10);
      const village = dataService.getVillage(code);
      if (!village) {
        return res.status(404).json({ error: 'Village not found' });
      }
      res.json(village);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Citizen Requests Search & Filter
  app.get('/api/requests', (req, res) => {
    try {
      const { villageCode, category, severity, language, search, page, pageSize } = req.query;
      const result = dataService.getRequests({
        villageCode: villageCode ? parseInt(villageCode as string, 10) : undefined,
        category: category as string,
        severity: severity as string,
        language: language as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        pageSize: pageSize ? parseInt(pageSize as string, 10) : 25,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Submit New Citizen Request
  app.post('/api/requests', (req, res) => {
    try {
      const { village_code, category, description, language, severity, source } = req.body;
      if (!village_code || !category || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const newReq = dataService.addRequest({
        village_code: parseInt(village_code, 10),
        category,
        description,
        language: language || 'English',
        severity: severity || 'Medium',
        source: source || 'Citizen Web Portal'
      });
      res.status(201).json(newReq);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Gemini: Classify Citizen Request
  app.post('/api/gemini/classify', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Missing text parameter' });
      }
      const classification = await classifyCitizenRequest(text);
      res.json(classification);
    } catch (err: any) {
      console.error('Error classifying request:', err);
      res.status(500).json({ error: 'AI classification is temporarily unavailable.' });
    }
  });

  // 7. Gemini: Village Situation Summary
  app.post('/api/gemini/summarize-village', async (req, res) => {
    try {
      const { villageCode } = req.body;
      const village = dataService.getVillage(parseInt(villageCode, 10));
      if (!village) {
        return res.status(404).json({ error: 'Village not found' });
      }
      const summary = await summarizeVillageData(village);
      res.json({ summary });
    } catch (err: any) {
      console.error('Error summarizing village:', err);
      res.status(500).json({ error: 'AI summary is temporarily unavailable.' });
    }
  });

  // 8. Gemini: Project Recommendation
  app.post('/api/gemini/project-recommendation', async (req, res) => {
    try {
      const { villageCode, category } = req.body;
      const village = dataService.getVillage(parseInt(villageCode, 10));
      if (!village) {
        return res.status(404).json({ error: 'Village not found' });
      }
      const recommendation = await generateProjectRecommendation(village, category || village.topCategory);
      res.json(recommendation);
    } catch (err: any) {
      console.error('Error generating recommendation:', err);
      res.status(500).json({ error: 'AI recommendation is temporarily unavailable.' });
    }
  });

  // 9. Gemini: AI Command Center Analysis
  app.post('/api/gemini/command-analysis', async (req, res) => {
    try {
      const { query, villageCode } = req.body;
      const village = dataService.getVillage(parseInt(villageCode, 10)) || dataService.getAllVillages()[0];
      if (!village) {
        return res.status(404).json({ error: 'No village available for analysis' });
      }
      const result = await runAICommandAnalysis(query || 'Analyze infrastructure demand hotspots', village);
      res.json(result);
    } catch (err: any) {
      console.error('Error in command analysis:', err);
      res.status(500).json({ error: 'AI analysis is temporarily unavailable.' });
    }
  });

  // 10. Gemini: Multi-turn Chat Interface
  // Supports gemini-3.5-flash (general), gemini-3.1-flash-lite (fast), gemini-3.1-pro-preview (complex)
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages, model, rolePreset, villageCode } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid messages array' });
      }

      let villageContext = undefined;
      if (villageCode) {
        villageContext = dataService.getVillage(parseInt(villageCode, 10));
      }

      const chatResult = await runGeminiChat({
        messages,
        model,
        rolePreset,
        villageContext
      });

      res.json(chatResult);
    } catch (err: any) {
      console.error('Error in multi-turn chat:', err);
      res.status(500).json({
        reply: 'The JanSetu AI chatbot is temporarily unavailable. Please retry in a few moments.',
        modelUsed: 'fallback',
        rolePreset: req.body?.rolePreset || 'civic-advisor'
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware / static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Create HTTP server to attach Express routes
  const server = createServer(app);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`JanSetu AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
