import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  const users = [
    { name: 'Admin Silva', email: 'admin@ambar.com', role: 'ADMIN', password: passwordHash },
    { name: 'Gerente Costa', email: 'gerente@ambar.com', role: 'MANAGER', password: passwordHash },
    { name: 'Produção Santos', email: 'producao@ambar.com', role: 'PRODUCTION', password: passwordHash },
    { name: 'Estoque Lima', email: 'estoque@ambar.com', role: 'STOCK', password: passwordHash },
    { name: 'Vendas Sousa', email: 'vendas@ambar.com', role: 'SALES', password: passwordHash },
    { name: 'Compras Oliveira', email: 'compras@ambar.com', role: 'PURCHASING', password: passwordHash },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }

  const categories = ['Esportiva', 'Casual', 'Social', 'Infantil', 'Masculina', 'Feminina', 'Academia', 'Corrida', 'Compressão', 'Personalizada'];
  for (const c of categories) {
    await prisma.category.upsert({ where: { name: c }, update: {}, create: { name: c } });
  }

  const types = ['Soquete', 'Sapatilha', 'Cano curto', 'Cano médio', 'Cano longo', 'Social', '3/4', 'Infantil'];
  for (const t of types) {
    await prisma.sockType.upsert({ where: { name: t }, update: {}, create: { name: t } });
  }

  const collections = ['Academia', 'Emoji', 'Natal', 'Casais', 'Infantil', 'Básica', 'Premium', 'Street', 'Fitness'];
  for (const col of collections) {
    await prisma.collection.upsert({ where: { name: col }, update: {}, create: { name: col } });
  }

  const warehouses = ['Depósito', 'Produção', 'Expedição', 'Loja Física', 'Loja Virtual'];
  for (const w of warehouses) {
    await prisma.warehouse.upsert({ where: { name: w }, update: {}, create: { name: w } });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
