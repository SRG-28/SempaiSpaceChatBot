import express from "express";
import { pool } from "../db.js";
import { generateGuided, generateFree } from "../openai.js";

const router = express.Router();
const SIM_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD || "0.45");

// ✅ Obtener todas las interacciones (para Dashboard)
router.get("/", async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT 
         i.id,
         i.user_message,
         i.matched_question_id,
         i.similarity,
         i.responded_with_db,
         i.created_at,
         u.username
       FROM interactions i
       LEFT JOIN users u ON u.id = i.user_id
       ORDER BY i.created_at DESC
       LIMIT 200`
    );
    res.json(r.rows);
  } catch (err) {
    console.error("Error obteniendo interacciones:", err);
    res.status(500).json({ error: "server" });
  }
});

// ✅ Registrar nueva interacción
router.post("/", async (req, res) => {
  try {
    const { provider, provider_user_id, username, message } = req.body;

    // upsert del usuario
    let userId;
    const u = await pool.query(
      "SELECT id FROM users WHERE provider=$1 AND provider_user_id=$2",
      [provider, provider_user_id]
    );
    if (u.rows.length === 0) {
      const ins = await pool.query(
        "INSERT INTO users (provider, provider_user_id, username) VALUES ($1,$2,$3) RETURNING id",
        [provider, provider_user_id, username || null]
      );
      userId = ins.rows[0].id;
    } else {
      userId = u.rows[0].id;
      await pool.query("UPDATE users SET username=$1 WHERE id=$2", [
        username || null,
        userId,
      ]);
    }

    // Buscar coincidencias con pg_trgm
    const q = `
      SELECT id, question_text, answer_text, similarity(question_text, $1) AS similarity
      FROM questions
      WHERE question_text % $1
      ORDER BY similarity DESC
      LIMIT 3;
    `;
    const r = await pool.query(q, [message]);
    const hits = r.rows;

    let responseText;
    let matchedId = null;
    let similarity = 0;
    let usedDb = false;

    if (hits.length > 0 && hits[0].similarity >= SIM_THRESHOLD) {
      matchedId = hits[0].id;
      similarity = hits[0].similarity;
      usedDb = true;
      responseText = await generateGuided({ userMessage: message, docs: hits });
    } else if (hits.length > 0) {
      // docs débiles: aún se guía
      responseText = await generateGuided({ userMessage: message, docs: hits });
    } else {
      // sin docs → respuesta libre del LLM
      responseText = await generateFree({ userMessage: message });
    }

    // Guardar interacción
    await pool.query(
      `INSERT INTO interactions (user_id, user_message, matched_question_id, response_text, similarity, responded_with_db)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [userId, message, matchedId, responseText, similarity, usedDb]
    );

    res.json({ response: responseText, source: usedDb ? "db" : "llm" });
  } catch (err) {
    console.error("Error registrando interacción:", err);
    res.status(500).json({ error: "server" });
  }
});

export default router;
