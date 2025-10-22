import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function generateGuided({ userMessage, docs = [] }) {
  if (!client) {
    // fallback: if no OpenAI key, inform user
    return docs.length ? docs[0].answer_text : "No tengo información específica sobre eso.";
  }

  const ctx = docs.map((d,i) => `Context ${i+1}:\nQ: ${d.question_text}\nA: ${d.answer_text}\nYouTube: ${d.youtube_link || 'none'}`).join("\n\n");

  const systemMsg = `Eres un asistente que debe responder usando principalmente la información provista. Si no hay suficiente información, responde "No tengo información específica sobre eso." No inventes datos.`;
  const userPrompt = `Contexto:\n${ctx}\n\nUsuario pregunta:\n${userMessage}`;

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemMsg },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2,
    max_tokens: 600
  });

  return resp.choices[0].message.content;
}

export async function generateFree({ userMessage }) {
  if (!client) return "No tengo información específica sobre eso.";
  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: userMessage }],
    temperature: 0.6,
    max_tokens: 600
  });
  return resp.choices[0].message.content;
}
