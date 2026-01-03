import Database from "better-sqlite3";

const db = new Database("./app.db", { readonly: true });

console.log("🔍 Verificando dados de Dez 2025 e Jan 2026:\n");

console.log("📈 portfolio_history:");
const ph2025_12 = db.prepare(`SELECT * FROM portfolio_history WHERE year = 2025 AND month = 12`).all();
const ph2026_01 = db.prepare(`SELECT * FROM portfolio_history WHERE year = 2026 AND month = 1`).all();

console.log(`  Dez 2025: ${ph2025_12.length} registros`);
ph2025_12.forEach(r => console.log(`    R$ ${r.total_value.toFixed(2)} - ${r.date}`));

console.log(`  Jan 2026: ${ph2026_01.length} registros`);
ph2026_01.forEach(r => console.log(`    R$ ${r.total_value.toFixed(2)} - ${r.date}`));

console.log("\n📊 monthly_portfolio_snapshots:");
const mps2025_12 = db.prepare(`SELECT * FROM monthly_portfolio_snapshots WHERE year = 2025 AND month = 12`).all();
const mps2026_01 = db.prepare(`SELECT * FROM monthly_portfolio_snapshots WHERE year = 2026 AND month = 1`).all();

console.log(`  Dez 2025: ${mps2025_12.length} registros`);
mps2025_12.forEach(r => console.log(`    R$ ${r.total_value.toFixed(2)} - ${r.date} ${r.is_locked ? '🔒' : '🔓'}`));

console.log(`  Jan 2026: ${mps2026_01.length} registros`);
mps2026_01.forEach(r => console.log(`    R$ ${r.total_value.toFixed(2)} - ${r.date} ${r.is_locked ? '🔒' : '🔓'}`));

db.close();
