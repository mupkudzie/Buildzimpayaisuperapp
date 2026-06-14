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
          background: "#06101d",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: "12px",
          padding: "32px",
          width: "340px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "48px", height: "48px", borderRadius: "50%",
            background: "rgba(212,175,55,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            border: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <span style={{ fontSize: "20px" }}>🔒</span>
        </div>
        <h2
          style={{
            fontFamily: "Montserrat, Arial, sans-serif",
            fontWeight: 700, fontSize: "14px", color: "#d4af37",
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
            width: "100%", background: "#0d1b2a",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "6px", padding: "10px 14px",
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
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px", color: "rgba(255,255,255,0.5)",
              fontSize: "12px", fontWeight: 600, cursor: "pointer",
            }}
          >
            CANCEL
          </button>
          <button
            type="submit"
            style={{
              flex: 1, padding: "10px",
              background: "linear-gradient(180deg, #d4af37, #b8962e)",
              border: "none", borderRadius: "6px",
              color: "#06101d", fontSize: "12px", fontWeight: 700,
              letterSpacing: "1px", cursor: "pointer",
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
