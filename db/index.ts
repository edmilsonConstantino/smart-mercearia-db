// db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

// Função para obter a DATABASE_URL
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL não está definida!');
    console.error('   Verifique suas variáveis de ambiente');
    throw new Error('DATABASE_URL is required');
  }
  return url;
}

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Aumentado para 10s
});

// Eventos de monitoramento do pool
pool.on('connect', () => {
  console.log('✅ Nova conexão estabelecida com PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no PostgreSQL:', err);
  process.exit(-1);
});

// Criar instância do Drizzle ORM com o schema
export const db = drizzle(pool, { schema });

// Função para testar a conexão
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now, current_database() as database, version() as version');
    console.log('🔗 Conexão PostgreSQL bem-sucedida!');
    console.log(`   📅 Hora do servidor: ${result.rows[0].now}`);
    console.log(`   🗄️  Database: ${result.rows[0].database}`);
    console.log(`   📌 Versão: ${result.rows[0].version.split(',')[0]}`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Falha ao conectar com PostgreSQL:');
    console.error('   Erro:', error instanceof Error ? error.message : error);
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      // Mostra apenas o hostname (sem senha)
      const urlObj = new URL(dbUrl);
      console.error('   Host:', urlObj.hostname);
      console.error('   Database:', urlObj.pathname.slice(1));
    } else {
      console.error('   DATABASE_URL: não definida!');
    }
    throw error;
  }
}

// Função para fechar todas as conexões
export async function closeDatabase() {
  try {
    await pool.end();
    console.log('🔌 Todas as conexões PostgreSQL foram fechadas');
  } catch (error) {
    console.error('❌ Erro ao fechar conexões:', error);
  }
}

export { pool };
export default db;