import { db } from './index';
import { users, categories, products } from '../shared/schema';
import bcrypt from 'bcrypt';
import { count } from 'drizzle-orm';

export async function initializeDatabase() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  try {
    // Verifica se já existem usuários no banco
    const [result] = await db.select({ count: count() }).from(users);
    const userCount = Number(result.count);

    if (userCount > 0) {
      console.log(`✓ Banco de dados já inicializado (${userCount} usuários encontrados)`);
      return;
    }

    console.log('🌱 Inicializando banco de dados pela primeira vez...');

    // Hash da senha padrão
    const hashedPassword = await bcrypt.hash('senha123', 10);
    
    // Criar usuário admin
    console.log('Criando usuário administrador...');
    await db.insert(users).values([
      {
        name: 'Administrador',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        avatar: '👨‍💼'
      }
    ]);

    // Criar usuários adicionais
    await db.insert(users).values([
      {
        name: 'João Silva',
        username: 'joao',
        password: hashedPassword,
        role: 'seller',
        avatar: '👨‍💻'
      },
      {
        name: 'Maria Santos',
        username: 'maria',
        password: hashedPassword,
        role: 'manager',
        avatar: '👩‍💼'
      }
    ]);

    console.log('✓ Usuários criados');

    // Criar categorias
    console.log('Criando categorias...');
    const [frutas, verduras, graos, bebidas, laticinios] = await db.insert(categories).values([
      { name: 'Frutas', color: 'bg-orange-100 text-orange-800 border-orange-200' },
      { name: 'Verduras', color: 'bg-green-100 text-green-800 border-green-200' },
      { name: 'Grãos', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      { name: 'Bebidas', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      { name: 'Laticínios', color: 'bg-purple-100 text-purple-800 border-purple-200' }
    ]).returning();

    console.log('✓ Categorias criadas');

    // Criar produtos de exemplo
    console.log('Criando produtos de exemplo...');
    await db.insert(products).values([
      // Frutas
      {
        sku: 'FRUTA001',
        name: 'Banana Prata',
        categoryId: frutas.id,
        price: '6.50',
        costPrice: '4.00',
        stock: '50',
        minStock: '10',
        unit: 'kg',
        image: '🍌'
      },
      {
        sku: 'FRUTA002',
        name: 'Maçã Fuji',
        categoryId: frutas.id,
        price: '8.90',
        costPrice: '5.50',
        stock: '30',
        minStock: '10',
        unit: 'kg',
        image: '🍎'
      },
      {
        sku: 'FRUTA003',
        name: 'Laranja Pera',
        categoryId: frutas.id,
        price: '5.50',
        costPrice: '3.20',
        stock: '45',
        minStock: '15',
        unit: 'kg',
        image: '🍊'
      },
      // Verduras
      {
        sku: 'VERD001',
        name: 'Alface Americana',
        categoryId: verduras.id,
        price: '4.50',
        costPrice: '2.50',
        stock: '25',
        minStock: '10',
        unit: 'un',
        image: '🥬'
      },
      {
        sku: 'VERD002',
        name: 'Tomate',
        categoryId: verduras.id,
        price: '7.90',
        costPrice: '5.00',
        stock: '40',
        minStock: '15',
        unit: 'kg',
        image: '🍅'
      },
      // Grãos
      {
        sku: 'GRAO001',
        name: 'Arroz Integral 1kg',
        categoryId: graos.id,
        price: '8.90',
        costPrice: '5.50',
        stock: '100',
        minStock: '20',
        unit: 'pack',
        image: '🌾'
      },
      {
        sku: 'GRAO002',
        name: 'Feijão Preto 1kg',
        categoryId: graos.id,
        price: '9.50',
        costPrice: '6.00',
        stock: '80',
        minStock: '20',
        unit: 'pack',
        image: '🫘'
      },
      // Bebidas
      {
        sku: 'BEB001',
        name: 'Água Mineral 500ml',
        categoryId: bebidas.id,
        price: '2.50',
        costPrice: '1.20',
        stock: '200',
        minStock: '50',
        unit: 'un',
        image: '💧'
      },
      // Laticínios
      {
        sku: 'LAT001',
        name: 'Leite Integral 1L',
        categoryId: laticinios.id,
        price: '5.90',
        costPrice: '4.00',
        stock: '60',
        minStock: '20',
        unit: 'un',
        image: '🥛'
      },
      {
        sku: 'LAT002',
        name: 'Queijo Minas Frescal',
        categoryId: laticinios.id,
        price: '28.90',
        costPrice: '18.00',
        stock: '15',
        minStock: '5',
        unit: 'kg',
        image: '🧀'
      }
    ]);

    console.log('✓ Produtos criados');
    console.log('\n✅ Banco de dados inicializado com sucesso!');
    console.log('\n📋 Credenciais padrão:');
    console.log('   Admin: username=admin, senha=senha123');
    console.log('   Vendedor: username=joao, senha=senha123');
    console.log('   Gerente: username=maria, senha=senha123\n');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    
    // Em produção, falhar imediatamente para evitar deploy sem dados
    if (isProduction) {
      console.error('🚨 ERRO CRÍTICO: Não foi possível inicializar o banco de dados em produção!');
      throw error;
    }
    
    // Em desenvolvimento, apenas avisar mas continuar
    console.warn('⚠️  Servidor continuará mas pode não ter dados iniciais');
  }
}
