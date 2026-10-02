// scripts/test-rbac-auth.mjs
import http from 'http';

const BASE_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const cookieHeader = res.headers.get('set-cookie');
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, headers: res.headers, cookieHeader };
}

async function runTests() {
  console.log('🧪 Starting RBAC Authentication & Session Integration Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // TEST 1: Unauthenticated /api/auth/me
  console.log('--- TEST 1: Unauthenticated User State ---');
  const me1 = await request('/api/auth/me');
  assert(me1.status === 200, 'GET /api/auth/me returns 200');
  assert(me1.data.authenticated === false, 'User is not authenticated');
  assert(me1.data.user === null, 'User payload is null');

  // TEST 2: Protected Admin Route without Cookie (Proxy Route Guard)
  console.log('\n--- TEST 2: Route Guard Middleware Protection ---');
  const guardTest = await request('/api/admin/seats/check-in', {
    method: 'POST',
    body: JSON.stringify({ session: 'saturday', seatNumber: 1 })
  });
  assert(guardTest.status === 401, 'Unauthorized request rejected with 401 by proxy guard');
  assert(guardTest.data.code === 'UNAUTHORIZED', 'Error code is UNAUTHORIZED');

  // TEST 3: Admin Login with Invalid PIN
  console.log('\n--- TEST 3: Admin Login Failure Rate Limiting ---');
  const badLogin = await request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ pin: 'WrongPin999' })
  });
  assert(badLogin.status === 401, 'Incorrect PIN rejected with 401');
  assert(typeof badLogin.data.remainingAttempts === 'number', 'Remaining attempts returned');

  // TEST 4: Admin Login with Valid PIN
  console.log('\n--- TEST 4: Admin Login Success ---');
  const goodLogin = await request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ pin: 'TalkLab#Admin2026' })
  });
  assert(goodLogin.status === 200, 'Correct PIN accepted with 200');
  assert(goodLogin.data.success === true, 'Login response success is true');
  assert(goodLogin.data.user.role === 'admin', 'Assigned role is admin');
  const adminCookie = goodLogin.cookieHeader;
  assert(adminCookie && adminCookie.includes('talklab_session='), 'talklab_session cookie issued');
  assert(adminCookie.toLowerCase().includes('httponly'), 'Cookie is HttpOnly');
  assert(adminCookie.toLowerCase().includes('samesite=strict'), 'Cookie is SameSite=Strict');

  // Extract clean cookie string for subsequent requests
  const adminCookieStr = adminCookie.split(';')[0];

  // TEST 5: Verify /api/auth/me with Admin Session
  console.log('\n--- TEST 5: Profile Hydration with Admin Session ---');
  const meAdmin = await request('/api/auth/me', {
    headers: { Cookie: adminCookieStr }
  });
  assert(meAdmin.status === 200, 'GET /api/auth/me returns 200 with admin cookie');
  assert(meAdmin.data.authenticated === true, 'Admin session authenticated');
  assert(meAdmin.data.user.role === 'admin', 'Role in /me matches admin');

  // TEST 6: OTP Request with Invalid Phone
  console.log('\n--- TEST 6: Member OTP Invalid Libyan Format ---');
  const badOtpReq = await request('/api/auth/otp-request', {
    method: 'POST',
    body: JSON.stringify({ phone: '12345' })
  });
  assert(badOtpReq.status === 400, 'Invalid phone format rejected with 400');

  // TEST 7: OTP Request with Valid Libyan Phone
  console.log('\n--- TEST 7: Member OTP Request Success ---');
  const goodOtpReq = await request('/api/auth/otp-request', {
    method: 'POST',
    body: JSON.stringify({ phone: '0912345678', name: 'Omar Tripoli', seatNumber: 12, sessionName: 'Saturday Immersion Lab' })
  });
  assert(goodOtpReq.status === 200, 'Valid Libyan phone OTP requested successfully');
  assert(goodOtpReq.data.success === true, 'OTP request success is true');
  assert(goodOtpReq.data.formattedPhone === '+218 91 234 5678', 'Phone correctly formatted to Libyan standard');
  const testOtpCode = goodOtpReq.data.devOtpHint;
  assert(typeof testOtpCode === 'string' && testOtpCode.length === 6, 'Dev OTP code captured for verification test');

  // TEST 8: OTP Verify with Invalid Code
  console.log('\n--- TEST 8: Member OTP Verify Failure ---');
  const badVerify = await request('/api/auth/otp-verify', {
    method: 'POST',
    body: JSON.stringify({ phone: '0912345678', otp: '000000' })
  });
  assert(badVerify.status === 401, 'Invalid OTP code rejected with 401');

  // TEST 9: OTP Verify with Valid Code
  console.log('\n--- TEST 9: Member OTP Verify Success ---');
  const goodVerify = await request('/api/auth/otp-verify', {
    method: 'POST',
    body: JSON.stringify({ phone: '0912345678', otp: testOtpCode })
  });
  assert(goodVerify.status === 200, 'Valid OTP verified with 200');
  assert(goodVerify.data.success === true, 'Verification success is true');
  assert(goodVerify.data.user.role === 'member', 'User role is member');
  assert(goodVerify.data.user.seatNumber === 12, 'Assigned seat metadata retained');
  const memberCookie = goodVerify.cookieHeader;
  assert(memberCookie && memberCookie.includes('talklab_session='), 'Member session cookie issued');

  const memberCookieStr = memberCookie.split(';')[0];

  // TEST 10: Replay Attack Defense (Same OTP cannot be reused)
  console.log('\n--- TEST 10: OTP Replay Attack Prevention ---');
  const replayVerify = await request('/api/auth/otp-verify', {
    method: 'POST',
    body: JSON.stringify({ phone: '0912345678', otp: testOtpCode })
  });
  assert(replayVerify.status === 401, 'Replay attack blocked (OTP atomically consumed)');

  // TEST 11: Member Role Accessing Admin Route (RBAC Role Mismatch)
  console.log('\n--- TEST 11: Member Accessing Admin Endpoint (RBAC 403) ---');
  const forbiddenAdminAccess = await request('/api/admin/seats/check-in', {
    method: 'POST',
    headers: { Cookie: memberCookieStr, Origin: 'http://localhost:3000' },
    body: JSON.stringify({ session: 'saturday', seatNumber: 1 })
  });
  assert(forbiddenAdminAccess.status === 403, 'Member rejected from admin route with 403 Forbidden');
  assert(forbiddenAdminAccess.data.code === 'ROLE_MISMATCH', 'Error code is ROLE_MISMATCH');

  // TEST 12: Logout
  console.log('\n--- TEST 12: Universal Logout ---');
  const logoutRes = await request('/api/auth/logout', {
    method: 'POST',
    headers: { Cookie: memberCookieStr }
  });
  assert(logoutRes.status === 200, 'Logout succeeds with 200');
  assert(logoutRes.cookieHeader && logoutRes.cookieHeader.includes('Max-Age=0'), 'Session cookie destroyed with Max-Age=0');

  // TEST 13: OpenWA Allowlisted Proxy Action (send-otp)
  console.log('\n--- TEST 13: OpenWA Allowlisted Action (send-otp) ---');
  const openwaOtp = await request('/api/openwa/send-otp', {
    method: 'POST',
    headers: { Origin: 'http://localhost:3000' },
    body: JSON.stringify({ phone: '0925556677', name: 'Farah Benghazi' })
  });
  assert(openwaOtp.status === 200, 'OpenWA send-otp accepted via proxy');
  assert(openwaOtp.data.success === true, 'send-otp success is true');
  assert(openwaOtp.data.formattedPhone === '+218 92 555 6677', 'Phone formatted properly');

  // TEST 14: OpenWA Disallowed Action
  console.log('\n--- TEST 14: OpenWA Disallowed Action Rejection ---');
  const openwaDisallowed = await request('/api/openwa/arbitrary-eval', {
    method: 'POST',
    headers: { Origin: 'http://localhost:3000' },
    body: JSON.stringify({})
  });
  assert(openwaDisallowed.status === 403, 'Arbitrary proxy action rejected with 403');
  assert(openwaDisallowed.data.code === 'ACTION_NOT_ALLOWED', 'Code is ACTION_NOT_ALLOWED');

  // TEST 15: OpenWA Path Traversal Rejection
  console.log('\n--- TEST 15: OpenWA Path Traversal Defense ---');
  const openwaTraversal = await request('/api/openwa/..', {
    method: 'POST',
    headers: { Origin: 'http://localhost:3000' },
    body: JSON.stringify({})
  });
  assert(openwaTraversal.status === 400 || openwaTraversal.status === 403 || openwaTraversal.status === 404, 'Path traversal request safely rejected');

  // TEST 16: Atomic Boardroom Booking
  console.log('\n--- TEST 16: Atomic Boardroom Booking ---');
  const bookRes = await request('/api/boardroom/book', {
    method: 'POST',
    body: JSON.stringify({
      session: 'saturday',
      seatNumber: 22,
      name: 'Tariq Al-Fitouri',
      phone: '0919988776'
    })
  });
  assert(bookRes.status === 200, 'Seat #22 booked atomically');
  assert(bookRes.data.success === true, 'Booking response success is true');
  assert(bookRes.data.seat.seatNumber === 22, 'Assigned seat is #22');

  // TEST 17: Race Condition / Double Booking Guard
  console.log('\n--- TEST 17: Concurrency & Double Booking Prevention ---');
  const doubleBookRes = await request('/api/boardroom/book', {
    method: 'POST',
    body: JSON.stringify({
      session: 'saturday',
      seatNumber: 22,
      name: 'Duplicate Hacker',
      phone: '0911122334'
    })
  });
  assert(doubleBookRes.status === 409, 'Double booking rejected with 409 Conflict');
  assert(doubleBookRes.data.code === 'SEAT_TAKEN', 'Error code is SEAT_TAKEN');

  // TEST 18: Admin Reset Session - Confirmation Guard
  console.log('\n--- TEST 18: Admin Session Reset - Confirmation Guard ---');
  const unconfirmedReset = await request('/api/admin/session/reset', {
    method: 'POST',
    headers: { Cookie: adminCookieStr, Origin: 'http://localhost:3000' },
    body: JSON.stringify({ session: 'saturday', confirmed: false })
  });
  assert(unconfirmedReset.status === 400, 'Unconfirmed reset rejected with 400');
  assert(unconfirmedReset.data.code === 'CONFIRMATION_REQUIRED', 'Error code is CONFIRMATION_REQUIRED');

  // TEST 19: Admin Reset Session - Confirmed Execution & Archiving
  console.log('\n--- TEST 19: Admin Session Reset - Confirmed Execution ---');
  const confirmedReset = await request('/api/admin/session/reset', {
    method: 'POST',
    headers: { Cookie: adminCookieStr, Origin: 'http://localhost:3000' },
    body: JSON.stringify({ session: 'saturday', confirmed: true })
  });
  assert(confirmedReset.status === 200, 'Confirmed reset executed with 200');
  assert(confirmedReset.data.success === true, 'Reset success is true');
  assert(Array.isArray(confirmedReset.data.archived), 'Archived rosters array returned');

  // TEST 20: Verify Boardroom State After Reset
  console.log('\n--- TEST 20: Boardroom State Verification After Reset ---');
  const stateAfterReset = await request('/api/boardroom/state');
  assert(stateAfterReset.status === 200, 'GET /api/boardroom/state returns 200');
  const satSeats = Object.keys(stateAfterReset.data.state.saturday.bookedSeats);
  assert(satSeats.length === 0, 'Saturday boardroom seats flushed back to empty (0 seats)');

  console.log(`\n========================================`);
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log(`========================================`);

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

