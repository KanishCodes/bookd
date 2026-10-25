// End-to-end API test. Run against a FRESH server (state is in memory and this script mutates it):
//   npm.cmd --prefix server start      (terminal 1)
//   node server/test/e2e.mjs           (terminal 2)
const BASE = process.env.API_URL || 'http://localhost:5000/api';
let pass = 0, fail = 0;
const failures = [];

const call = async (method, path, { token, body } = {}) => {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { status: res.status, data };
};
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; failures.push(name); console.log(`  FAIL  ${name} ${extra}`); }
};
const expectStatus = (name, r, status, message) => {
  const ok = r.status === status && (message === undefined || r.data?.message === message);
  check(name, ok, `(got ${r.status} ${JSON.stringify(r.data)?.slice(0, 160)})`);
};
const section = (t) => console.log(`\n== ${t}`);

const login = async (email, password = 'demo1234') => call('POST', '/auth/login', { body: { email, password } });

// ---------------------------------------------------------------- AUTH
section('Auth');
const m = await login('member@bookd.test');
const l = await login('librarian@bookd.test');
const a = await login('admin@bookd.test');
check('member login 200 + token + role', m.status === 200 && m.data.token && m.data.user.role === 'member' && m.data.user.id === 'u-1');
check('librarian login', l.status === 200 && l.data.user.role === 'librarian' && l.data.user.id === 'u-2');
check('admin login', a.status === 200 && a.data.user.role === 'admin' && a.data.user.id === 'u-3');
check('login never leaks passwordHash', !('passwordHash' in m.data.user));
for (const [alias, role] of [['kanish@bookd.test', 'member'], ['naisha@bookd.test', 'librarian'], ['patel@bookd.test', 'admin'], ['kanish', 'member'], ['Naisha', 'librarian'], ['PATEL', 'admin']]) {
  const r = await login(alias);
  check(`alias login "${alias}" -> ${role}`, r.status === 200 && r.data.user.role === role);
}
expectStatus('wrong password 401', await login('member@bookd.test', 'wrong'), 401, 'Invalid email or password');
expectStatus('unknown user 401', await login('nobody@x.com'), 401, 'Invalid email or password');
expectStatus('missing fields 400', await call('POST', '/auth/login', { body: {} }), 400);
const M = m.data.token, L = l.data.token, A = a.data.token;
expectStatus('/auth/me no token 401', await call('GET', '/auth/me'), 401);
expectStatus('/auth/me bad token 401', await call('GET', '/auth/me', { token: 'garbage.token.here' }), 401);
const me = await call('GET', '/auth/me', { token: M });
check('/auth/me returns user + activeIssuesCount + totalFines', me.status === 200 && me.data.user.id === 'u-1' && typeof me.data.user.activeIssuesCount === 'number' && typeof me.data.user.totalFines === 'number', JSON.stringify(me.data));
const reg = await call('POST', '/auth/register', { body: { name: 'Test Sneaky', email: 'sneaky@test.com', password: 'longenough1', role: 'admin' } });
check('register forces role=member even if body says admin', reg.status === 201 && reg.data.user.role === 'member');
expectStatus('register duplicate email 400', await call('POST', '/auth/register', { body: { name: 'x', email: 'sneaky@test.com', password: 'longenough1' } }), 400);
expectStatus('register short password 400', await call('POST', '/auth/register', { body: { name: 'x', email: 'short@test.com', password: '123' } }), 400);
const regLogin = await login('sneaky@test.com', 'longenough1');
check('registered user can log in', regLogin.status === 200);

