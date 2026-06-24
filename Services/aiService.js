import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// Initialize APIs if keys are available
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

let genAI = null;
if (geminiApiKey) {
  genAI = new GoogleGenerativeAI(geminiApiKey);
}

let groq = null;
if (groqApiKey) {
  groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
}

/**
 * Extracts raw text from a PDF using Gemini's native vision.
 * Used as a bridge to feed PDF content to text-only models like Groq.
 * @param {string} fileBase64 - Base64-encoded PDF data
 * @returns {Promise<string>} Extracted text content
 */
export async function extractPdfText(fileBase64) {
  if (!genAI) {
    throw new Error("VITE_GEMINI_API_KEY is not set — cannot extract PDF text.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent([
    {
      inlineData: {
        data: fileBase64,
        mimeType: "application/pdf",
      },
    },
    "Extract the complete text of this document. Return only the raw extracted text, " +
      "preserving all numbers, table data, percentage figures, section headings, and financial statement " +
      "line items exactly as they appear. Do not summarize, interpret, or omit any content.",
  ]);

  const response = await result.response;
  return response.text();
}

/**
 * Fetches analysis from Gemini.
 * When pdfFiles (array of Base64 strings) is provided, Gemini reads the PDFs directly via native vision.
 */
export async function fetchGeminiAnalysis(promptText, pdfFiles = []) {
  if (!genAI) {
    return "Error: VITE_GEMINI_API_KEY is not set in your .env.local file.";
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Construct parts array starting with all PDF documents, followed by the text prompt
    const parts = [];
    
    if (pdfFiles && pdfFiles.length > 0) {
      pdfFiles.forEach(fileBase64 => {
        if (fileBase64) {
          parts.push({
            inlineData: {
              data: fileBase64,
              mimeType: "application/pdf"
            }
          });
        }
      });
    }
    
    parts.push(promptText);
    
    const result = await model.generateContent(parts);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Error fetching from Gemini: ${error.message}`;
  }
}

/**
 * Fetches analysis from Groq (Llama 3.3).
 * Groq is text-only — PDF content must be pre-extracted and injected into promptText.
 */
export async function fetchGroqAnalysis(promptText) {
  if (!groq) {
    return "Error: VITE_GROQ_API_KEY is not set in your .env.local file.";
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: promptText,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });
    return completion.choices[0]?.message?.content || "No response received.";
  } catch (error) {
    console.error("Groq API Error:", error);
    return `Error fetching from Groq: ${error.message}`;
  }
}

