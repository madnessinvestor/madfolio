import Database from "better-sqlite3";

const db = new Database("./app.db", { readonly: true });

console.log("📋 Tabelas no banco de dados:\n");
const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all();
tables.forEach(t => console.log(`  - ${t.name}`));

console.log("\n📊 Verificando dados:\n");

try {
  const portfolioCount = db.prepare(`SELECT COUNT(*) as count FROM portfolio_history`).get();
  console.log(`  portfolio_history: ${portfolioCount.count} registros`);

  const snapshotsCount = db.prepare(`SELECT COUNT(*) as count FROM monthly_portfolio_snapshots`).get();
  console.log(`  monthly_portfolio_snapshots: ${snapshotsCount.count} registros`);

  console.log("\n📈 Últimos registros em portfolio_history:");
  const lastPortfolio = db.prepare(`
    SELECT month, year, total_value 
    FROM portfolio_history 
    ORDER BY year DESC, month DESC 
    LIMIT 5
  `).all();
  
  lastPortfolio.forEach(r => {
    console.log(`    ${r.month}/${r.year}: R$ ${r.total_value.toFixed(2)}`);
  });

  console.log("\n📊 Últimos registros em monthly_portfolio_snapshots:");
  const lastSnapshots = db.prepare(`
    SELECT month, year, total_value, is_locked 
    FROM monthly_portfolio_snapshots 
    ORDER BY year DESC, month DESC 
    LIMIT 5
  `).all();
  
  lastSnapshots.forEach(r => {
    console.log(`    ${r.month}/${r.year}: R$ ${r.total_value.toFixed(2)} ${r.is_locked ? '🔒' : '🔓'}`);
  });

} catch (error) {
  console.error("❌ Erro:", error.message);
}

db.close();
