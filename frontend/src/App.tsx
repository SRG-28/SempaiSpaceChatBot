import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import QuestionsPage from "./pages/QuestionsPage";
import ChatPage from "./pages/ChatPage";
import "./index.css";

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      {}
      <div className="sidebar-image-container">
        <img
          src="/SempaiSpace.png" 
          alt="Sempai Logo"
          className="sidebar-image"
        />
      </div>

      <h2 className="sidebar-title">Sempai Space Chatbot Admin</h2>

      <nav className="sidebar-nav">
        <Link
          to="/"
          className={`sidebar-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Dashboard
        </Link>
        <Link
          to="/questions"
          className={`sidebar-link ${
            location.pathname === "/questions" ? "active" : ""
          }`}
        >
          Preguntas
        </Link>
        <Link
          to="/chat"
          className={`sidebar-link ${location.pathname === "/chat" ? "active" : ""}`}
        >
          Chat
        </Link>
      </nav>

      <div className="sidebar-footer">
        <a
          className="telegram-link"
          href={`https://t.me/${import.meta.env.VITE_TELEGRAM_USERNAME}`}
          target="_blank"
        >
           Abrir en Telegram
        </a>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

