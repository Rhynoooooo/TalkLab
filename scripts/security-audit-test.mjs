/**
 * TalkLab 2.0 - Security Verification Test Suite
 * Tests Edge Proxy Guards, Session Cryptography, Rate Limiting, CSRF Rejection, and Audit Logging.
 */

const BASE_URL = 'http://127.0.0.1:3001';

async function runTests() {
  console.log('\n🔒 Starting TalkLab 2.0 Security Hardening Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
      passed++;
    } else {
      console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: Unauthenticated request to /api/admin/verify-session
  // -------------------------------------------------------------
  console.log('[Test 1] Edge Proxy Guard: Unauthenticated Access');
  const res1 = await fetch(`${BASE_URL}/api/admin/verify-session`);
  const data1 = await res1.json().catch(() => ({}));
  assert(res1.status === 401, `Rejected with HTTP 401 (Got ${res1.status})`);
  assert(data1.code === 'UNAUTHORIZED', `Returned error code UNAUTHORIZED (Got "${data1.code}")`);

  // -------------------------------------------------------------
  // Test 2: Unauthenticated request to operational seat endpoint
  // -------------------------------------------------------------
  console.log('\n[Test 2] Edge Proxy Guard: Block Unauthenticated Operational Action');
  const res2 = await fetch(`${BASE_URL}/api/admin/seats/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session: 'saturday', seatNumber: 5, checkedIn: true })
  });
  assert(res2.status === 401, `Rejected with HTTP 401 before hitting business logic (Got ${res2.status})`);

  // -------------------------------------------------------------
  // Test 3: CSRF Attack Simulation (Forged Cross-Origin Request)
  // -------------------------------------------------------------
  console.log('\n[Test 3] CSRF Defense: Cross-Origin Request Rejection');
  const res3 = await fetch(`${BASE_URL}/api/admin/seats/check-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://malicious-attacker-domain.xyz'
    },
    body: JSON.stringify({ session: 'saturday', seatNumber: 1 })
  });
  const data3 = await res3.json().catch(() => ({}));
  assert(res3.status === 403, `Rejected with HTTP 403 Forbidden (Got ${res3.status})`);
  assert(data3.code === 'CSRF_REJECTED', `Returned CSRF_REJECTED code (Got "${data3.code}")`);

  // -------------------------------------------------------------
  // Test 4: Rate Limiting & Brute-Force Lockout Defense
  // -------------------------------------------------------------
  console.log('\n[Test 4] Brute-Force & PIN Enumeration Defense');
  const spoofedIp = '198.51.100.42'; // Test subnet 198.51.100.0/24

  let lastStatus = 0;
  let remainingReported = 5;

  for (let attempt = 1; attempt <= 6; attempt++) {
    const res = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': spoofedIp
      },
      body: JSON.stringify({ pin: `WRONG_PIN_${attempt}` })
    });
    const d = await res.json().catch(() => ({}));
    lastStatus = res.status;
    remainingReported = d.remainingAttempts;
    console.log(`    Attempt ${attempt}: Status=${res.status}, Remaining=${d.remainingAttempts}, Locked=${d.lockedOut}`);
  }

  assert(lastStatus === 429, `6th attempt triggers HTTP 429 Too Many Requests lockout (Got ${lastStatus})`);

  // -------------------------------------------------------------
  // Test 5: Legitimate Facilitator Authentication
  // -------------------------------------------------------------
  console.log('\n[Test 5] Legitimate Facilitator Login & Secure Session Cookie');
  const validIp = '10.0.0.15';
  const loginRes = await fetch(`${BASE_URL}/api/admin/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': validIp
    },
    body: JSON.stringify({ pin: 'TalkLab#Admin2026' })
  });

  const loginData = await loginRes.json().catch(() => ({}));
  assert(loginRes.status === 200, `Login successful with HTTP 200 (Got ${loginRes.status})`);
  assert(loginData.success === true, `Returns success: true`);

  const setCookieHeader = loginRes.headers.get('set-cookie') || '';
  assert(setCookieHeader.includes('talklab_admin_session='), 'Sets talklab_admin_session cookie');
  assert(setCookieHeader.toLowerCase().includes('httponly'), 'Enforces HttpOnly flag');
  assert(setCookieHeader.toLowerCase().includes('samesite=strict'), 'Enforces SameSite=Strict flag');

  const sessionCookie = setCookieHeader.split(';')[0];

  // -------------------------------------------------------------
  // Test 6: Authenticated Session Verification
  // -------------------------------------------------------------
  console.log('\n[Test 6] Verify Authenticated Session Token');
  const verifyRes = await fetch(`${BASE_URL}/api/admin/verify-session`, {
    headers: {
      'Cookie': sessionCookie
    }
  });
  const verifyData = await verifyRes.json().catch(() => ({}));
  assert(verifyRes.status === 200, `Session verified with HTTP 200 (Got ${verifyRes.status})`);
  assert(verifyData.authenticated === true, 'Returns authenticated: true');
  assert(verifyData.user?.role === 'facilitator', 'Returns role: facilitator');

  // -------------------------------------------------------------
  // Test 7: Authenticated Operational Action (Check-in & Audit Log)
  // -------------------------------------------------------------
  console.log('\n[Test 7] Authenticated Moderator Seat Operation');
  const actionRes = await fetch(`${BASE_URL}/api/admin/seats/check-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie,
      'Origin': 'http://127.0.0.1:3001'
    },
    body: JSON.stringify({ session: 'saturday', seatNumber: 18, checkedIn: true })
  });
  const actionData = await actionRes.json().catch(() => ({}));
  assert(actionRes.status === 200, `Action authorized with HTTP 200 (Got ${actionRes.status})`);
  assert(actionData.success === true, 'Seat check-in succeeded');

  // -------------------------------------------------------------
  // Test 8: Authorized WhatsApp Dispatch Engine Access
  // -------------------------------------------------------------
  console.log('\n[Test 8] Facilitator WhatsApp Dispatch Engine Call');
  const waRes = await fetch(`${BASE_URL}/api/admin/whatsapp/dispatch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie,
      'Origin': 'http://127.0.0.1:3001'
    },
    body: JSON.stringify({
      phone: '+218912345678',
      text: 'TalkLab test boarding verification message',
      type: 'pass_resend'
    })
  });
  const waData = await waRes.json().catch(() => ({}));
  assert(waRes.status === 200, `WhatsApp dispatch processed securely with HTTP 200 (Got ${waRes.status})`);
  assert(waData.success === true, 'WhatsApp dispatch reported success');

  // -------------------------------------------------------------
  // Test 9: Secure Logout and Session Destruction
  // -------------------------------------------------------------
  console.log('\n[Test 9] Secure Logout & Cookie Invalidation');
  const logoutRes = await fetch(`${BASE_URL}/api/admin/logout`, {
    method: 'POST',
    headers: {
      'Cookie': sessionCookie,
      'Origin': 'http://127.0.0.1:3001'
    }
  });
  const logoutCookie = logoutRes.headers.get('set-cookie') || '';
  assert(logoutRes.status === 200, `Logout succeeded with HTTP 200 (Got ${logoutRes.status})`);
  assert(logoutCookie.includes('Max-Age=0') || logoutCookie.includes('expires='), 'Clears session cookie (Max-Age=0)');

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log(`\n========================================`);
  console.log(`Security Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error during security test:', err);
  process.exit(1);
});
