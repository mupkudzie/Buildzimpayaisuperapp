import { CompanyInfo } from "@/lib/store";

interface Props {
  companyInfo: CompanyInfo;
}

const CompanyInfoCard = ({ companyInfo }: Props) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "clamp(8px, 1.5vw, 24px)",
        padding: "clamp(8px, 1.5vw, 24px)",
        background: "#0a5c2f",
        borderRadius: "6px",
        boxSizing: "border-box",
      }}
    >
      {/* VALUES */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>OUR VALUES</h3>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(4px, 1vh, 12px)" }}>
          {companyInfo.values.map((v, i) => (
            <span key={i} style={bodyStyle}>{v}</span>
          ))}
        </div>
      </div>

      {/* VISION */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>OUR VISION</h3>
        <p style={bodyStyle}>{companyInfo.vision}</p>
      </div>

      {/* MISSION */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>OUR MISSION</h3>
        <p style={bodyStyle}>{companyInfo.mission}</p>
      </div>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  background: "rgba(0, 80, 40, 0.7)",
  borderRadius: "clamp(8px, 1vw, 16px)",
  padding: "clamp(16px, 2.5vw, 40px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "Montserrat, Arial, sans-serif",
  fontWeight: 700,
  fontSize: "clamp(0.9rem, 1.6vw, 1.6rem)",
  color: "#FFFFFF",
  letterSpacing: "3px",
  textTransform: "uppercase",
  marginBottom: "clamp(8px, 1.5vh, 20px)",
  margin: 0,
  marginBlockEnd: "clamp(8px, 1.5vh, 20px)",
};

const bodyStyle: React.CSSProperties = {
  fontFamily: "Inter, Arial, sans-serif",
  fontSize: "clamp(0.8rem, 1.3vw, 1.3rem)",
  color: "rgba(255,255,255,0.9)",
  lineHeight: 1.5,
  margin: 0,
};

export default CompanyInfoCard;
