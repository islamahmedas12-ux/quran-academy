# Test Plan - Quran Academy Platform

## 1. Test Strategy Overview

### 1.1 Quality Objectives
- **Backend Coverage**: Minimum 80% code coverage for all modules
- **Auth Module Coverage**: 90% code coverage (critical path)
- **API Reliability**: 99.9% uptime for production
- **Page Load Performance**: p95 < 1.5s on 3G connections
- **API Response Time**: p95 < 500ms for all endpoints
- **Security**: Zero critical vulnerabilities at launch

### 1.2 Testing Pyramid

```
                    ┌─────────────┐
                    │    E2E      │  5% of tests
                    │   Tests     │  Critical user flows
                   ─┴─────────────┴─────────────────
                    ┌─────────────┐
                    │ Integration │  25% of tests
                    │   Tests     │  API contracts
                   ─┴─────────────┴─────────────────
                    ┌─────────────┐
                    │ Unit Tests  │  70% of tests
                    │             │  Business logic
                   ─┴─────────────┴─────────────────
```

---

## 2. Unit Test Coverage Targets

### 2.1 Backend Coverage Requirements

| Module | Files | Coverage Target | Critical Tests |
|--------|-------|-----------------|----------------|
| **Auth Module** | auth.service.ts, auth.controller.ts | 90% | Magic link, JWT, refresh tokens |
| **Users Module** | users.service.ts, users.controller.ts | 85% | Registration, profiles |
| **Organizations** | organizations.service.ts | 85% | Org CRUD, subscription |
| **Classes Module** | class.service.ts, booking.service.ts | 80% | Booking, scheduling |
| **Courses Module** | courses.service.ts | 80% | Enrollment, progress |
| **Quran Module** | quran.service.ts, audio.service.ts | 85% | Surah loading, audio |
| **Payments Module** | stripe.service.ts | 90% | Webhooks, checkout |
| **Tenant Module** | tenant.middleware.ts | 95% | Schema isolation |

### 2.2 Frontend Coverage Requirements

| Component | Coverage Target |
|-----------|-----------------|
| Auth forms | 80% |
| Quran Reader | 85% |
| Class Booking | 80% |
| Course Player | 75% |
| Dashboard | 70% |

### 2.3 Coverage Enforcement

```json
// jest.config.json coverage thresholds
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

CI will fail if coverage drops below threshold.

---

## 3. Integration Test Scenarios

### 3.1 Auth Module

| Test ID | Scenario | Steps | Expected Result |
|--------|----------|-------|-----------------|
| INT-AUTH-001 | Magic link generation | POST /auth/magic-link | Token stored, email triggered |
| INT-AUTH-002 | Magic link redemption | Valid token → tokens | Access + refresh tokens |
| INT-AUTH-003 | Token refresh | Use refresh token | New access token |
| INT-AUTH-004 | Logout | POST /auth/logout | Refresh token invalidated |
| INT-AUTH-005 | Rate limiting | 6 requests in 15 min | 429 Too Many Requests |
| INT-AUTH-006 | Invalid token | Expired magic link | 401 Unauthorized |

### 3.2 User Module

| Test ID | Scenario | Steps | Expected Result |
|--------|----------|-------|-----------------|
| INT-USER-001 | User registration | POST /users with valid data | User created in DB |
| INT-USER-002 | Profile update | PATCH /users/me | Updated fields returned |
| INT-USER-003 | Parent-child linking | Link child to parent | Family relationship created |
| INT-USER-004 | Invitation flow | POST /users/invite | Invitation email sent |

### 3.3 Classes Module

| Test ID | Scenario | Steps | Expected Result |
|--------|----------|-------|-----------------|
| INT-CLASS-001 | View teachers | GET /teachers | List of teachers with availability |
| INT-CLASS-002 | Book class | POST /classes/book | Class scheduled, confirmation |
| INT-CLASS-003 | View upcoming | GET /classes/upcoming | List of scheduled classes |
| INT-CLASS-004 | Cancel class | DELETE /classes/:id | Class cancelled, refund triggered |
| INT-CLASS-005 | Post-class notes | POST /classes/:id/notes | Notes saved, homework attached |

### 3.4 Quran Module

| Test ID | Scenario | Steps | Expected Result |
|--------|----------|-------|-----------------|
| INT-QURAN-001 | Load surah list | GET /quran/surahs | All 114 surahs with metadata |
| INT-QURAN-002 | Load surah verses | GET /quran/surah/1 | Uthmani text, translation, transliteration |
| INT-QURAN-003 | Audio playback | GET audio stream URL | Valid audio stream |
| INT-QURAN-004 | Verse-by-verse | GET /quran/verse/1/1 | Single verse with audio |

### 3.5 Payments Module

| Test ID | Scenario | Steps | Expected Result |
|--------|----------|-------|-----------------|
| INT-PAY-001 | Create checkout | POST /payments/create-checkout | Stripe session URL |
| INT-PAY-002 | Webhook handling | Stripe checkout.completed | Subscription activated |
| INT-PAY-003 | Billing portal | GET /payments/portal | Stripe portal URL |

---

## 4. E2E Test Scenarios

### 4.1 Critical User Flows

#### Flow 1: Student Registration & First Class
```
Gherkin:
  Given I am on the homepage
  When I click "Sign In"
  And I enter "student@example.com"
  And I click "Send Magic Link"
  And I open the email and click the link
  Then I am logged in
  When I browse teachers
  And I select "Sheikh Ahmad"
  And I book a class for tomorrow at 10 AM
  Then I see confirmation "Class booked successfully"
