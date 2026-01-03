import Database from "better-sqlite3";

const db = new Database("./app.db", { readonly: true });

console.log("🔍 Analisando portfolio_history para Dez 2025:\n");

const dec2025 = db.prepare(`
  SELECT * FROM portfolio_history 
  WHERE year = 2025 AND month = 12 
  ORDER BY date DESC, created_at DESC
  LIMIT 1
`).get();

if (dec2025) {
  console.log(`Último registro de Dez 2025:`);
  console.log(`  Valor: R$ ${dec2025.total_value.toFixed(2)}`);
  console.log(`  Data: ${dec2025.date}`);
  console.log(`  Created: ${new Date(dec2025.created_at * 1000).toLocaleString('pt-BR')}`);
}

console.log("\n🔍 Buscando o valor correto de R$ 952.338,64:");
const correctValue = db.prepare(`
  SELECT * FROM portfolio_history 
  WHERE year = 2025 AND month = 12 
  AND ABS(total_value - 952338.64) < 1
  ORDER BY date DESC
  LIMIT 5
`).all();

if (correctValue.length > 0) {
  console.log(`✅ Encontrado ${correctValue.length} registro(s) próximo(s):`);
  correctValue.forEach(r => {
    console.log(`  R$ ${r.total_value.toFixed(2)} - ${r.date} - Created: ${new Date(r.created_at * 1000).toLocaleString('pt-BR')}`);
  });
} else {
  console.log(`❌ Valor correto NÃO encontrado em portfolio_history`);
  console.log(`\nValores próximos (950k-955k):`);
  const closeValues = db.prepare(`
    SELECT * FROM portfolio_history 
    WHERE year = 2025 AND month = 12 
    AND total_value BETWEEN 950000 AND 955000
    ORDER BY ABS(total_value - 952338.64)
    LIMIT 10
  `).all();
  
  closeValues.forEach(r => {
    console.log(`  R$ ${r.total_value.toFixed(2)} - ${r.date}`);
  });
}

db.close();
