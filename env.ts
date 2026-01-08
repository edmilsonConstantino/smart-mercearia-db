// env.ts - Carrega as variáveis de ambiente o mais cedo possível
import { config } from 'dotenv';
import path from 'path';

// Carregar .env do diretório raiz (apenas desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  const result = config({ path: path.resolve(process.cwd(), '.env') });

  if (result.error) {
    console.warn('⚠️  Aviso: Arquivo .env não encontrado ou erro ao carregar');
    console.warn('   Caminho procurado:', path.resolve(process.cwd(), '.env'));
  } else {
    console.log('✅ Variáveis de ambiente carregadas do .env');
  }
}

// Definir valores padrão para produção (Render gratuito)
if (process.env.NODE_ENV === 'production') {
  process.env.DATABASE_PATH = process.env.DATABASE_PATH || '/opt/render/project/src/data/database.sqlite';
  process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'render-production-secret-key-change-this-12345';
  
  console.log('✅ Variáveis padrão configuradas para produção');
  console.log(`   DATABASE_PATH: ${process.env.DATABASE_PATH}`);
}

export {};