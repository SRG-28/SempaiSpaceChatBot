import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import QuestionsPage from "./pages/QuestionsPage";
import ChatPage from "./pages/ChatPage";
import "./index.css";
import "./App.css";

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();

  return (
    <>
      
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose}></div>
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
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
            className={`sidebar-link ${
              location.pathname === "/" ? "active" : ""
            }`}
            onClick={onClose}
          >
            Dashboard
          </Link>

          <Link
            to="/questions"
            className={`sidebar-link ${
              location.pathname === "/questions" ? "active" : ""
            }`}
            onClick={onClose}
          >
            Preguntas
          </Link>

          <Link
            to="/chat"
            className={`sidebar-link ${
              location.pathname === "/chat" ? "active" : ""
            }`}
            onClick={onClose}
          >
            Chat
          </Link>
        </nav>

        <div className="sidebar-footer">
          <a
            className="telegram-link"
            href={`https://t.me/${import.meta.env.VITE_TELEGRAM_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir en Telegram
          </a>
        </div>
      </aside>
    </>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-layout">

        {/* Botón del menú solamente en celular */}
        <button
          className="menu-button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

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

