import { useState } from "react";
import axios from "axios";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const API = import.meta.env.VITE_API_BASE;

  const sendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const res = await axios.post(`${API}/api/interactions`, {
      provider_user_id: "web-user",
      username: "Admin",
      message,
      provider: "web",
    });
    setResponse(res.data.response);
    setLoading(false);
  };

  return (
    <div>
      <br />
      <h2>Sempai Space Chatbot</h2>
      <div className="card">
        <textarea
          className="input"
          rows={3}
          placeholder="Escribe tu mensaje..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="button-primary" onClick={sendMessage} disabled={loading}>
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </div>

      {response && (
        <div className="card" style={{ marginTop: "20px" }}>
          <strong>Respuesta:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