// ---------------------------------------------------------------- BOOKS
section('Books & role guards');
const list = await call('GET', '/books');
check('GET /books public 200 array', list.status === 200 && Array.isArray(list.data) && list.data.length >= 30);
check('search filter', (await call('GET', '/books?search=dune')).data.every(b => /dune/i.test(b.title + b.author + b.isbn)));
check('category filter', (await call('GET', '/books?category=Poetry')).data.every(b => b.category === 'Poetry'));
check('available=true filter', (await call('GET', '/books?available=true')).data.every(b => b.availableCopies > 0));
check('available=false filter', (await call('GET', '/books?available=false')).data.every(b => b.availableCopies === 0));
expectStatus('GET /books/:id 404', await call('GET', '/books/nope'), 404, 'Book not found');
const newBook = { title: 'Test Book', author: 'Tester', isbn: '978-0000000001', category: 'Poetry', totalCopies: 2, availableCopies: 2, shelfLocation: 'T-01' };
expectStatus('POST /books no token 401', await call('POST', '/books', { body: newBook }), 401);
expectStatus('POST /books member 403', await call('POST', '/books', { token: M, body: newBook }), 403, 'Access forbidden: insufficient role permissions');
expectStatus('PUT /books member 403', await call('PUT', '/books/b-101', { token: M, body: { title: 'x' } }), 403);
expectStatus('DELETE /books member 403', await call('DELETE', '/books/b-101', { token: M }), 403);
expectStatus('POST /books missing fields 400', await call('POST', '/books', { token: L, body: { title: 'x' } }), 400);
const created = await call('POST', '/books', { token: L, body: newBook });
check('POST /books librarian 201', created.status === 201 && created.data.id && created.data.title === 'Test Book');
const upd = await call('PUT', `/books/${created.data.id}`, { token: A, body: { title: 'Test Book v2' } });
check('PUT /books admin 200', upd.status === 200 && upd.data.title === 'Test Book v2');
expectStatus('PUT /books unknown 404', await call('PUT', '/books/nope', { token: L, body: {} }), 404);
const del = await call('DELETE', `/books/${created.data.id}`, { token: L });
check('DELETE /books librarian 200 message', del.status === 200 && del.data.message === 'Book deleted successfully');
expectStatus('GET deleted book 404', await call('GET', `/books/${created.data.id}`), 404);

// ---------------------------------------------------------------- ISSUES
section('Issues / circulation');
expectStatus('GET /issues no token 401', await call('GET', '/issues'), 401);
expectStatus('GET /issues member 403', await call('GET', '/issues', { token: M }), 403);
expectStatus('POST /issues member 403', await call('POST', '/issues', { token: M, body: { bookId: 'b-106', userId: 'u-1' } }), 403);
expectStatus('PATCH return member 403', await call('PATCH', '/issues/iss-1002/return', { token: M }), 403);
const all = await call('GET', '/issues', { token: L });
check('GET /issues librarian 200 array', all.status === 200 && Array.isArray(all.data) && all.data.length >= 13);
check('GET /issues?status=OVERDUE only overdue', (await call('GET', '/issues?status=OVERDUE', { token: L })).data.every(i => i.status === 'OVERDUE'));
const mine = await call('GET', '/issues/mine', { token: M });
check('GET /issues/mine only own loans', mine.status === 200 && mine.data.length >= 3 && mine.data.every(i => i.userId === 'u-1'));
expectStatus('GET /issues/mine no token 401', await call('GET', '/issues/mine'), 401);
const aMine = await call('GET', '/issues/mine', { token: A });
check('admin /issues/mine returns admin loans (u-3), no u-1 fallback', aMine.data.every(i => i.userId === 'u-3'));

expectStatus('issue missing fields 400', await call('POST', '/issues', { token: L, body: { bookId: 'b-106' } }), 400);
expectStatus('issue unknown user 404', await call('POST', '/issues', { token: L, body: { bookId: 'b-106', userId: 'u-999' } }), 404, 'User not found');
expectStatus('issue unknown book 404', await call('POST', '/issues', { token: L, body: { bookId: 'b-999', userId: 'u-1' } }), 404, 'Book not found');
expectStatus('issue book with 0 copies 400', await call('POST', '/issues', { token: L, body: { bookId: 'b-110', userId: 'u-1' } }), 400, 'No available copies remaining for this title');
expectStatus('issue duplicate active loan 400', await call('POST', '/issues', { token: L, body: { bookId: 'b-101', userId: 'u-1' } }), 400, 'This member already has this book on loan');

const before = (await call('GET', '/books/b-106')).data.availableCopies;
const iss = await call('POST', '/issues', { token: L, body: { bookId: 'b-106', userId: 'u-4' } });
check('issue 201 with ACTIVE / renewCount 0 / fine 0', iss.status === 201 && iss.data.status === 'ACTIVE' && iss.data.renewCount === 0 && iss.data.fineAmount === 0 && iss.data.userId === 'u-4' && iss.data.bookTitle);
const dueDays = Math.round((new Date(iss.data.dueAt) - new Date(iss.data.issuedAt)) / 86400000);
check('due date is +14 days', dueDays === 14, `(got ${dueDays})`);
check('availableCopies decremented', (await call('GET', '/books/b-106')).data.availableCopies === before - 1);

