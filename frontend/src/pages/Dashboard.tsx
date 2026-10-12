import { useEffect, useState } from "react";
import axios from "axios";
import Login from "./Login";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface Interaction {
  id: number;
  username?: string;
  user_message: string;
  matched_question_id: number | null;
  similarity: number;
  responded_with_db: boolean;
  created_at: string;
}

interface StatsOverview {
  total_questions: number;
  total_interactions: number;
  feedback_total: number;
  helpful_feedback: number;
  top_questions: any[];
  worst_questions: any[];
}

export default function Dashboard() {
  const [authenticated, setAuthenticated] = useState(false);

  const [stats, setStats] = useState<StatsOverview>({
    total_questions: 0,
    total_interactions: 0,
    feedback_total: 0,
    helpful_feedback: 0,
    top_questions: [],
    worst_questions: [],
  });

  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    if (!authenticated) return;

    async function loadData() {
      try {
        const [statsRes, interRes] = await Promise.all([
          axios.get(`${API}/api/stats/overview`),
          axios.get(`${API}/api/interactions`),
        ]);

        setStats(statsRes.data);
        setInteractions(interRes.data || []);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, [API, authenticated]);

  if (!authenticated) {
    return <Login onSuccess={() => setAuthenticated(true)} />;
  }

  const dbMatches = interactions.filter((i) => i.responded_with_db).length;
  const llmAnswers = interactions.length - dbMatches;

  const chartData = [
    { name: "Coincidencias BD", value: dbMatches },
    { name: "Respuestas LLM", value: llmAnswers },
  ];

  return (
    <div>
      <h2>Dashboard Sempai Space Chatbot</h2>

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <>
          <div className="cards-container">
            <div className="card card-purple">
              <h3>Total Preguntas en BD</h3>
              <p>{stats.total_questions}</p>
            </div>

            <div className="card card-celeste">
              <h3>Total Interacciones</h3>
              <p>{stats.total_interactions}</p>
            </div>

            <div className="card card-black">
              <h3>Feedback Recibido</h3>
              <p>{stats.feedback_total}</p>
            </div>

            <div className="card card-purple">
              <h3>Respuestas Útiles</h3>
              <p>{stats.helpful_feedback}</p>
            </div>
          </div>

          <div className="card" style={{ marginTop: "30px" }}>
            <h3>Distribución de Respuestas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ marginTop: "30px" }}>
            <h3>Últimas Interacciones</h3>

            {interactions.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Mensaje</th>
                    <th>ID Pregunta Coincidente</th>
                    <th>% de similitud</th>
                    <th>Coincidencia con la BD</th>
                    <th>Fecha</th>
                  </tr>
                </thead>

                <tbody>
                  {interactions.slice(0, 20).map((i) => (
                    <tr key={i.id}>
                      <td>{i.username || "Anónimo"}</td>
                      <td>{i.user_message.slice(0, 40)}...</td>
                      <td>{i.matched_question_id ?? "—"}</td>
                      <td>
                        {i.similarity
                          ? `${(i.similarity * 100).toFixed(1)}%`
                          : "—"}
                      </td>
                      <td>{i.responded_with_db ? "Sí" : "No"}</td>
                      <td>{new Date(i.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay interacciones aún.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
