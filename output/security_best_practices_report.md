# Security Best Practices Report (Backend)

## Executive summary
Backend scope is a single Express app deployed as a Firebase HTTPS function (`functions/index.js`). The code is compact and uses Clerk token verification correctly, but it is missing several baseline Express hardening controls (security headers, error/404 handlers, and rate limiting), and it risks permissive CORS if `ALLOWED_ORIGINS` is not set. No critical issues found; however, the current posture is below the recommended Express production baseline and should be tightened before exposure.

## Scope
- Backend runtime: Node.js (Cloud Functions)
- Framework: Express 4.19.x
- Entry point: `functions/index.js`

## Findings

### Medium severity

**[MED-001] EXPRESS-CORS-001 — CORS allowlist can become permissive when `ALLOWED_ORIGINS` is empty**
- **Location:** `functions/index.js:15-39`
- **Evidence:**
  ```js
  const allowed = getAllowedOrigins();
  if (!origin || allowed.length === 0 || allowed.includes(origin)) {
    cb(null, true);
    return;
  }
  ```
- **Impact:** If the secret `ALLOWED_ORIGINS` is missing/misconfigured, `allowed.length === 0` allows any origin while `credentials: true` is enabled, exposing the token exchange endpoint to cross-origin abuse.
- **Fix:** Fail closed when the allowlist is empty (deny all origins), and require explicit allowlisted origins in production. Consider environment-based behavior for local dev only.
- **Mitigation:** Enforce CORS at the gateway (Cloud Armor / API Gateway) if app-level allowlist cannot be guaranteed.
- **False positive notes:** If `ALLOWED_ORIGINS` is always configured in deployment and the environment is locked down, risk is reduced but still fragile.

**[MED-002] EXPRESS-HEADERS-001 — Missing baseline security headers**
- **Location:** `functions/index.js` (no `helmet()` or custom security headers)
- **Evidence:** No `helmet()` usage or explicit security header middleware is present before routes are registered.
- **Impact:** Clients do not receive baseline headers (e.g., `X-Content-Type-Options`, clickjacking protection). This increases exposure to browser-based attacks in mixed or future rendering contexts.
- **Fix:** Add `helmet()` early in middleware order and disable `x-powered-by`.
- **Mitigation:** If headers are enforced at a proxy/CDN, document and verify those settings.
- **False positive notes:** If the platform injects headers globally, verify actual response headers from the deployed endpoint.

**[MED-003] EXPRESS-AUTH-001 — No brute-force/rate limiting on auth endpoint**
- **Location:** `functions/index.js:47-96` (`POST /firebase/token`)
- **Evidence:** The route handles credentialed token exchange with no rate limiting or throttling middleware.
- **Impact:** Attackers can attempt high-rate token submissions, increasing risk of abuse and elevated costs.
- **Fix:** Add rate limiting (e.g., `express-rate-limit`) or enforce limits at the edge (Cloud Armor / API Gateway). Consider IP + user-based throttling.
- **Mitigation:** WAF/API gateway rate limits can provide a strong alternative.
- **False positive notes:** If a gateway already enforces strict throttles, document it and consider removing in-app duplication.

### Low severity

**[LOW-001] EXPRESS-FINGERPRINT-001 — Default Express fingerprinting and no custom 404/error handlers**
- **Location:** `functions/index.js` (no `app.disable('x-powered-by')` and no 404/error handlers)
- **Evidence:** No custom 404 handler (`app.use((req, res) => ...)`) or error handler (`app.use((err, req, res, next) => ...)`) is defined.
- **Impact:** Default Express responses can leak framework details and stack traces in some environments.
- **Fix:** Disable `x-powered-by` and add explicit 404 + error handlers that return generic messages.
- **Mitigation:** Ensure `NODE_ENV=production` and platform-level error masking.
- **False positive notes:** If the platform already strips headers and error bodies, the risk is reduced but still a defense-in-depth gap.

## Notes
- Request body limits are already configured (`express.json({ limit: "100kb" })`), which aligns with baseline guidance.
- No sensitive secrets are hardcoded.

