/**
 * Script para sincronizar dados de portfolio_history para monthly_portfolio_snapshots
 * Isso corrige o problema onde o "Extrato da Evolução" mostrava valores incorretos
 */

import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "..", "app.db");
const db = new Database(dbPath);

console.log("🔄 Sincronizando portfolio_history → monthly_portfolio_snapshots...\n");

try {
  // 1. Buscar todos os registros de portfolio_history
  const historyRecords = db
    .prepare(
      `SELECT * FROM portfolio_history 
       WHERE total_value > 0 
       ORDER BY year, month`
    )
    .all();

  console.log(`📊 Encontrados ${historyRecords.length} registros em portfolio_history\n`);

  let synced = 0;
  let updated = 0;
  let created = 0;

  for (const record of historyRecords) {
    const { user_id, month, year, total_value, date } = record;

    // Verificar se já existe um registro em monthly_portfolio_snapshots
    const existing = db
      .prepare(
        `SELECT id, total_value FROM monthly_portfolio_snapshots 
         WHERE user_id = ? AND month = ? AND year = ?`
      )
      .get(user_id, month, year);

    if (existing) {
      // Se existe, verificar se o valor é diferente
      if (Math.abs(existing.total_value - total_value) > 0.01) {
        // Atualizar com o valor correto de portfolio_history
        db.prepare(
          `UPDATE monthly_portfolio_snapshots 
           SET total_value = ?, date = ?, is_locked = 1, updated_at = unixepoch()
           WHERE id = ?`
        ).run(total_value, date, existing.id);

        console.log(
          `✅ Atualizado: ${month}/${year} de R$ ${existing.total_value.toFixed(
            2
          )} → R$ ${total_value.toFixed(2)}`
        );
        updated++;
      }
    } else {
      // Se não existe, criar novo registro
      db.prepare(
        `INSERT INTO monthly_portfolio_snapshots 
         (id, user_id, month, year, total_value, date, is_locked, created_at, updated_at) 
         VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, 1, unixepoch(), unixepoch())`
      ).run(user_id, month, year, total_value, date);

      console.log(`➕ Criado: ${month}/${year} = R$ ${total_value.toFixed(2)}`);
      created++;
    }

    synced++;
  }

  console.log(`\n✨ Sincronização completa!`);
  console.log(`   ${synced} registros processados`);
  console.log(`   ${created} novos registros criados`);
  console.log(`   ${updated} registros atualizados`);

  // Mostrar o resumo dos snapshots atuais
  console.log(`\n📈 Resumo dos snapshots mensais (últimos 6 meses):`);
  const recentSnapshots = db
    .prepare(
      `SELECT month, year, total_value, is_locked 
       FROM monthly_portfolio_snapshots 
       WHERE is_locked = 1 
       ORDER BY year DESC, month DESC 
       LIMIT 6`
    )
    .all();

  recentSnapshots.forEach((snap) => {
    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    console.log(
      `   ${monthNames[snap.month - 1]} ${snap.year}: R$ ${snap.total_value.toLocaleString(
        "pt-BR",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}`
    );
  });
} catch (error) {
  console.error("❌ Erro durante sincronização:", error);
  process.exit(1);
} finally {
  db.close();
}
