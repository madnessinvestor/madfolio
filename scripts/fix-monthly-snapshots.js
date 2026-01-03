/**
 * Script para corrigir manualmente os valores incorretos em monthly_portfolio_snapshots
 */

import Database from "better-sqlite3";

const db = new Database("./app.db");

console.log("🔧 Corrigindo valores em monthly_portfolio_snapshots...\n");

try {
  db.exec("BEGIN TRANSACTION");

  // 1. Corrigir Dezembro 2025: R$ 970.271,57 → R$ 952.338,64
  const dec2025Update = db.prepare(`
    UPDATE monthly_portfolio_snapshots
    SET total_value = 952338.64,
        date = '2025-12-31',
        updated_at = unixepoch()
    WHERE year = 2025 AND month = 12
  `);
  
  const dec2025Result = dec2025Update.run();
  console.log(`✅ Dezembro 2025 atualizado: ${dec2025Result.changes} registro(s)`);
  console.log(`   R$ 970.271,57 → R$ 952.338,64`);

  // 2. Corrigir Janeiro 2026: R$ 976.784,07 → R$ 981.407,22
  const jan2026Update = db.prepare(`
    UPDATE monthly_portfolio_snapshots
    SET total_value = 981407.22,
        date = '2026-01-01',
        updated_at = unixepoch()
    WHERE year = 2026 AND month = 1
  `);
  
  const jan2026Result = jan2026Update.run();
  console.log(`✅ Janeiro 2026 atualizado: ${jan2026Result.changes} registro(s)`);
  console.log(`   R$ 976.784,07 → R$ 981.407,22`);

  db.exec("COMMIT");

  console.log("\n✨ Correção concluída com sucesso!");

  // Verificar os novos valores
  console.log("\n📊 Valores atualizados:");
  const verifyDec = db.prepare(`
    SELECT month, year, total_value, date, is_locked 
    FROM monthly_portfolio_snapshots 
    WHERE year = 2025 AND month = 12
  `).get();
  
  const verifyJan = db.prepare(`
    SELECT month, year, total_value, date, is_locked 
    FROM monthly_portfolio_snapshots 
    WHERE year = 2026 AND month = 1
  `).get();

  console.log(`  Dez 2025: R$ ${verifyDec.total_value.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${verifyDec.is_locked ? '🔒' : '🔓'}`);
  console.log(`  Jan 2026: R$ ${verifyJan.total_value.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${verifyJan.is_locked ? '🔒' : '🔓'}`);

} catch (error) {
  db.exec("ROLLBACK");
  console.error("❌ Erro durante correção:", error);
  process.exit(1);
} finally {
  db.close();
}
