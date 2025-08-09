## Waspceptor Roadmap to Beeceptor Parity

This roadmap outlines the features required to reach (at least) feature parity with Beeceptor. Use the checkboxes to track progress as features are implemented.

Legend: [ ] not started, [~] in progress, [x] done

---

## Milestones

- [x] M1: Minimal real HTTP server + UI integration
- [ ] M2: Rules-based matching and mock responses
- [ ] M3: Request inbox, filtering, export, and replay
- [ ] M4: Proxy/forwarding (passthrough) with recording
- [ ] M5: Advanced response features (templating, variants, files)
- [ ] M6: Security, rate limiting, and access control
- [ ] M7: Teams/sharing and developer tooling (Postman/OpenAPI)
- [ ] M8: Persistence, retention, and deployment hardening

---

## Core Platform
- [ ] Backend HTTP server to receive external requests
  - [ ] Handles all methods (GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD)
  - [ ] Single listener for dynamic endpoints
  - [ ] Robust body parsing (JSON, text, form-urlencoded, multipart)
- [ ] Persistence layer
  - [ ] SQLite (local dev) with an ORM (e.g., Prisma)
  - [ ] Schema: endpoints, rules, logs, variants, environments
  - [ ] Migrations and seed
- [ ] UI <-> backend API
  - [ ] Replace localStorage with REST API
  - [ ] Auth-less local dev; later, per-user auth
- [ ] Environment-aware configuration (dev/prod)

## Endpoint Management
- [ ] Create, edit, delete endpoints
- [ ] Endpoint path management
  - [ ] Exact paths (e.g., /users)
  - [ ] Wildcards and path params (e.g., /users/:id, /v1/*)
  - [ ] Regex path matching
- [ ] Methods per endpoint (single or multiple)
- [ ] Default response per endpoint (fallback when no rules match)
- [ ] Enable/disable endpoint
- [ ] Import/export endpoints (JSON)
- [ ] Clone/duplicate endpoint

## Rules Engine (Matching)
- [ ] Rule builder UI with ordering and "stop at first match"
- [ ] Conditions
  - [ ] Method is / is not
  - [ ] Path equals / startsWith / endsWith / contains / regex
  - [ ] Header equals / contains / regex
  - [ ] Query param equals / contains / regex
  - [ ] Body JSONPath equals / contains (JSON)
  - [ ] Body XPath or regex (XML/HTML/text)
  - [ ] Size limits (body size, header size)
  - [ ] IP-based condition (optional)
- [ ] Rule groups (AND/OR)

## Rules Engine (Actions)
- [ ] Respond with status code
- [ ] Respond with headers
- [ ] Respond with body (JSON, text, XML, HTML)
- [ ] Content-Type inference + override
- [ ] Delay/latency injection
- [ ] Throttling / bandwidth simulation
- [ ] Failure modes
  - [ ] Return 4xx/5xx
  - [ ] Drop/close connection (optional)
  - [ ] Timeout
- [ ] Rate limiting (per endpoint / per IP)
- [ ] CORS handling (preflight + allowed origins/methods/headers)

## Response Features
- [ ] Response variants
  - [ ] Multiple predefined responses per rule
  - [ ] Weighted random selection
  - [ ] Sticky selection by client key (optional)
- [ ] Dynamic templating (e.g., Handlebars or Eta)
  - [ ] Inject request data (method, path, params, query, headers, body)
  - [ ] Random data helpers (uuid, dates, names, numbers)
  - [ ] Environment variables
- [ ] File responses
  - [ ] Return static files (binary)
  - [ ] File download with Content-Disposition
- [ ] Structured editors
  - [ ] JSON editor with validation/formatting
  - [ ] XML/HTML beautifier (optional)

## Proxy / Forwarding
- [ ] Forward unmatched requests to upstream target (passthrough mode)
- [ ] Path rewrite rules
- [ ] Header rewrite (preserve/remove/add)
- [ ] Query param rewrite
- [ ] Timeouts, retries, and backoff
- [ ] HTTPS upstream with custom CA (optional)
- [ ] Record mode: capture upstream responses as mocks
  - [ ] One-click "save as rule" from captured response

## Request Inbox & Logs
- [ ] Live request capture and storage
- [ ] Inspect request details
  - [ ] Method, URL, path params, query params
  - [ ] Request/response headers
  - [ ] Request/response body (pretty print for JSON/XML)
  - [ ] Status, size, and timings (TTFB, total)
  - [ ] Client IP, user-agent
- [ ] Search & filter
  - [ ] Filter by time range
  - [ ] Filter by method, status, path, endpoint
  - [ ] Full-text search in headers/body
- [ ] Pagination and retention policy
  - [ ] Configurable retention window (days/count)
  - [ ] Manual purge
- [ ] Export logs
  - [ ] JSON/NDJSON
  - [ ] CSV
  - [ ] HAR (optional)
- [ ] Replay requests (from the UI)
  - [ ] Edit and resend
  - [ ] Save as cURL / Postman snippet

## Security & Access Control
- [ ] Private endpoints (unguessable IDs / tokens)
- [ ] Optional access token enforcement (Bearer/Basic)
- [ ] IP allowlist / blocklist (per endpoint)
- [ ] Log redaction rules (mask secrets/PII in storage and UI)
- [ ] HTTPS support (dev: self-signed; prod: TLS termination)
- [ ] CSRF-safe admin APIs

## Developer Experience
- [ ] Postman collection export (per endpoint / workspace)
- [ ] cURL snippets per rule/endpoint
- [ ] OpenAPI import to generate mocks
- [ ] OpenAPI export (optional)
- [ ] Example generators (quick mock templates)

## UI/UX
- [ ] Endpoint list with search and filters
- [ ] Rule builder with reordering and enable/disable
- [ ] Response editor with tabs (body, headers, preview)
- [ ] Request inbox with detail panel
- [ ] Copy-to-clipboard for URLs, headers, bodies
- [ ] Dark mode (optional)
- [ ] Keyboard shortcuts (optional)

## Teams, Sharing, and Collaboration (later)
- [ ] Shareable read-only request inbox links
- [ ] Invite teammates, roles (viewer/editor/admin)
- [ ] Ownership and access control per endpoint/workspace

## Observability & Operations
- [ ] Structured logging (server-side)
- [ ] Health checks and readiness probes
- [ ] Metrics (req/sec, p95 latency) and dashboards (optional)
- [ ] Error tracking

## Deployment
- [ ] Dev: single proc (frontend + backend), hot reload
- [ ] Prod: containerized deployment
  - [ ] Dockerfile and docker-compose
  - [ ] Env config (PORT, DATABASE_URL, RATE_LIMITS, etc.)
- [ ] Backup/restore for database

---

## Notes on Beeceptor Parity
This list targets the core Beeceptor use-cases:
- Inspect and debug incoming HTTP requests via custom endpoints
- Create rules to return mock responses with conditions
- Simulate latency, failures, and throttle
- Proxy to real backends and record responses to build mocks
- Search, filter, export, and replay traffic
- Secure endpoints and control access

If you spot a Beeceptor feature missing here, add it under the appropriate section and check it into the backlog. 