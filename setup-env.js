#!/usr/bin/env node
/**
 * Setup script to create .env file with Supabase credentials
 * Usage: npm run setup-env
 */

import fs from "fs";
import path from "path";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) =>
  new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });

async function setup() {
  console.log("\n🚀 Portfolio Tracker - Supabase Setup\n");
  console.log("Vou guiar você para criar o arquivo .env\n");

  const supabaseUrl = await question(
    "Enter SUPABASE_URL (ex: https://seu-projeto.supabase.co): "
  );
  const anonKey = await question(
    "Enter SUPABASE_ANON_KEY (ex: eyJhbGciOi...): "
  );
  const databaseUrl = await question(
    "Enter DATABASE_URL (ex: postgresql://postgres:...): "
  );

  const envContent = `# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${anonKey}
DATABASE_URL=${databaseUrl}

# Server Configuration
NODE_ENV=development
PORT=5000

# Authentication
REPLIT_IDENTITY_PROVIDER=https://replit.com/identity
`;

  const envPath = path.join(process.cwd(), ".env");

  fs.writeFileSync(envPath, envContent);

  console.log("\n✅ Arquivo .env criado com sucesso!");
  console.log(`📁 Local: ${envPath}\n`);
  console.log("Próximos passos:");
  console.log("1. git add .env");
  console.log("2. git commit -m 'Add environment variables'");
  console.log("3. git push");
  console.log("4. npm run dev\n");

  rl.close();
}

setup().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
