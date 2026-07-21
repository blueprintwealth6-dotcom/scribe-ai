import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Static handling via public sub-routing
app.use(express.static(path.join(__dirname, 'public')));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 1. ENDPOINT: Video Script Generator
app.post('/api/generate-script', async (req, res) => {
    const { topic, size, tone } = req.body;
    if (!topic) {
        return res.status(400).json({ success: false, error: 'Topic is required' });
    }
    try {
        const prompt = `Write a comprehensive, highly-engaging video script about "${topic}". 
        Video Aspect Ratio Format: ${size || '16:9'}
        Overall Content Tone: ${tone || 'Professional'}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
        });

        const resultText = chatCompletion.choices[0]?.message?.content || '';
        return res.json({ success: true, script: resultText });
    } catch (error) {
        console.error('Groq Script Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to generate script.' });
    }
});

// 2. ENDPOINT: Direct AI Chat / Ask Question
app.post('/api/ask-question', async (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ success: false, error: 'Question text is required' });
    }
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: question }],
            model: 'llama-3.3-70b-versatile',
        });

        const resultText = chatCompletion.choices[0]?.message?.content || '';
        return res.json({ success: true, answer: resultText });
    } catch (error) {
        console.error('Groq Chat Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch response.' });
    }
});

// Mock Endpoints
app.post('/api/signup', (req, res) => res.json({ success: true }));
app.post('/api/signin', (req, res) => res.json({ success: true }));

// Default API health-check to debug server issues easily
app.get('/api/health', (req, res) => {
    return res.json({ status: "alive", message: "Backend structure is fully working on Vercel!" });
});

export default app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Local server: http://localhost:${PORT}`));
}