const ret = await call('PATCH', `/issues/${iss.data.id}/return`, { token: L });
check('return 200 RETURNED with returnedAt', ret.status === 200 && ret.data.status === 'RETURNED' && ret.data.returnedAt);
check('availableCopies incremented back', (await call('GET', '/books/b-106')).data.availableCopies === before);
expectStatus('double return 400', await call('PATCH', `/issues/${iss.data.id}/return`, { token: L }), 400, 'This loan has already been returned');
expectStatus('return unknown 404', await call('PATCH', '/issues/iss-nope/return', { token: L }), 404);
expectStatus('renew returned loan 400', await call('PATCH', `/issues/${iss.data.id}/renew`, { token: L }), 400);

// max 5 active loans: u-7 (Vikram) has none
const loanBooks = ['b-109', 'b-114', 'b-118', 'b-129', 'b-131', 'b-108'];
const loanIds = [];
for (let i = 0; i < 5; i++) {
  const r = await call('POST', '/issues', { token: L, body: { bookId: loanBooks[i], userId: 'u-7' } });
  check(`u-7 loan #${i + 1} allowed`, r.status === 201, JSON.stringify(r.data));
  loanIds.push(r.data.id);
}
const sixth = await call('POST', '/issues', { token: L, body: { bookId: loanBooks[5], userId: 'u-7' } });
check('6th active loan rejected 400', sixth.status === 400 && /limit/i.test(sixth.data.message), JSON.stringify(sixth.data));

section('Renewals');
const own = mine.data.find(i => i.id === 'iss-1002');
const renew1 = await call('PATCH', '/issues/iss-1002/renew', { token: M });
check('member renews own loan +14d, renewCount 1', renew1.status === 200 && renew1.data.renewCount === 1 && new Date(renew1.data.dueAt) - new Date(own.dueAt) === 14 * 86400000);
const renew2 = await call('PATCH', '/issues/iss-1002/renew', { token: M });
check('second renew ok, renewCount 2', renew2.status === 200 && renew2.data.renewCount === 2);
expectStatus('third renew 400', await call('PATCH', '/issues/iss-1002/renew', { token: M }), 400, 'Maximum renewal limit (2 times) reached for this loan');
expectStatus("member renewing someone else's loan 403", await call('PATCH', '/issues/iss-1003/renew', { token: M }), 403, 'You can only renew your own loans');
check('librarian can renew any loan', (await call('PATCH', '/issues/iss-1004/renew', { token: L })).status === 200);
expectStatus('renew unknown 404', await call('PATCH', '/issues/iss-nope/renew', { token: M }), 404);
expectStatus('renew no token 401', await call('PATCH', '/issues/iss-1002/renew'), 401);

// ---------------------------------------------------------------- FINES
section('Fines');
expectStatus('GET /fines no token 401', await call('GET', '/fines'), 401);
const myFines = await call('GET', '/fines', { token: M });
check('member sees only own fines', myFines.status === 200 && Array.isArray(myFines.data) && myFines.data.every(f => f.userId === 'u-1'));
const fine = myFines.data.find(f => f.issueId === 'iss-1001');
check('fine has exact client shape', fine && fine.id === 'fine-iss-1001' && fine.bookTitle && fine.isbn === '978-0262510875' && /^\d{4}-\d{2}-\d{2}$/.test(fine.dueDate) && fine.overdueDays > 0 && fine.dailyRate === 5 && fine.amount === Math.min(fine.overdueDays * 5, 500) && fine.status === 'UNPAID', JSON.stringify(fine));
check('settled seed fine (iss-1012) is not listed', !myFines.data.some(f => f.issueId === 'iss-1012'));
const spoof = await call('GET', '/fines?userId=u-4', { token: M });
check('member cannot read others fines via ?userId=', spoof.status === 200 && spoof.data.every(f => f.userId === 'u-1'));
const staffAll = await call('GET', '/fines', { token: L });
check('staff sees all users fines', staffAll.data.some(f => f.userId === 'u-4') && staffAll.data.some(f => f.userId === 'u-1'));
check('staff ?userId filter', (await call('GET', '/fines?userId=u-4', { token: L })).data.every(f => f.userId === 'u-4'));
const pendingBefore = (await call('GET', '/reports/fines', { token: A })).data;
expectStatus('member pays other member fine 403', await call('POST', '/fines/fine-iss-1003/pay', { token: M, body: { method: 'UPI' } }), 403, 'You can only pay your own fines');
expectStatus('pay unknown fine 404', await call('POST', '/fines/fine-nope/pay', { token: M, body: {} }), 404, 'Fine not found or already settled');
expectStatus('pay no token 401', await call('POST', '/fines/fine-iss-1001/pay'), 401);
const pay = await call('POST', '/fines/fine-iss-1001/pay', { token: M, body: { method: 'UPI' } });
check('pay own fine -> {success, transactionId, paidAmount, paidAt}', pay.status === 200 && pay.data.success === true && /^TXN-/.test(pay.data.transactionId) && pay.data.paidAmount === fine.amount && pay.data.paidAt, JSON.stringify(pay.data));
expectStatus('pay same fine twice 404', await call('POST', '/fines/fine-iss-1001/pay', { token: M, body: {} }), 404, 'Fine not found or already settled');
check('paid fine disappears from list', !(await call('GET', '/fines', { token: M })).data.some(f => f.issueId === 'iss-1001'));
const pendingAfter = (await call('GET', '/reports/fines', { token: A })).data;
check('report totalCollected rises by paid amount', pendingAfter.totalCollected === pendingBefore.totalCollected + fine.amount, `${pendingBefore.totalCollected} -> ${pendingAfter.totalCollected}`);
check('report totalPending drops by paid amount', pendingAfter.totalPending === pendingBefore.totalPending - fine.amount, `${pendingBefore.totalPending} -> ${pendingAfter.totalPending}`);
const meAfter = await call('GET', '/auth/me', { token: M });
check('/auth/me totalFines reflects payment', meAfter.data.user.totalFines === 0, JSON.stringify(meAfter.data.user));
const staffPay = await call('POST', '/fines/fine-iss-1003/pay', { token: L, body: { method: 'BURSARY' } });
check('staff may settle any fine', staffPay.status === 200 && staffPay.data.paidAmount > 0, JSON.stringify(staffPay.data));

