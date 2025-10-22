import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { interaction_id, rating, comment } = req.body;
  const r = await pool.query('INSERT INTO feedback (interaction_id, rating, comment) VALUES ($1,$2,$3) RETURNING *', [interaction_id, rating, comment || null]);
  res.json(r.rows[0]);
});

router.get("/", async (req, res) => {
  const r = await pool.query('SELECT * FROM feedback ORDER BY created_at DESC LIMIT 200');
  res.json(r.rows);
});

export default router;
