import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import fs from 'fs';
import path from 'path';

// Read .env.local manually
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
let geminiKey = '';
let groqKey = '';

envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_GEMINI_API_KEY=')) geminiKey = line.split('=')[1].trim();
    if (line.startsWith('VITE_GROQ_API_KEY=')) groqKey = line.split('=')[1].trim();
});

async function run() {
    try {
        console.log("Fetching Groq models...");
        const groq = new Groq({ apiKey: groqKey });
        const groqModels = await groq.models.list();
        console.log("Groq Models:", groqModels.data.map(m => m.id).join(', '));
    } catch(e) { console.error("Groq error:", e.message); }

    try {
        console.log("\nFetching Gemini models...");
        // Since we can't easily list models via the SDK sometimes, we will fetch directly from REST endpoint
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
        const data = await res.json();
        console.log("Gemini Models:", data.models?.map(m => m.name).join(', '));
    } catch(e) { console.error("Gemini error:", e.message); }
}

run();