// ---------------------------------------------------------------- RESERVATIONS
section('Reservations');
expectStatus('GET /reservations no token 401', await call('GET', '/reservations'), 401);
const myRes = await call('GET', '/reservations', { token: M });
check('member sees only own holds, enriched with isbn+shelfLocation', myRes.status === 200 && myRes.data.length === 2 && myRes.data.every(r => r.userId === 'u-1' && r.isbn && r.shelfLocation), JSON.stringify(myRes.data));
check('staff sees all holds', (await call('GET', '/reservations', { token: L })).data.length >= 3);
expectStatus('reserve missing bookId 400', await call('POST', '/reservations', { token: M, body: {} }), 400);
expectStatus('reserve unknown book 404', await call('POST', '/reservations', { token: M, body: { bookId: 'b-999', userId: 'u-1' } }), 404, 'Book not found');
expectStatus('reserve duplicate hold 400', await call('POST', '/reservations', { token: M, body: { bookId: 'b-103', userId: 'u-1' } }), 400);
expectStatus('reserve book already on loan 400', await call('POST', '/reservations', { token: M, body: { bookId: 'b-102', userId: 'u-1' } }), 400, 'This member already has this book on loan');
const r1 = await call('POST', '/reservations', { token: M, body: { bookId: 'b-123', userId: 'u-1' } });
check('reserve 201 WAITING, queuePosition = existing+1 (2)', r1.status === 201 && r1.data.status === 'WAITING' && r1.data.queuePosition === 2 && r1.data.userId === 'u-1' && r1.data.isbn && r1.data.estimatedDate, JSON.stringify(r1.data));
const spoofRes = await call('POST', '/reservations', { token: M, body: { bookId: 'b-107', userId: 'u-4' } });
check('member cannot reserve on behalf of someone else (forced to self)', spoofRes.status === 201 && spoofRes.data.userId === 'u-1', JSON.stringify(spoofRes.data));
expectStatus("member cancels other member's hold 403", await call('DELETE', '/reservations/res-203', { token: M }), 403);
expectStatus('cancel unknown 404', await call('DELETE', '/reservations/res-nope', { token: M }), 404);
expectStatus('cancel no token 401', await call('DELETE', '/reservations/res-201'), 401);
const cancel = await call('DELETE', `/reservations/${r1.data.id}`, { token: M });
check('cancel own hold {success, message}', cancel.status === 200 && cancel.data.success === true && cancel.data.message);
const staffRes = await call('POST', '/reservations', { token: L, body: { bookId: 'b-123', userId: 'u-9' } });
check('staff reserves for a member', staffRes.status === 201 && staffRes.data.userId === 'u-9');
const queueNow = (await call('GET', '/reservations', { token: L })).data.filter(r => r.bookId === 'b-123').map(r => r.queuePosition).sort();
check('queue renumbered after cancel (1,2)', JSON.stringify(queueNow) === '[1,2]', JSON.stringify(queueNow));

