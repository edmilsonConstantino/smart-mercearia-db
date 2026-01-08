// env.ts - Carrega as variáveis de ambiente o mais cedo possível
import { config } from 'dotenv';
import path from 'path';

// Carregar .env do diretório raiz
const result = config({ path: path.resolve(process.cwd(), '.env') });

if (result.error) {
  console.warn('⚠️  Aviso: Arquivo .env não encontrado ou erro ao carregar');
  console.warn('   Caminho procurado:', path.resolve(process.cwd(), '.env'));
} else {
  console.log('✅ Variáveis de ambiente carregadas do .env');
}

// SQLite não requer validação de variáveis obrigatórias
// DATABASE_PATH tem valor padrão: './data/database.sqlite'
// Se não estiver definido, será criado automaticamente

export {};