import { pool } from "./db.js";

const examples = [
  { question_text: "¿Cómo restablezco mi contraseña?", answer_text: "Ingresa a tu perfil → Restablecer contraseña. Te llegará un email con instrucciones.", youtube_link: "https://youtu.be/ejemplo1", tags: ["cuentas","seguridad"] },
  { question_text: "¿Cómo contacto soporte?", answer_text: "Envía un correo a soporte@empresa.com o usa el chat desde la web.", youtube_link: null, tags: ["soporte"] }
];

async function run() {
  for (const ex of examples) {
    await pool.query('INSERT INTO questions (question_text, answer_text, youtube_link, tags) VALUES ($1,$2,$3,$4)', [ex.question_text, ex.answer_text, ex.youtube_link, ex.tags]);
    console.log('inserted', ex.question_text);
  }
  process.exit(0);
}

run().catch(e=>{ console.error(e); process.exit(1); });