section('Reservation <-> circulation');
// u-9 now holds b-123 (all copies out). Return the Pattern Language loan -> next WAITING hold becomes READY_FOR_PICKUP
// (res-203 is already READY, u-9 is WAITING position 2)
const retPL = await call('PATCH', '/issues/iss-1005/return', { token: L });
check('return of reserved title ok', retPL.status === 200);
const afterReturn = (await call('GET', '/reservations', { token: L })).data.filter(r => r.bookId === 'b-123');
check('next WAITING hold flips to READY_FOR_PICKUP on return', afterReturn.find(r => r.userId === 'u-9')?.status === 'READY_FOR_PICKUP', JSON.stringify(afterReturn));
const gatsbyHold = (await call('GET', '/reservations', { token: M })).data.find(r => r.bookId === 'b-103');
check('seed hold on CLRS still present for u-1', !!gatsbyHold);
// Issue CLRS? 0 copies; return Rohan's CLRS loan then issue to u-1 -> hold cleared
await call('PATCH', '/issues/iss-1004/return', { token: L });
const lend = await call('POST', '/issues', { token: L, body: { bookId: 'b-103', userId: 'u-1' } });
check('issue reserved title to the holder', lend.status === 201);
check('borrowing clears that members hold', !(await call('GET', '/reservations', { token: M })).data.some(r => r.bookId === 'b-103'));

// ---------------------------------------------------------------- REPORTS
section('Reports');
for (const p of ['/reports/overdue', '/reports/popular', '/reports/fines', '/reports/summary']) {
  expectStatus(`GET ${p} no token 401`, await call('GET', p), 401);
  expectStatus(`GET ${p} member 403`, await call('GET', p, { token: M }), 403);
  expectStatus(`GET ${p} librarian 403`, await call('GET', p, { token: L }), 403);
}
const od = await call('GET', '/reports/overdue', { token: A });
check('overdue: {count, records[]} all OVERDUE', od.status === 200 && od.data.count === od.data.records.length && od.data.records.every(r => r.status === 'OVERDUE'));
const pop = await call('GET', '/reports/popular', { token: A });
check('popular: top 8 [{title, issues, category}] sorted desc', pop.status === 200 && pop.data.length === 8 && pop.data.every(p => p.title && typeof p.issues === 'number' && p.category) && pop.data.every((p, i, arr) => i === 0 || arr[i - 1].issues >= p.issues), JSON.stringify(pop.data));
check('popular: CLRS leads with seed 48 + live loans', pop.data[0].title.includes('Introduction to Algorithms') && pop.data[0].issues >= 48 + 1, JSON.stringify(pop.data[0]));
const fr = await call('GET', '/reports/fines', { token: A });
check('fines report shape', fr.status === 200 && ['totalCollected', 'totalPending', 'overdueCount'].every(k => typeof fr.data[k] === 'number') && Array.isArray(fr.data.monthlyBreakdown) && fr.data.monthlyBreakdown.length === 6, JSON.stringify(fr.data));
const sum = await call('GET', '/reports/summary', { token: A });
check('summary: summary + categoryDistribution + overdueMembers', sum.status === 200 && sum.data.summary.totalBooks >= 30 && Array.isArray(sum.data.categoryDistribution) && Array.isArray(sum.data.overdueMembers) && sum.data.overdueMembers.every(o => o.name && o.memberId && o.book && o.overdueDays > 0 && o.fine > 0), JSON.stringify(sum.data).slice(0, 300));

// ---------------------------------------------------------------- MISC
section('Misc');
expectStatus('unknown route -> 404 {message}', await call('GET', '/nope'), 404);
check('health ok', (await call('GET', '/health')).data.status === 'ok');
const badJson = await fetch(BASE + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
const badJsonBody = await badJson.json().catch(() => ({}));
check('malformed JSON -> 400 {message}', badJson.status === 400 && typeof badJsonBody.message === 'string', `(got ${badJson.status} ${JSON.stringify(badJsonBody)})`);

console.log(`\n==================== ${pass} passed, ${fail} failed ====================`);
if (fail) { console.log('Failed:\n - ' + failures.join('\n - ')); process.exit(1); }
