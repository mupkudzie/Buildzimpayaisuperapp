const { readFileSync, writeFileSync } = require('fs');

const file1 = 'src/components/AdminDrawer.tsx';
let content1 = readFileSync(file1, 'utf8');

// Inject the variables
const varInjection1 = `
  const isLight = state.adminTheme === "light";
  const bgMain = isLight ? "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" : "linear-gradient(180deg, #0f172a 0%, #0c1220 100%)";
  const textMain = isLight ? "#0f172a" : "#fff";
  const textMuted = isLight ? "#64748b" : "rgba(255,255,255,0.4)";
  const bgInput = isLight ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.3)";
  const borderLine = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.08)";
`;

content1 = content1.replace(
  'const tabItems = [',
  varInjection1 + '\n  const tabItems = ['
);

content1 = content1.replace(
  'background: "linear-gradient(180deg, #0f172a 0%, #0c1220 100%)"',
  'background: bgMain, color: textMain'
);

content1 = content1.replace(/"rgba\(0,0,0,0\.3\)"/g, 'bgInput');
content1 = content1.replace(/"rgba\(255,255,255,0\.08\)"/g, 'borderLine');
content1 = content1.replace(/color: "#fff"/g, 'color: textMain');
content1 = content1.replace(/color: "rgba\(255,255,255,0\.35\)"/g, 'color: textMuted');
content1 = content1.replace(/color: "rgba\(255,255,255,0\.4\)"/g, 'color: textMuted');
content1 = content1.replace(/color: "rgba\(255,255,255,0\.5\)"/g, 'color: textMuted');
content1 = content1.replace(/color: "rgba\(255,255,255,0\.6\)"/g, 'color: textMuted');
content1 = content1.replace(/color: "rgba\(255,255,255,0\.7\)"/g, 'color: textMuted');

// Fix specific buttons that should remain dark or adjust logic slightly
writeFileSync(file1, content1, 'utf8');

const file2 = 'src/components/SuperAdminDrawer.tsx';
let content2 = readFileSync(file2, 'utf8');

const varInjection2 = `
  const isLight = state.adminTheme === "light";
  const [adminTheme, setAdminTheme] = useState<"light"|"dark">(state.adminTheme === "light" ? "light" : "dark");
  const bgMain = isLight ? "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" : "linear-gradient(180deg, #0f172a 0%, #0c1220 100%)";
  const textMain = isLight ? "#0f172a" : "#fff";
  const textMuted = isLight ? "#64748b" : "rgba(255,255,255,0.4)";
  const bgInput = isLight ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.4)";
  const borderLine = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
`;

content2 = content2.replace(
  'const tabItems = [',
  varInjection2 + '\n  const tabItems = ['
);

content2 = content2.replace(
  'background: "linear-gradient(180deg, #0d0820 0%, #060212 100%)",',
  'background: bgMain, color: textMain,'
);

content2 = content2.replace(/"rgba\(0,0,0,0\.4\)"/g, 'bgInput');
content2 = content2.replace(/"rgba\(255,255,255,0\.1\)"/g, 'borderLine');
content2 = content2.replace(/color: "#fff"/g, 'color: textMain');
content2 = content2.replace(/color: "rgba\(255,255,255,0\.35\)"/g, 'color: textMuted');
content2 = content2.replace(/color: "rgba\(255,255,255,0\.4\)"/g, 'color: textMuted');
content2 = content2.replace(/color: "rgba\(255,255,255,0\.5\)"/g, 'color: textMuted');
content2 = content2.replace(/color: "rgba\(255,255,255,0\.55\)"/g, 'color: textMuted');
content2 = content2.replace(/color: "rgba\(255,255,255,0\.7\)"/g, 'color: textMuted');

// Add the state variables for the new fields!
content2 = content2.replace(
  'const [sellColor, setSellColor] = useState(state.sellColor || "#e63946");',
  `const [sellColor, setSellColor] = useState(state.sellColor || "#e63946");
  const [columnBgColor, setColumnBgColor] = useState(state.columnBgColor || "#F2EFED");
  const [rowOddBgColor, setRowOddBgColor] = useState(state.rowOddBgColor || "#ffffff");
  const [rowEvenBgColor, setRowEvenBgColor] = useState(state.rowEvenBgColor || "#ffffff");`
);

content2 = content2.replace(
  'onUpdate({ ...state, tickerSpeed, cardFontSize, buyColor, sellColor });',
  'onUpdate({ ...state, tickerSpeed, cardFontSize, buyColor, sellColor, columnBgColor, rowOddBgColor, rowEvenBgColor, adminTheme });'
);

content2 = content2.replace(
  '<ColorPicker label="We Buy" value={buyColor} onChange={setBuyColor} />\n                  <ColorPicker label="We Sell" value={sellColor} onChange={setSellColor} />',
  `<ColorPicker label="We Buy" value={buyColor} onChange={setBuyColor} />
                  <ColorPicker label="We Sell" value={sellColor} onChange={setSellColor} />
                </div>
              </Card>

              <SectionLabel>Card Row & Column Colors</SectionLabel>
              <Card>
                <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                  <ColorPicker label="Column Bg" value={columnBgColor} onChange={setColumnBgColor} />
                  <ColorPicker label="Odd Row Bg" value={rowOddBgColor} onChange={setRowOddBgColor} />
                  <ColorPicker label="Even Row Bg" value={rowEvenBgColor} onChange={setRowEvenBgColor} />
                </div>
              </Card>

              <SectionLabel>Admin Theme</SectionLabel>
              <Card>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => setAdminTheme("dark")} style={{ flex: 1, padding: "10px", background: adminTheme === "dark" ? "#a855f7" : bgInput, color: adminTheme === "dark" ? "#fff" : textMain, border: "none", borderRadius: "8px", cursor: "pointer" }}>Dark Mode</button>
                  <button onClick={() => setAdminTheme("light")} style={{ flex: 1, padding: "10px", background: adminTheme === "light" ? "#a855f7" : bgInput, color: adminTheme === "light" ? "#fff" : textMain, border: "none", borderRadius: "8px", cursor: "pointer" }}>Light Mode</button>`
);

writeFileSync(file2, content2, 'utf8');

