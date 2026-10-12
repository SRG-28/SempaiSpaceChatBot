import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import questionsRoutes from "./routes/questions.js";
import interactionsRoutes from "./routes/interactions.js";
import feedbackRoutes from "./routes/feedback.js";
import { startTelegram } from "./services/telegram.js";
import { pool } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/questions", questionsRoutes);
app.use("/api/interactions", interactionsRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/api/stats/overview", async (req, res) => {
  try {
    const totalQ = (
      await pool.query("SELECT COUNT(*) FROM questions")
    ).rows[0].count;

    const totalInteractions = (
      await pool.query("SELECT COUNT(*) FROM interactions")
    ).rows[0].count;

    const feedbackTotal = (
      await pool.query("SELECT COUNT(*) FROM feedback")
    ).rows[0].count;

    const helpfulFeedback = (
      await pool.query("SELECT COUNT(*) FROM feedback WHERE rating = 5")
    ).rows[0].count;

    const topQ = (
      await pool.query(`
        SELECT q.id, q.question_text, COUNT(i.*) AS uses
        FROM questions q
        LEFT JOIN interactions i ON q.id = i.matched_question_id
        GROUP BY q.id
        ORDER BY uses DESC
        LIMIT 10
      `)
    ).rows;

    const worstQ = (
      await pool.query(`
        SELECT q.id, q.question_text, AVG(f.rating) AS avg_rating,
               COUNT(f.*) AS feedback_count
        FROM questions q
        LEFT JOIN interactions i ON q.id = i.matched_question_id
        LEFT JOIN feedback f ON f.interaction_id = i.id
        GROUP BY q.id
        HAVING COUNT(f.*) > 0
        ORDER BY avg_rating ASC
        LIMIT 10
      `)
    ).rows;

    res.json({
      total_questions: Number(totalQ),
      total_interactions: Number(totalInteractions),
      feedback_total: Number(feedbackTotal),
      helpful_feedback: Number(helpfulFeedback),
      top_questions: topQ,
      worst_questions: worstQ
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  startTelegram();
});
