import { useState } from "react";
import { login } from "../api/authApi";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("alex");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const data = await login(username, password);

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("userId", data.id);
      sessionStorage.setItem("username", data.username);
      sessionStorage.setItem("role", data.role);
      if (data.tableId) {
        sessionStorage.setItem("tableId", data.tableId);
        sessionStorage.setItem("tableLabel", data.tableLabel || "");
        sessionStorage.setItem("tableSeat", data.tableSeat || "");
      } else {
        sessionStorage.removeItem("tableId");
        sessionStorage.removeItem("tableLabel");
        sessionStorage.removeItem("tableSeat");
      }
      onLogin(data);
    } catch (err) {
      console.error(err);
      setError("Login failed");
    }
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1>Restaurant POS</h1>
        <p>Login to continue</p>

        {error && <div style={styles.error}>{error}</div>}

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f3f4f6",
  },
  card: {
    width: 360,
    background: "white",
    padding: 32,
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  button: {
    padding: 12,
    borderRadius: 8,
    border: "none",
    background: "black",
    color: "white",
    fontWeight: 700,
  },
  error: {
    color: "white",
    background: "#dc2626",
    padding: 10,
    borderRadius: 8,
  },
};

export default LoginPage;
