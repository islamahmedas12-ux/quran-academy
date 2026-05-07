# Security Testing Checklist

## Overview
This document outlines the security testing requirements for the Quran Academy platform, following OWASP Top 10 and industry best practices.

---

## OWASP Top 10 Verification

### A1: Broken Access Control
- [ ] Verify role-based access control for all endpoints
- [ ] Test that students cannot access teacher-only endpoints
- [ ] Test that users cannot access other organizations' data
- [ ] Verify JWT token validation on all protected routes
- [ ] Test that expired tokens are rejected
- [ ] Verify tenant isolation across all data operations

### A2: Cryptographic Failures
- [ ] Verify all passwords stored with bcrypt (cost factor 12+)
- [ ] Verify JWT secrets are environment variables (min 256-bit)
- [ ] Verify refresh tokens are cryptographically random
- [ ] Verify magic link tokens are cryptographically random (min 32 bytes)
- [ ] Verify sensitive data not logged or exposed in responses

### A3: Injection
- [ ] Test SQL injection on all user inputs (POST /auth/magic-link, forms)
- [ ] Test for OR 1=1 patterns in all query parameters
- [ ] Test for UNION SELECT patterns
- [ ] Test NoSQL injection for Redis operations
- [ ] Verify parameterized queries used for all database operations
- [ ] Test XSS in Quran text display (Arabic/Unicode characters)

### A4: Insecure Design
- [ ] Verify rate limiting on authentication endpoints
- [ ] Test account lockout after failed attempts
- [ ] Verify magic link expiration (15 minutes)
- [ ] Test session timeout behavior
- [ ] Verify organization subscription limits enforced

### A5: Security Misconfiguration
- [ ] Verify CORS whitelist only trusted origins
- [ ] Verify no default credentials in Docker images
- [ ] Verify security headers set (X-Frame-Options, CSP, etc.)
- [ ] Verify DEBUG mode disabled in production
- [ ] Verify stack traces not exposed in API responses

### A6: Vulnerable Components
- [ ] Verify all npm packages up-to-date
- [ ] Verify no known CVEs in dependencies
- [ ] Verify NestJS version stable
- [ ] Verify TypeScript strict mode enabled
- [ ] Verify no deprecated APIs used

### A7: Authentication Failures
- [ ] Test magic link replay attack prevention
- [ ] Test refresh token rotation
- [ ] Verify refresh token stored in Redis with TTL
- [ ] Test logout invalidates refresh tokens
- [ ] Verify JWT tokens signed with correct algorithm (HS256)
- [ ] Test concurrent session handling

### A8: Software and Data Integrity
- [ ] Verify npm integrity checking enabled
- [ ] Verify CI/CD pipeline includes security scanning
- [ ] Verify Docker images from trusted bases
- [ ] Verify webhook signatures validated (Stripe)

### A9: Logging and Monitoring
- [ ] Verify all authentication events logged
- [ ] Verify failed login attempts logged
- [ ] Verify data access logged
- [ ] Verify admin actions logged
- [ ] Verify log format includes correlation IDs

### A10: SSRF Risks
- [ ] Verify MinIO URLs validated (no internal IPs)
- [ ] Verify Jitsi room URLs validated
- [ ] Test for internal IP disclosure in responses

---

## SQL Injection Test Cases

| Endpoint | Test Payload | Expected Result |
|----------|-------------|-----------------|
| POST /auth/magic-link | `email=test' OR '1'='1` | 400 Bad Request |
| POST /classes/book | `teacherId='; DROP TABLE--` | 400 Bad Request |
| GET /quran/surah/:num | `surahNumber=1 OR 1=1` | Data not leaked |
| GET /users/me | `organizationId=1 UNION SELECT *` | 403 Forbidden |

### Test Procedure
```bash
# Manual SQL Injection Testing
curl -X POST http://localhost:4000/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test'\'' OR '\''1'\''='\''1","organizationId":"org-1"}'

# Expected: 400 or validation error, not 500 or data leak
```

---

## XSS Test Cases

### Stored XSS (Quran Content)
| Input | Location | Expected Result |
|-------|----------|-----------------|
| `<script>alert(1)</script>` | Surah name display | Escaped or rejected |
| `<img src=x onerror=alert(1)>` | Verse text | Escaped or rejected |
| `"><script>document.location</script>` | Search input | Escaped or rejected |

