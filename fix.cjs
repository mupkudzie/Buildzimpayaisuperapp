const { readFileSync, writeFileSync } = require('fs');

function applyCSSVars(file) {
  let content = readFileSync(file, 'utf8');

  // Instead of replacing every occurence blindly, we find the helpers section
  // and only replace the variables there.
  let parts = content.split('/* ───────── helpers ───────── */');
  if (parts.length < 2) {
      parts = content.split('/* ───────── Devices Panel ───────── */');
      if (parts.length < 2) return;
  }
  
  let top = parts[0];
  let bottom = parts[1];

  // In bottom (helpers), replace variable usages with CSS variables.
  bottom = bottom.replace(/textMuted/g, '"var(--text-muted)"');
  bottom = bottom.replace(/textMain/g, '"var(--text-main)"');
  bottom = bottom.replace(/bgInput/g, '"var(--bg-input)"');
  bottom = bottom.replace(/borderLine/g, '"var(--border-line)"');

  // Same thing for DevicesPanel part if it exists (for SuperAdminDrawer)
  if (parts.length > 2) {
    let third = parts[2];
    third = third.replace(/textMuted/g, '"var(--text-muted)"');
    third = third.replace(/textMain/g, '"var(--text-main)"');
    third = third.replace(/bgInput/g, '"var(--bg-input)"');
    third = third.replace(/borderLine/g, '"var(--border-line)"');
    bottom += '/* ───────── Devices Panel ───────── */' + third;
  }

  // Next, in top (component), we must inject the CSS variables so they evaluate properly.
  // The outer wrapper is <div style={{ position: "fixed"...
  // We can just add them to the top-level style.
  
  top = top.replace(
    'style={{',
    'style={ Object.assign({}, { "--text-muted": textMuted, "--text-main": textMain, "--bg-input": bgInput, "--border-line": borderLine } as any, {'
  );

  top = top.replace('backdropFilter: "blur(6px)",', 'backdropFilter: "blur(6px)", }) as any');

  writeFileSync(file, top + '/* ───────── helpers ───────── */' + bottom, 'utf8');
}

try {
  applyCSSVars('src/components/AdminDrawer.tsx');
  applyCSSVars('src/components/SuperAdminDrawer.tsx');
  console.log("Fixed files successfully");
} catch(e) { console.error(e) }
