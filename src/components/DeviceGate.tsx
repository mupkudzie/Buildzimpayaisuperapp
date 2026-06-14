import { useEffect, useState } from "react";
import {
  DeviceRecord,
  getDeviceId,
  getDeviceStatus,
  registerCurrentDevice,
  syncRegistryWithNetwork,
} from "@/lib/deviceRegistry";

interface Props {
  children: React.ReactNode;
}

const DeviceGate = ({ children }: Props) => {
  const [record, setRecord] = useState<DeviceRecord | null>(null);

  useEffect(() => {
    setRecord(registerCurrentDevice());
    const refresh = async () => {
      await syncRegistryWithNetwork();
      const id = getDeviceId();
      setRecord(prev => (prev ? { ...prev, status: getDeviceStatus(id) } : prev));
    };
    window.addEventListener("device-registry-updated", refresh);
    window.addEventListener("storage", refresh);
    const iv = setInterval(refresh, 3000);
    return () => {
      window.removeEventListener("device-registry-updated", refresh);
      window.removeEventListener("storage", refresh);
      clearInterval(iv);
    };
  }, []);

  if (!record) return null;
  if (record.status === "approved") return <>{children}</>;

  const isRevoked = record.status === "revoked";
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "linear-gradient(135deg, #0a0f1e 0%, #111827 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Montserrat, sans-serif", color: "#fff", padding: "20px",
      }}
    >
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: isRevoked ? "rgba(239,68,68,0.15)" : "rgba(212,175,55,0.15)",
          border: `1px solid ${isRevoked ? "#ef4444" : "#d4af37"}55`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px", fontSize: 32,
        }}>
          {isRevoked ? "🚫" : "⏳"}
        </div>
        <h1 style={{
          fontSize: 22, letterSpacing: 2, marginBottom: 12,
          color: isRevoked ? "#ef4444" : "#d4af37", fontWeight: 800,
        }}>
          {isRevoked ? "ACCESS REVOKED" : "AWAITING APPROVAL"}
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.75)", marginBottom: 24 }}>
          {isRevoked
            ? "This device's access has been revoked by the Super Admin."
            : "This device must be approved by the Super Admin before it can display exchange rates."}
        </p>
        <div style={{
          background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: "14px 18px", textAlign: "left",
          fontFamily: "JetBrains Mono, monospace", fontSize: 12,
        }}>
          <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Device ID</div>
          <div style={{ color: "#d4af37", wordBreak: "break-all" }}>{record.id}</div>
          <div style={{ color: "rgba(255,255,255,0.5)", marginTop: 10, marginBottom: 4 }}>Name</div>
          <div style={{ color: "#fff" }}>{record.name}</div>
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 18 }}>
          Share the Device ID above with the Super Admin to request access.
        </p>
      </div>
    </div>
  );
};

export default DeviceGate;