### Reflected XSS
| Input | Location | Expected Result |
|-------|----------|-----------------|
| `/quran/search?q=<script>` | URL parameter | Escaped or 400 |
| `/users/invite?email=<script>` | Email validation | Escaped or rejected |

### Test Procedure
```javascript
// In browser console on /quran page
document.querySelector('[data-testid="surah-item"]').innerHTML = '<img src=x onerror=alert(1)>';

// Expected: Script should not execute, text should be escaped
```

---

## CSRF Protection Verification

| Endpoint | Method | CSRF Token Required |
|----------|--------|---------------------|
| POST /classes/book | POST | Yes (Bearer token) |
| POST /auth/logout | POST | Yes (Bearer token) |
| PATCH /users/me | PATCH | Yes (Bearer token) |
| POST /payments/create-checkout | POST | Yes (Stripe session) |

### Verification Steps
1. Attempt POST without Authorization header
2. Verify 401 Unauthorized returned
3. Verify cookie-based sessions require CSRF token
4. Verify CORS preflight validates origin

---

## Rate Limiting Verification

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /auth/magic-link | 5 | 15 minutes |
| POST /auth/refresh | 10 | 15 minutes |
| GET /quran/* | 100 | 1 minute |
| POST /classes/book | 20 | 1 hour |

### Test Procedure
```bash
# Send 6 magic link requests
for i in {1..6}; do
  curl -X POST http://localhost:4000/auth/magic-link \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test${i}@example.com\",\"organizationId\":\"org-1\"}"
done

# Expected: 6th request returns 429 Too Many Requests
```

---

## JWT Expiration Verification

| Token Type | Expiration | Refresh Window |
|------------|------------|----------------|
| Access Token | 15 minutes | N/A |
| Refresh Token | 7 days | 7 days before expiry |

### Test Cases
1. **Expired Access Token**
   - Use token with `exp` in past
   - Expected: 401 Unauthorized with "Token expired"

2. **Expired Refresh Token**
   - Use refresh token with `exp` in past
   - Expected: 401 Unauthorized with "Refresh token expired"

3. **Token Refresh Flow**
   - Use valid refresh token to obtain new access token
   - Expected: New access token returned

4. **Logout Invalidates Token**
   - Call POST /auth/logout with refresh token
   - Use same refresh token again
   - Expected: 401 Unauthorized "Token invalidated"

---

## CORS Configuration Check

### Allowed Origins
- Production: `https://quranacademy.com`
- Staging: `https://staging.quranacademy.com`
- Development: `http://localhost:3000`

### Verification
```bash
# Preflight request
curl -X OPTIONS http://localhost:4000/ \
  -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization"

# Expected headers:
# Access-Control-Allow-Origin: https://quranacademy.com (or null)
# Access-Control-Allow-Credentials: true
# NOT: Access-Control-Allow-Origin: *
```

---

## Additional Security Checks

### Password Policy (Admin)
- [ ] Minimum 8 characters for admin-created passwords
- [ ] No common passwords (password, 12345678)
- [ ] Password not same as email

### File Upload Security
- [ ] Max file size enforced (10MB for recordings)
- [ ] File type validation (video/mp4, audio/mpeg, application/pdf)
- [ ] Files stored in MinIO with signed URLs (15 min expiry)
- [ ] No executable permissions on uploaded files

### API Security Headers
```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

---

## Test Execution Schedule

| Phase | Timing | Scope |
|-------|--------|-------|
| Unit Security Tests | Every PR | Auth module, validation |
| Integration Security | Every sprint | Full auth flow, API endpoints |
| Full Security Audit | Pre-launch (Week 24) | All OWASP Top 10 |
| Penetration Testing | Pre-launch (Week 25) | External red team |

---

## Reporting Security Issues

**Critical vulnerabilities**: Block deployment, fix immediately
**High vulnerabilities**: Fix within 24 hours
**Medium vulnerabilities**: Fix within 1 week
**Low vulnerabilities**: Fix in next sprint

Report to: security@quranacademy.com
Bug Bounty: See HackerOne program (launch day)
