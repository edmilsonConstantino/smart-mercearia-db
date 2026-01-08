// NÃO carregar .env em produção - usar variáveis de ambiente do sistema
if (process.env.NODE_ENV !== 'production') {
  await import("../env");
} else {
  // Importar env.ts mesmo em produção para definir defaults
  await import("../env");
}

import fs from "node:fs";
import { type Server } from "node:http";
import path from "node:path";

import express, { type Express } from "express";

import { app } from "./app";
import runApp from "./runApp";

// Verificar variáveis obrigatórias
console.log('\n🔍 Verificando variáveis de ambiente (PRODUÇÃO)...');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   PORT: ${process.env.PORT || 'não definida'}`);

// Para SQLite, verificar DATABASE_PATH
const dbPath = process.env.DATABASE_PATH || './data/database.sqlite';
console.log(`   DATABASE_PATH: ${dbPath}`);

// Criar diretório se não existir
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  console.log(`   📁 Criando diretório: ${dbDir}`);
  fs.mkdirSync(dbDir, { recursive: true });
}

if (fs.existsSync(dbPath)) {
  console.log(`   ✅ SQLite database encontrado`);
} else {
  console.log(`   ⚠️  SQLite database será criado em: ${dbPath}`);
}

console.log('✅ Variáveis de ambiente OK\n');

export async function serveStatic(app: Express, _server: Server) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

(async () => {
  await runApp(app, serveStatic);
})();