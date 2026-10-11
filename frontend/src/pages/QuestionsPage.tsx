
import { useEffect, useState } from "react";
import axios from "axios";
import Login from "./Login";

interface Question {
  id?: number;
  question_text: string;
  answer_text: string;
  youtube_link?: string;
}

export default function QuestionsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [newQ, setNewQ] = useState<Question>({
    question_text: "",
    answer_text: "",
    youtube_link: "",
  });

  const API = import.meta.env.VITE_API_BASE;

  const loadQuestions = async () => {
    try {
      const res = await axios.get(`${API}/api/questions`);
      setQuestions(res.data);
    } catch (error) {
      console.error("Error loading questions:", error);
      alert("No se pudieron cargar las preguntas.");
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadQuestions();
    }
  }, [authenticated]);

  const updateField = (
    id: number,
    field: keyof Question,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const addQuestion = async () => {
    if (!newQ.question_text.trim() || !newQ.answer_text.trim()) {
      alert("Ingresa la pregunta y la respuesta.");
      return;
    }

    try {
      await axios.post(`${API}/api/questions`, newQ);

      setNewQ({
        question_text: "",
        answer_text: "",
        youtube_link: "",
      });

      await loadQuestions();
      alert("Pregunta agregada correctamente.");
    } catch (error) {
      console.error("Error adding question:", error);
      alert("No se pudo agregar la pregunta.");
    }
  };

  const updateQuestion = async (q: Question) => {
    if (!q.id) return;

    try {
      await axios.put(`${API}/api/questions/${q.id}`, q);
      await loadQuestions();
      alert("Pregunta actualizada correctamente.");
    } catch (error) {
      console.error("Error updating question:", error);
      alert("No se pudo actualizar la pregunta. Revisa la consola.");
    }
  };

  const deleteQuestion = async (id: number) => {
    if (!window.confirm("¿Deseas eliminar esta pregunta?")) return;

    try {
      await axios.delete(`${API}/api/questions/${id}`);
      await loadQuestions();
      alert("Pregunta eliminada correctamente.");
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("No se pudo eliminar la pregunta.");
    }
  };

  if (!authenticated) {
    return <Login onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div>
      <h2>Administrar Preguntas</h2>

      <div className="card">
        <h3>Nueva Pregunta</h3>

        <input
          className="input"
          placeholder="Pregunta"
          value={newQ.question_text}
          onChange={(e) =>
            setNewQ({ ...newQ, question_text: e.target.value })
          }
        />

        <textarea
          className="input"
          placeholder="Respuesta"
          value={newQ.answer_text}
          onChange={(e) =>
            setNewQ({ ...newQ, answer_text: e.target.value })
          }
        />

        <input
          className="input"
          placeholder="Link de YouTube (opcional)"
          value={newQ.youtube_link || ""}
          onChange={(e) =>
            setNewQ({ ...newQ, youtube_link: e.target.value })
          }
        />

        <button className="button-primary" onClick={addQuestion}>
          Agregar
        </button>
      </div>

      <h3>Lista de Preguntas</h3>

      {questions.map((q) => (
        <div key={q.id} className="card">
          <input
            className="input"
            value={q.question_text}
            onChange={(e) =>
              updateField(q.id!, "question_text", e.target.value)
            }
          />

          <textarea
            className="input"
            value={q.answer_text}
            onChange={(e) =>
              updateField(q.id!, "answer_text", e.target.value)
            }
          />

          <input
            className="input"
            placeholder="Link de YouTube (opcional)"
            value={q.youtube_link || ""}
            onChange={(e) =>
              updateField(q.id!, "youtube_link", e.target.value)
            }
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="button-primary"
              onClick={() => updateQuestion(q)}
            >
              Guardar
            </button>

            <button
              className="button-danger"
              onClick={() => deleteQuestion(q.id!)}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
