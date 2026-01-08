import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../shared/schema';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Função para obter o caminho do banco de dados
function getDatabasePath(): string {
  const dbPath = process.env.DATABASE_PATH || './data/database.sqlite';
  
  // Criar diretório se não existir
  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`📁 Diretório criado: ${dir}`);
  }
  
  return dbPath;
}

// Criar conexão SQLite
const dbPath = getDatabasePath();
const sqlite = new Database(dbPath);

// Habilitar WAL mode para melhor performance
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL');
sqlite.pragma('foreign_keys = ON');

console.log(`📊 SQLite conectado: ${dbPath}`);

// Criar instância do Drizzle ORM com o schema
export const db = drizzle(sqlite, { schema });

// Função para testar a conexão
export async function testConnection() {
  try {
    const result = sqlite.prepare('SELECT sqlite_version() as version, datetime("now") as now').get() as any;
    console.log('🔗 Conexão SQLite bem-sucedida!');
    console.log(`   📅 Hora: ${result.now}`);
    console.log(`   📌 Versão SQLite: ${result.version}`);
    console.log(`   🗄️  Arquivo: ${dbPath}`);
    return true;
  } catch (error) {
    console.error('❌ Falha ao conectar com SQLite:');
    console.error('   Erro:', error instanceof Error ? error.message : error);
    throw error;
  }
}

// Função para fechar a conexão
export async function closeDatabase() {
  try {
    sqlite.close();
    console.log('🔌 Conexão SQLite fechada');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error);
  }
}

// Exportar também a conexão direta
export { sqlite };
export default db;