import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function generateGuided({ userMessage, docs = [] }) {
  const threshold = parseFloat(
    process.env.SIMILARITY_THRESHOLD || "0.45"
  );


  if (
    docs.length > 0 &&
    Number(docs[0].similarity) >= threshold &&
    docs[0].answer_text?.trim()
  ) {
    return docs[0].answer_text;
  }

  
  if (!client) {
    return "No tengo información específica sobre eso.";
  }

  const ctx = docs
    .map(
      (d, i) =>
        `Contexto ${i + 1}:\n` +
        `Pregunta: ${d.question_text}\n` +
        `Respuesta: ${d.answer_text}\n` +
        `YouTube: ${d.youtube_link || "none"}`
    )
    .join("\n\n");

  const systemMsg =
    'Responde usando la información proporcionada. ' +
    'Si el contexto no contiene información suficiente, responde ' +
    '"No tengo información específica sobre eso.". No inventes datos.';

  const userPrompt =
    `Contexto:\n${ctx || "No hay coincidencias disponibles."}\n\n` +
    `Pregunta del usuario:\n${userMessage}`;

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemMsg },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 600,
  });

  return (
    resp.choices[0].message.content ||
    "No tengo información específica sobre eso."
  );
}

export async function generateFree({ userMessage }) {
  if (!client) {
    return "No tengo información específica sobre eso.";
  }

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
    temperature: 0.6,
    max_tokens: 600,
  });

  return (
    resp.choices[0].message.content ||
    "No tengo información específica sobre eso."
  );
}
