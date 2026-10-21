import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize server-side Gemini SDK if key is provided
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Route: Process voice transcript or typed request using Gemini
app.post('/api/voice/process', async (req, res) => {
  try {
    const { transcript, context } = req.body;
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    if (!ai) {
      // Graceful rule-based fallback if no Gemini API key
      const lower = transcript.toLowerCase();
      let action = 'GENERAL_ASSISTANCE';
      let spokenResponse = `I heard: "${transcript}". How can I assist you with your schedule or reminders?`;
      let data: any = {};

      if (lower.includes('sos') || lower.includes('emergency') || lower.includes('help me') || lower.includes('call 911')) {
        action = 'TRIGGER_SOS';
        spokenResponse = 'Activating emergency SOS now. Please stay calm while I notify your family and contacts.';
      } else if (lower.includes('medication') || lower.includes('medicine') || lower.includes('pill') || lower.includes('take')) {
        action = 'ADD_MEDICATION';
        spokenResponse = `I have noted your medication update: ${transcript}.`;
        data = { name: transcript.replace(/add medication|take pill|medicine/gi, '').trim() || 'Medication' };
      } else if (lower.includes('appointment') || lower.includes('doctor') || lower.includes('clinic')) {
        action = 'ADD_APPOINTMENT';
        spokenResponse = `I will add this appointment to your schedule: ${transcript}.`;
        data = { title: transcript.replace(/add appointment|doctor appointment/gi, '').trim() || 'Doctor Appointment' };
      } else if (lower.includes('remind') || lower.includes('task') || lower.includes('todo') || lower.includes('schedule')) {
        action = 'ADD_TASK';
        spokenResponse = `I have added a new reminder to your schedule: ${transcript}.`;
        data = { title: transcript.replace(/remind me to|add task/gi, '').trim() || 'Daily Task' };
      } else if (lower.includes('what') || lower.includes('next') || lower.includes('read') || lower.includes('schedule')) {
        action = 'QUERY_SCHEDULE';
        spokenResponse = 'Reading your upcoming schedule now. Check your dashboard for immediate items.';
      }

      return res.json({
        action,
        data,
        spokenResponse,
      });
    }

    const systemPrompt = `You are VocalCare, a warm, reassuring, highly accessible voice assistant for seniors and busy families.
Current date/time context: ${new Date().toLocaleString()}
User's existing context summary: ${JSON.stringify(context || {})}

Analyze the user's spoken command and determine the best action.
Return JSON with:
1. action: one of:
   - "ADD_TASK" (user wants to schedule or add a daily task/assignment/chore)
   - "ADD_MEDICATION" (user wants to add or log a medicine/pill)
   - "ADD_APPOINTMENT" (user wants to add a doctor/dentist/specialist visit)
   - "TRIGGER_SOS" (user has an emergency, fell, needs urgent help, asks for family or 911)
   - "MARK_TASK_DONE" (user completed a task)
   - "MARK_MED_TAKEN" (user took their medicine)
   - "CALL_CONTACT" (user wants to call a family member or doctor)
   - "QUERY_SCHEDULE" (user asks what is next, today's schedule, medications, or appointments)
   - "SIMULATE_URGENT_CALL" (test incoming urgent call)
   - "GENERAL_ASSISTANCE" (answering questions, giving encouragement, advice)
2. data: extracted details (e.g. title, time, dueTime, dosage, contactName, category, notes, priority)
3. spokenResponse: Warm, gentle, clear sentence (1-2 sentences) intended to be read aloud via voice to the senior/family user. Keep it comforting, respectful, and crystal clear.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: transcript,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING },
            spokenResponse: { type: Type.STRING },
            data: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                time: { type: Type.STRING },
                dosage: { type: Type.STRING },
                contactName: { type: Type.STRING },
                priority: { type: Type.STRING },
                category: { type: Type.STRING },
                notes: { type: Type.STRING },
              },
            },
          },
          required: ['action', 'spokenResponse'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Gemini API call skipped or errored, using smart voice engine:', error?.message);
    const transcript = req.body?.transcript || '';
    const lower = transcript.toLowerCase();
    let action = 'GENERAL_ASSISTANCE';
    let spokenResponse = `I heard: "${transcript}". Updating your dashboard.`;
    let data: any = {};

    if (lower.includes('sos') || lower.includes('emergency') || lower.includes('help me') || lower.includes('call 911')) {
      action = 'TRIGGER_SOS';
      spokenResponse = 'Activating emergency SOS now. Please stay calm while I notify your family and emergency contacts.';
    } else if (lower.includes('medication') || lower.includes('medicine') || lower.includes('pill') || lower.includes('take')) {
      action = 'ADD_MEDICATION';
      spokenResponse = `I have noted your medication update: ${transcript}.`;
      data = { title: transcript.replace(/add medication|take pill|medicine/gi, '').trim() || 'Prescription' };
    } else if (lower.includes('appointment') || lower.includes('doctor') || lower.includes('clinic')) {
      action = 'ADD_APPOINTMENT';
      spokenResponse = `Adding doctor appointment to your calendar: ${transcript}.`;
      data = { title: transcript.replace(/add appointment|doctor appointment/gi, '').trim() || 'Doctor Visit' };
    } else if (lower.includes('remind') || lower.includes('task') || lower.includes('todo') || lower.includes('schedule')) {
      action = 'ADD_TASK';
      spokenResponse = `I have added a new reminder to your schedule: ${transcript}.`;
      data = { title: transcript.replace(/remind me to|add task/gi, '').trim() || 'Daily Task' };
    } else if (lower.includes('what') || lower.includes('next') || lower.includes('read') || lower.includes('schedule')) {
      action = 'QUERY_SCHEDULE';
      spokenResponse = 'Opening your upcoming schedule now. Check your timeline for immediate deadlines.';
    } else if (lower.includes('call') || lower.includes('urgent')) {
      action = 'SIMULATE_URGENT_CALL';
      spokenResponse = 'Triggering urgent incoming call alert.';
    }

    return res.json({
      action,
      data,
      spokenResponse,
    });
  }
});

// API Route: Generate high-fidelity TTS speech audio via Gemini TTS
app.post('/api/voice/speak', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API not configured, use browser Web Speech API' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: 'Gentle, clear, supportive speaking voice with comforting cadence for elderly users and busy households',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned' });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error generating TTS with Gemini:', error);
    return res.status(500).json({ error: error.message || 'TTS generation failed' });
  }
});

// Serve frontend with Vite in dev, static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VocalCare full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
