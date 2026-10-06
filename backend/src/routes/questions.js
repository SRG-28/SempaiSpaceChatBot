import express from "express";
import { pool } from "../db.js";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM questions ORDER BY updated_at DESC');
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server' });
  }
});


router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const r = await pool.query('SELECT * FROM questions WHERE id=$1', [id]);
  res.json(r.rows[0]);
});


router.post("/", async (req, res) => {
  const { question_text, answer_text, youtube_link, tags } = req.body;
  const r = await pool.query(
    `INSERT INTO questions (question_text, answer_text, youtube_link, tags) VALUES ($1,$2,$3,$4) RETURNING *`,
    [question_text, answer_text, youtube_link || null, tags || null]
  );
  res.json(r.rows[0]);
});


router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { question_text, answer_text, youtube_link, tags } = req.body;
  const r = await pool.query(
    `UPDATE questions SET question_text=$1, answer_text=$2, youtube_link=$3, tags=$4, updated_at=now() WHERE id=$5 RETURNING *`,
    [question_text, answer_text, youtube_link || null, tags || null, id]
  );
  res.json(r.rows[0]);
});


router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM questions WHERE id=$1', [id]);
  res.json({ ok: true });
});

export default router;
