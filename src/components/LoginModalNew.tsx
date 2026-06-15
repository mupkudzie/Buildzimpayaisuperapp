import { useState } from "react";

interface Props {
  password: string;
  superPassword: string;
  onLogin: (role?: "admin" | "super") => void;
}

const LoginModalNew = ({ password, superPassword, onLogin }: Props) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === superPassword) {
      onLogin("super");
      setInput("");
      setError("");
    } else if (input === password) {
      onLogin("admin");
      setInput("");
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#0f0f0f",
          border: "1px solid #3f3f3f",
          borderRadius: "12px",
          padding: "32px",
          width: "340px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "48px", height: "48px", borderRadius: "50%",
            background: "#272727",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            border: "1px solid #3f3f3f",
          }}
        >
          <span style={{ fontSize: "20px" }}>🔒</span>
        </div>
        <h2
          style={{
            fontFamily: "Montserrat, Arial, sans-serif",
            fontWeight: 700, fontSize: "14px", color: "#ff0000",
            letterSpacing: "3px", marginBottom: "20px",
          }}
        >
          ADMIN LOGIN
        </h2>
        {error && (
          <p style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px" }}>{error}</p>
        )}
        <input
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter password"
          autoFocus
          style={{
            width: "100%", background: "#272727",
            border: "1px solid #3f3f3f",
            borderRadius: "18px", padding: "10px 18px",
            color: "#fff", fontSize: "14px", outline: "none",
            marginBottom: "16px", boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("admin-cancel"))}
            style={{
              flex: 1, padding: "10px", background: "none",
              border: "1px solid #3f3f3f",
              borderRadius: "18px", color: "#aaaaaa",
              fontSize: "12px", fontWeight: 600, cursor: "pointer",
            }}
          >
            CANCEL
          </button>
          <button
            type="submit"
            style={{
              flex: 1, padding: "10px",
              background: "#ff0000",
              border: "none", borderRadius: "18px",
              color: "#ffffff", fontSize: "12px", fontWeight: 700,
              letterSpacing: "1px", cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            LOGIN
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginModalNew;
