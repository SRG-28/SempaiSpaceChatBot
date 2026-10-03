import { useState } from "react";

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const users = import.meta.env.VITE_DASHBOARD_USERS || "";

    const validUser = users
      .split(",")
      .map((user: string) => {
        const [savedUsername, savedPassword] = user.split(":");

        return {
          username: savedUsername?.trim(),
          password: savedPassword?.trim()
        };
      })
      .find(
        (user: { username: string | undefined; password: string | undefined }) =>
          user.username === username.trim() &&
          user.password === password
      );

    if (validUser) {
      onSuccess();
    } else {
      setError("Username o contraseña incorrectos");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f3ff, #e0f2fe)",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "#ffffff",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
          boxSizing: "border-box"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "28px",
              color: "#1f2937"
            }}
          >
            Ingresar
          </h2>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px"
            }}
          >
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151"
              }}
            >
              Username
            </label>

            <input
              type="text"
              placeholder="Ingresa tu username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151"
              }}
            >
              Contraseña
            </label>

            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: "18px",
                padding: "10px 12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#dc2626",
                fontSize: "14px",
                textAlign: "center"
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              background: "#4f46e5",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}