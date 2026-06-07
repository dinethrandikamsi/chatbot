const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
app.use(cors()); // React App එකට backend එක කතා කරන්න ඉඩ දීම
app.use(express.json());

// API Key එක හරහා Gemini Client එක සෑදීම
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Chat Endpoint එක
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body; // React එකෙන් එවන chat history එක

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Invalid messages format" });
        }

        // Gemini API එකට ගැලපෙන Format එකට සැකසීම
        const contents = messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // Gemini Call එක
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: "You are a helpful chatbot built securely with a Node.js backend."
            }
        });

        // බලාපොරොත්තු වන පිළිතුර React එකට යැවීම
        res.json({ text: response.text });

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: "Gemini API call failed" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
