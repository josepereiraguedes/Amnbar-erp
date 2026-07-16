const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

async function test() {
  const p = await prisma.product.create({
    data: {
      sku: 'SKU-EDIT-TEST',
      name: 'Product Edit Test',
      categoryId: (await prisma.category.findFirst()).id,
      typeId: (await prisma.sockType.findFirst()).id
    }
  });

  const u = await prisma.user.findFirst();

  // Login
  const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
    email: u.email,
    password: 'password123'
  });
  const token = loginRes.data.data.token;

  try {
    const res = await axios.put(`http://localhost:3000/api/products/${p.id}`, {
      name: 'Edited Name',
      sku: 'SKU-EDIT-TEST',
      categoryId: p.categoryId,
      typeId: p.typeId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Edit result:", res.data);
  } catch (e) {
    console.log("Edit failed:", e.response?.data);
  }
}
test();
