/**
 * Automated Concurrency & Race-Condition Test Suite
 * Simulates simultaneous checkout of the last available book copy by two librarians/patrons.
 *
 * Run against a running server:
 *   Terminal 1: npm.cmd --prefix server start
 *   Terminal 2: npm.cmd --prefix server run test:concurrency
 */

const BASE = process.env.API_URL || 'http://localhost:5000/api';
let pass = 0;
let fail = 0;

const logCheck = (name, condition, details = '') => {
  if (condition) {
    pass++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m  ${name}`);
  } else {
    fail++;
    console.log(`  \x1b[31m✖ FAIL\x1b[0m  ${name} ${details}`);
  }
};

const call = async (method, path, { token, body } = {}) => {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty */
  }
  return { status: res.status, data };
};

const runConcurrencySuite = async () => {
  console.log('\n===============================================================');
  console.log('   Book’d — Concurrency & Atomic Inventory Test Suite');
  console.log('===============================================================\n');

  // 1. Health check
  try {
    const health = await call('GET', '/health');
    if (health.status !== 200) {
      console.error(`[Error] Server returned status ${health.status}. Ensure server is running at ${BASE}`);
      process.exit(1);
    }
    console.log(`  Connected to API at: ${BASE}\n`);
  } catch (err) {
    console.error(`\x1b[31m[Error] Could not connect to ${BASE}\x1b[0m`);
    console.error(`Please ensure the Express server is running first:\n   npm.cmd --prefix server start\n`);
    process.exit(1);
  }

  // 2. Authentication
  console.log('--- Step 1: Authentication ---');
  const loginRes = await call('POST', '/auth/login', {
    body: { email: 'admin@bookd.test', password: 'demo1234' },
  });
  logCheck('Admin login for staff authorization', loginRes.status === 200 && loginRes.data.token);
  const token = loginRes.data?.token;

  // 3. Create a book with exactly ONE copy available
  console.log('\n--- Step 2: Create Single-Copy Book Inventory ---');
  const testIsbn = `978-9-${Date.now().toString().slice(-9)}`;
  const createBookRes = await call('POST', '/books', {
    token,
    body: {
      title: 'Concurrency & Distributed Systems (Single Copy Edition)',
      author: 'Leslie Lamport',
      isbn: testIsbn,
      category: 'Computer Science',
      totalCopies: 1,
      availableCopies: 1,
      shelfLocation: 'ARCH-RACE-01',
      publicationYear: 2026,
    },
  });
  logCheck(
    'Book created with availableCopies: 1',
    createBookRes.status === 201 && createBookRes.data.availableCopies === 1,
    JSON.stringify(createBookRes.data)
  );
  const bookId = createBookRes.data?.id;

  // 4. Simulate simultaneous checkout requests at the exact same millisecond
  console.log('\n--- Step 3: Dispatch Simultaneous Checkout Requests ---');
  console.log('  Triggering 2 simultaneous POST /api/issues for the same 1-copy book...');

  const [res1, res2] = await Promise.all([
    call('POST', '/issues', {
      token,
      body: { bookId, userId: 'u-1' },
    }),
    call('POST', '/issues', {
      token,
      body: { bookId, userId: 'u-4' },
    }),
  ]);

  const statuses = [res1.status, res2.status].sort();
  console.log(`  Request 1 response: HTTP ${res1.status} (${JSON.stringify(res1.data?.message || 'Loan created')})`);
  console.log(`  Request 2 response: HTTP ${res2.status} (${JSON.stringify(res2.data?.message || 'Loan created')})`);

  logCheck(
    'Exactly ONE request succeeds with HTTP 201 Created',
    statuses[0] === 201 || statuses[1] === 201
  );

  logCheck(
    'Competing concurrent request is rejected with HTTP 400 Bad Request',
    statuses[0] === 400 || statuses[1] === 400
  );

  // 5. Verify database inventory integrity
  console.log('\n--- Step 4: Verify Inventory Consistency ---');
  const verifyBookRes = await call('GET', `/books/${bookId}`);
  logCheck(
    'Available copies is exactly 0 (Never negative / No double-issue corruption)',
    verifyBookRes.status === 200 && verifyBookRes.data.availableCopies === 0,
    `got availableCopies = ${verifyBookRes.data?.availableCopies}`
  );

  // 6. Attempt a 3rd checkout when copies are 0
  console.log('\n--- Step 5: Verify Rejection on Zero Copies ---');
  const res3 = await call('POST', '/issues', {
    token,
    body: { bookId, userId: 'u-5' },
  });
  logCheck(
    'Subsequent issue request strictly rejected with 400',
    res3.status === 400 && res3.data?.message?.includes('No available copies')
  );

  // Summary
  console.log('\n===============================================================');
  console.log(` Test Results: ${pass} Passed, ${fail} Failed`);
  if (fail === 0) {
    console.log(' \x1b[32m✔ SUCCESS: Inventory concurrency and atomic guards verified 100%!\x1b[0m');
  } else {
    console.log(' \x1b[31m✖ FAILURE: Race condition detected in circulation layer.\x1b[0m');
  }
  console.log('===============================================================\n');

  process.exit(fail === 0 ? 0 : 1);
};

runConcurrencySuite().catch((err) => {
  console.error('[Fatal Test Error]:', err);
  process.exit(1);
});
