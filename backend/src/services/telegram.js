import TelegramBot from "node-telegram-bot-api";
import { pool } from "../db.js";
import { generateGuided, generateFree } from "../openai.js";

export function startTelegram() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.log("No TELEGRAM_BOT_TOKEN, telegram disabled");
    return;
  }

  const bot = new TelegramBot(token, { polling: true });
  console.log("Telegram bot polling started");

  bot.on("message", async (msg) => {
    try {
      const text = msg.text || "";
      if (!text) return;

      const provider = "telegram";
      const provider_user_id = String(msg.from.id);
      const username =
        msg.from.username ||
        `${msg.from.first_name || ""} ${msg.from.last_name || ""}`.trim();

      // Buscar o registrar al usuario
      const u = await pool.query(
        "SELECT id FROM users WHERE provider=$1 AND provider_user_id=$2",
        [provider, provider_user_id]
      );

      let userId;

      if (u.rows.length === 0) {
        const ins = await pool.query(
          `INSERT INTO users (provider, provider_user_id, username)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [provider, provider_user_id, username]
        );

        userId = ins.rows[0].id;
      } else {
        userId = u.rows[0].id;

        await pool.query(
          "UPDATE users SET username=$1 WHERE id=$2",
          [username, userId]
        );
      }

      
      const s = `
        SELECT
          id,
          question_text,
          answer_text,
          youtube_link,
          similarity(question_text, $1) AS similarity
        FROM questions
        WHERE LOWER(TRIM(question_text)) = LOWER(TRIM($1))
           OR question_text % $1
        ORDER BY
          CASE
            WHEN LOWER(TRIM(question_text)) = LOWER(TRIM($1))
            THEN 1
            ELSE 0
          END DESC,
          similarity DESC
        LIMIT 3;
      `;

      const r = await pool.query(s, [text]);
      const hits = r.rows;

      const threshold = parseFloat(
        process.env.SIMILARITY_THRESHOLD || "0.45"
      );

      let response;
      let usedDb = false;

      if (
        hits.length > 0 &&
        hits[0].similarity >= threshold &&
        hits[0].answer_text?.trim()
      ) {
        
        usedDb = true;
        response = await generateGuided({
          userMessage: text,
          docs: hits,
        });
      } else if (hits.length > 0) {
     
        response = await generateGuided({
          userMessage: text,
          docs: hits,
        });
      } else {
       
        response = await generateFree({ userMessage: text });
      }

    
      await pool.query(
        `INSERT INTO interactions
          (user_id, user_message, matched_question_id, response_text,
           similarity, responded_with_db)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          text,
          usedDb ? hits[0].id : null,
          response,
          hits[0]?.similarity || 0,
          usedDb,
        ]
      );

     
      const buttons = [
        [
          {
            text: "👍 Fue útil",
            callback_data: "feedback:positive",
          },
          {
            text: "👎 No fue útil",
            callback_data: "feedback:negative",
          },
        ],
      ];

      await bot.sendMessage(msg.chat.id, response, {
        reply_markup: {
          inline_keyboard: buttons,
        },
      });
    } catch (err) {
      console.error("telegram.on.message error", err);
    }
  });

  bot.on("callback_query", async (cb) => {
    try {
      const data = cb.data;
      const isPositive = data === "feedback:positive";
      const provider = "telegram";
      const provider_user_id = String(cb.from.id);

      const u = await pool.query(
        "SELECT id FROM users WHERE provider=$1 AND provider_user_id=$2",
        [provider, provider_user_id]
      );

      if (!u.rows[0]) {
        await bot.answerCallbackQuery(cb.id, {
          text: "Usuario no encontrado",
        });
        return;
      }

      const userId = u.rows[0].id;

      const inter = await pool.query(
        `SELECT id FROM interactions
         WHERE user_id=$1
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
      );

      if (inter.rows[0]) {
        await pool.query(
          "INSERT INTO feedback (interaction_id, rating) VALUES ($1, $2)",
          [inter.rows[0].id, isPositive ? 5 : 1]
        );
      }

      await bot.answerCallbackQuery(cb.id, {
        text: isPositive ? "Gracias 👍" : "Gracias 👎",
      });
    } catch (err) {
      console.error("callback_query error", err);
    }
  });
}
