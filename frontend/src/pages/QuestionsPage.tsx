import { useEffect, useState } from "react";
import axios from "axios";

interface Question {
  id?: number;
  question_text: string;
  answer_text: string;
  youtube_link?: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQ, setNewQ] = useState<Question>({ question_text: "", answer_text: "", youtube_link: "" });
  const API = import.meta.env.VITE_API_BASE;

  const loadQuestions = () => {
    axios.get(`${API}/api/questions`).then((res) => setQuestions(res.data));
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const addQuestion = async () => {
    await axios.post(`${API}/api/questions`, newQ);
    setNewQ({ question_text: "", answer_text: "", youtube_link: "" });
    loadQuestions();
  };

  const deleteQuestion = async (id: number) => {
    await axios.delete(`${API}/api/questions/${id}`);
    loadQuestions();
  };

  const updateQuestion = async (q: Question) => {
    await axios.put(`${API}/api/questions/${q.id}`, q);
    loadQuestions();
  };

  return (
    <div>
      <h2>Administrar Preguntas</h2>

      <div className="card">
        <h3>Nueva Pregunta</h3>
        <input
          className="input"
          placeholder="Pregunta"
          value={newQ.question_text}
          onChange={(e) => setNewQ({ ...newQ, question_text: e.target.value })}
        />
        <textarea
          className="input"
          placeholder="Respuesta"
          value={newQ.answer_text}
          onChange={(e) => setNewQ({ ...newQ, answer_text: e.target.value })}
        />
        <input
          className="input"
          placeholder="Link de YouTube (opcional)"
          value={newQ.youtube_link}
          onChange={(e) => setNewQ({ ...newQ, youtube_link: e.target.value })}
        />
        <button className="button-primary" onClick={addQuestion}>
          ➕ Agregar
        </button>
      </div>

      <h3>Lista de Preguntas</h3>
      {questions.map((q) => (
        <div key={q.id} className="card">
          <input
            className="input"
            value={q.question_text}
            onChange={(e) => (q.question_text = e.target.value)}
          />
          <textarea
            className="input"
            value={q.answer_text}
            onChange={(e) => (q.answer_text = e.target.value)}
          />
          <input
            className="input"
            value={q.youtube_link || ""}
            onChange={(e) => (q.youtube_link = e.target.value)}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="button-primary" onClick={() => updateQuestion(q)}>
              💾 Guardar
            </button>
            <button className="button-danger" onClick={() => deleteQuestion(q.id!)}>
              🗑️ Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
