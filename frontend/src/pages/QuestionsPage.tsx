
import { useEffect, useState } from "react";
import axios from "axios";
import Login from "./Login";

interface Question {
  id?: number;
  question_text: string;
  answer_text: string;
  youtube_link?: string;
  tags?: string[] | string | null;
}

export default function QuestionsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQ, setNewQ] = useState<Question>({
    question_text: "",
    answer_text: "",
    youtube_link: "",
  });
  const [savingId, setSavingId] = useState<number | null>(null);

  const API = import.meta.env.VITE_API_BASE;

  const loadQuestions = async () => {
    try {
      const response = await axios.get(`${API}/api/questions`);
      setQuestions(response.data);
    } catch (error) {
      console.error("Error loading questions:", error);
      alert("No se pudieron cargar las preguntas.");
    }
  };

  useEffect(() => {
    if (authenticated) {
      void loadQuestions();
    }
  }, [authenticated]);

  const updateField = (
    id: number,
    field: keyof Question,
    value: string
  ) => {
    setQuestions((current) =>
      current.map((question) =>
        question.id === id
          ? { ...question, [field]: value }
          : question
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

  const updateQuestion = async (question: Question) => {
    if (question.id == null) return;

    setSavingId(question.id);

    try {
      await axios.put(
        `${API}/api/questions/${question.id}`,
        {
          question_text: question.question_text,
          answer_text: question.answer_text,
          youtube_link: question.youtube_link || null,
          tags: question.tags ?? null,
        }
      );

      await loadQuestions();
      alert("Pregunta actualizada correctamente.");
    } catch (error) {
      console.error("Error updating question:", error);
      alert("No se pudo actualizar la pregunta.");
    } finally {
      setSavingId(null);
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
          onChange={(event) =>
            setNewQ((current) => ({
              ...current,
              question_text: event.target.value,
            }))
          }
        />

        <textarea
          className="input"
          placeholder="Respuesta"
          value={newQ.answer_text}
          onChange={(event) =>
            setNewQ((current) => ({
              ...current,
              answer_text: event.target.value,
            }))
          }
        />

        <input
          className="input"
          placeholder="Link de YouTube (opcional)"
          value={newQ.youtube_link ?? ""}
          onChange={(event) =>
            setNewQ((current) => ({
              ...current,
              youtube_link: event.target.value,
            }))
          }
        />

        <button className="button-primary" onClick={addQuestion}>
          Agregar
        </button>
      </div>

      <h3>Lista de Preguntas</h3>

      {questions.map((question) => (
        <div key={question.id} className="card">
          <input
            className="input"
            value={question.question_text}
            style={{
              color: "#ffffff",
              WebkitTextFillColor: "#ffffff",
              caretColor: "#38bdf8",
            }}
            onChange={(event) =>
              updateField(
                question.id!,
                "question_text",
                event.target.value
              )
            }
          />

          <textarea
            className="input"
            value={question.answer_text}
            style={{
              color: "#ffffff",
              WebkitTextFillColor: "#ffffff",
              caretColor: "#38bdf8",
            }}
            onChange={(event) =>
              updateField(
                question.id!,
                "answer_text",
                event.target.value
              )
            }
          />

          <input
            className="input"
            placeholder="Link de YouTube (opcional)"
            value={question.youtube_link ?? ""}
            style={{
              color: "#ffffff",
              WebkitTextFillColor: "#ffffff",
              caretColor: "#38bdf8",
            }}
            onChange={(event) =>
              updateField(
                question.id!,
                "youtube_link",
                event.target.value
              )
            }
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="button-primary"
              onClick={() => updateQuestion(question)}
              disabled={savingId === question.id}
            >
              {savingId === question.id ? "Guardando..." : "Guardar"}
            </button>

            <button
              className="button-danger"
              onClick={() => deleteQuestion(question.id!)}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
