const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const p = await prisma.product.findFirst();
  if (!p) {
    console.log("No product found");
    return;
  }
  try {
    await prisma.product.delete({ where: { id: p.id } });
    console.log("Deleted successfully");
  } catch(e) {
    console.error(e);
  }
}
test();
