import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

// .env file config
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static files directly from root directory
app.use(express.static(__dirname));

// Groq client initialization
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 1. ENDPOINT: Video Script Generator
app.post('/generate-script', async (req, res) => {
    const { topic, size, tone } = req.body;

    if (!topic) {
        return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    try {
        const prompt = `Write a comprehensive, highly-engaging video script about "${topic}".
Video Aspect Ratio Format: ${size || '16:9'}
Overall Content Tone: ${tone || 'Professional'}

Please structure the output with clear scene-by-scene descriptions, visual cues, and corresponding voiceover/narration text.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
        });

        res.json({ success: true, script: chatCompletion.choices[0]?.message?.content || '' });
    } catch (error) {
        console.error('Groq Script Error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate script via Groq.' });
    }
});

// 2. ENDPOINT: Direct AI Chat / Ask Question
app.post('/ask-question', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ success: false, error: 'Question text is required' });
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: question }],
            model: 'llama-3.3-70b-versatile',
        });

        res.json({ success: true, answer: chatCompletion.choices[0]?.message?.content || '' });
    } catch (error) {
        console.error('Groq Chat Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch response from Groq.' });
    }
});

// 3. MOCK AUTH ENDPOINTS
app.post('/api/signup', (req, res) => {
    res.json({ success: true, message: "Mock signup success!" });
});

app.post('/api/signin', (req, res) => {
    res.json({ success: true });
});

// Fallback to index.html from root directory
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server locally
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running perfectly on http://localhost:${PORT}`);
    });
}

// Export for Vercel (ES Modules)
export default app;
