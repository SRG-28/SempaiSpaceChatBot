import { useState } from "react";

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const expected = import.meta.env.VITE_DASHBOARD_PASSWORD;

    if (password === expected) {
      onSuccess();
    } else {
      setError("Contraseña incorrecta");
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "100px auto", textAlign: "center" }}>
      <h2>Ingresar</h2>
      <form onSubmit={handleLogin}>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px"
          }}
        />
        <button type="submit" style={{ padding: "10px 20px" }}>
          Entrar
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