```

#### Flow 2: Quran Reading Session
```
Gherkin:
  Given I am logged in as a student
  When I navigate to "/quran"
  Then I see the list of 114 surahs
  When I click on "Al-Fatiha"
  Then I see 7 verses with Arabic text
  And I see English translation
  When I click play on verse 1
  Then audio plays and verse is highlighted
```

#### Flow 3: Teacher Availability Update
```
Gherkin:
  Given I am logged in as a teacher
  When I navigate to "/teacher/schedule"
  Then I see my current availability
  When I click "Add Slot"
  And I select "Friday 4 PM UTC"
  Then slot appears in my calendar
```

#### Flow 4: Course Enrollment
```
Gherkin:
  Given I am logged in as a student
  When I navigate to "/courses"
  Then I see the course catalog
  When I click on "Quran Recitation Basics"
  And I click "Enroll"
  And I complete Stripe checkout
  Then I see "Enrolled" badge
  And I can access lesson 1
```

### 4.2 E2E Test Matrix

| Test | Browser | Mobile | Priority | Max Duration |
|------|---------|--------|----------|---------------|
| Student registration | Chrome, Firefox | iPhone 12 | P0 | 30s |
| Class booking flow | Chrome | iPhone 12 | P0 | 60s |
| Quran reading | Chrome | iPhone 12 | P0 | 20s |
| Course enrollment | Chrome, Safari | iPhone 12 | P1 | 45s |
| Teacher schedule | Chrome | iPhone 12 | P1 | 30s |
| Payment checkout | Chrome | iPhone 12 | P0 | 60s |

---

## 5. Performance Benchmarks

### 5.1 API Performance

| Endpoint | Load | p95 | p99 | Timeout |
|----------|------|-----|-----|---------|
| GET /auth/magic-link | 100 RPS | 200ms | 400ms | 1s |
| POST /auth/refresh | 50 RPS | 100ms | 200ms | 500ms |
| GET /quran/surah/:num | 200 RPS | 150ms | 300ms | 1s |
| GET /quran/surahs | 50 RPS | 300ms | 500ms | 2s |
| POST /classes/book | 20 RPS | 500ms | 800ms | 5s |
| POST /payments/checkout | 10 RPS | 1000ms | 2000ms | 10s |

### 5.2 Load Testing Targets

| Scenario | Concurrent Users | Duration | Threshold |
|---------|-----------------|----------|-----------|
| Class booking rush | 100 users | 5 min | p95 < 500ms |
| Quran reading (cache) | 50 users | 5 min | p95 < 200ms |
| Live class join | 20 users | 10 min | p95 < 1s |
| Peak traffic | 500 users | 15 min | Error rate < 5% |

### 5.3 Frontend Performance

| Metric | Target | Device |
|--------|--------|--------|
| LCP | < 2.5s | Mobile 3G |
| FID | < 100ms | Mobile |
| CLS | < 0.1 | Mobile |
| Page Load | < 3s | Mobile 3G |
| Time to Interactive | < 5s | Mobile 3G |

---

## 6. Security Testing Schedule

| Phase | Week | Activities |
|-------|------|------------|
| Unit Security Tests | Ongoing | Auth module unit tests, validation tests |
| Security Integration | Week 18-20 | API security tests in CI |
| OWASP Audit | Week 24 | Full OWASP Top 10 audit |
| Penetration Testing | Week 25 | External red team |
| Final Hardening | Week 26 | Fix critical issues, re-test |

---

## 7. Bug Severity Definitions

| Severity | Definition | Examples | SLA |
|----------|-------------|-----------|-----|
| **P0 Critical** | System down, data loss, security breach | Cannot login, payments broken, DB breach | 2 hours |
| **P1 High** | Major feature broken, workarounds difficult | Class booking fails, Quran audio broken | 4 hours |
| **P2 Medium** | Feature degraded, workaround exists | Slow page load, minor UI glitch | 24 hours |
| **P3 Low** | Minor issue, cosmetic | Typo, spacing issue | 1 week |
| **P4 Wishlist** | Enhancement, not a bug | UI improvement, new feature | Next sprint |

### Bug Severity Guidelines

**P0 Critical:**
- Authentication completely broken
- Payment processing failure
- Data corruption or loss
- Security vulnerability (SQL injection, XSS)
- Private data exposure

**P1 High:**
- Core feature (booking, Quran reading) non-functional
- Video/audio playback broken
- Major data inconsistency
- API returns 500 for valid requests

**P2 Medium:**
- Feature partially works
- Performance below threshold but functional
- UI renders incorrectly on some screens
- Non-critical API returns wrong data

**P3 Low:**
- Non-blocking UI issue
- Minor text/copy error
- Inconsistent styling
- Minor accessibility issue

---

## 8. Test Environment Strategy

### 8.1 Environment Matrix

| Environment | Purpose | Data | Reset |
|------------|---------|------|-------|
| local | Development | Mock data | Manual |
| dev | Integration testing | Sanitized prod copy | Weekly |
| staging | Pre-production | Sanitized prod copy | Daily |
| production | Live users | Real data | Never |

### 8.2 Test Data Management

- **Unit tests**: Mock data, no external dependencies
- **Integration tests**: Docker containers with test DB
- **E2E tests**: Dedicated test organization with synthetic data
- **Performance tests**: Scaled-down production data

---

## 9. Test Automation Strategy

### 9.1 CI/CD Pipeline Integration

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   PR Open   │────▶│  Lint &     │────▶│   Unit      │────▶│  Coverage   │
│             │     │  Typecheck  │     │   Tests     │     │  Check      │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                    │
                   ┌─────────────┐     ┌─────────────┐              │
                   │  E2E Tests  │◀────│  Deploy to  │◀─────────────┘
                   │  (chromium) │     │  Preview   │
                   └─────────────┘     └─────────────┘
```

### 9.2 Test Execution Policy

| Trigger | Tests Run | Timeout |
|---------|-----------|---------|
| Every PR | Unit + Coverage | 10 min |
| Merge to dev | Unit + Integration | 15 min |
| Merge to qa | Unit + Integration + E2E | 30 min |
| Nightly | Full suite + Performance | 2 hours |

---

## 10. Reporting

### 10.1 Quality Dashboard

Metrics tracked weekly:
- Code coverage trend (per module)
- Test pass rate
- Bug count by severity
- Mean time to resolution (MTTR)
- Security vulnerabilities found/fixed

### 10.2 Test Summary Report (Bi-weekly)

```
Test Summary - Week 24
======================
Total Tests: 847
Passed: 842 (99.4%)
Failed: 5 (0.6%)
Coverage: 82% (target: 80%)
New Bugs: 3 (2 P2, 1 P3)
Fixed Bugs: 7

Critical Path: PASS
Security Scan: PASS (no vulnerabilities)
Performance: PASS (p95 < 500ms)

Recommendation: Ready for staging deployment
```
