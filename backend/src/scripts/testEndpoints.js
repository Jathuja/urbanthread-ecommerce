const BASE_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('--- Starting UrbanThread API Test Suite ---\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`FAIL: ${name}`);
      console.error(`      Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /api/health', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (!res.ok || !data.success || data.message !== 'UrbanThread API is running') {
      throw new Error(`Unexpected health payload: ${JSON.stringify(data)}`);
    }
  });

  // 2. Categories
  await test('GET /api/categories', async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    const data = await res.json();
    if (!res.ok || !data.success || !Array.isArray(data.data) || data.data.length !== 3) {
      throw new Error(`Expected 3 categories, got ${data.count}`);
    }
  });

  // 3. Products
  await test('GET /api/products', async () => {
    const res = await fetch(`${BASE_URL}/products`);
    const data = await res.json();
    if (!res.ok || !data.success || data.data.length !== 12) {
      throw new Error(`Expected 12 products, got ${data.data.length}`);
    }
    const first = data.data[0];
    if (!first.variants || first.variants.length === 0 || !first.category) {
      throw new Error('Product is missing variants or category');
    }
  });

  // 4. Product by ID
  await test('GET /api/products/1', async () => {
    const res = await fetch(`${BASE_URL}/products/1`);
    const data = await res.json();
    if (!res.ok || !data.success || data.data.id !== 1 || !data.data.name) {
      throw new Error(`Product 1 lookup failed`);
    }
  });

  // 5. Search filter (search=tshirt)
  await test('GET /api/products?search=tshirt', async () => {
    const res = await fetch(`${BASE_URL}/products?search=tshirt`);
    const data = await res.json();
    if (!res.ok || data.data.length < 2) {
      throw new Error(`Expected at least 2 t-shirts, got ${data.data?.length}`);
    }
  });

  // 6. Category filter (category=Men)
  await test('GET /api/products?category=Men', async () => {
    const res = await fetch(`${BASE_URL}/products?category=Men`);
    const data = await res.json();
    if (!res.ok || data.data.length !== 7) {
      throw new Error(`Expected 7 Men products, got ${data.data?.length}`);
    }
  });

  // 7. Size filter (size=M)
  await test('GET /api/products?size=M', async () => {
    const res = await fetch(`${BASE_URL}/products?size=M`);
    const data = await res.json();
    if (!res.ok || data.data.length !== 9) {
      throw new Error(`Expected 9 products with size M, got ${data.data?.length}`);
    }
  });

  // 8. Colour filter (colour=Black)
  await test('GET /api/products?colour=Black', async () => {
    const res = await fetch(`${BASE_URL}/products?colour=Black`);
    const data = await res.json();
    if (!res.ok || data.data.length !== 8) {
      throw new Error(`Expected 8 products with colour Black, got ${data.data?.length}`);
    }
  });

  // 9. Price filter (minPrice=1000&maxPrice=5000)
  await test('GET /api/products?minPrice=1000&maxPrice=5000', async () => {
    const res = await fetch(`${BASE_URL}/products?minPrice=1000&maxPrice=5000`);
    const data = await res.json();
    if (!res.ok || data.data.length !== 6) {
      throw new Error(`Expected 6 products in price range [1000, 5000], got ${data.data?.length}`);
    }
    for (const p of data.data) {
      if (p.price < 1000 || p.price > 5000) {
        throw new Error(`Product ${p.name} price ${p.price} out of range`);
      }
    }
  });

  // 10. Combination filter (search=tshirt&size=M&colour=Black)
  await test('GET /api/products?search=tshirt&size=M&colour=Black', async () => {
    const res = await fetch(`${BASE_URL}/products?search=tshirt&size=M&colour=Black`);
    const data = await res.json();
    if (!res.ok || data.data.length !== 2) {
      throw new Error(`Expected 2 items, got ${data.data?.length}`);
    }
  });

  // 11. Invalid product ID (non-existent -> 404)
  await test('GET /api/products/999 (404 Not Found)', async () => {
    const res = await fetch(`${BASE_URL}/products/999`);
    const data = await res.json();
    if (res.status !== 404 || data.success !== false) {
      throw new Error(`Expected 404 Not Found, got ${res.status}`);
    }
  });

  // 12. Invalid product ID format (non-integer -> 400)
  await test('GET /api/products/abc (400 Bad Request)', async () => {
    const res = await fetch(`${BASE_URL}/products/abc`);
    const data = await res.json();
    if (res.status !== 400 || data.success !== false) {
      throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    }
  });

  // 13. Invalid price parameters (minPrice > maxPrice -> 400)
  await test('GET /api/products?minPrice=5000&maxPrice=1000 (400 Bad Request)', async () => {
    const res = await fetch(`${BASE_URL}/products?minPrice=5000&maxPrice=1000`);
    const data = await res.json();
    if (res.status !== 400 || data.success !== false) {
      throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    }
  });

  console.log(`\n--- Test Summary: ${passed} passed, ${failed} failed ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
