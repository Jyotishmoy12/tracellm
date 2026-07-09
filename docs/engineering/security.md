# Security Model

TraceLLM has two auth surfaces.

## Browser Auth

Users log in with email and password.

Passwords are hashed with Argon2id.

The server returns a JWT in an HttpOnly cookie.

Current local MVP behavior:

- JWT algorithm: RS256
- cookie: HttpOnly
- default TTL: 7 days
- development secure cookie flag: off

Important production hardening:

- load RSA keys from secrets instead of generating in memory
- enable secure cookies behind HTTPS
- add CSRF protection for cookie-authenticated writes
- add password reset and email verification
- add rate limiting for auth endpoints

## SDK Auth

SDKs use project API keys.

API key behavior:

- full key shown once
- server stores only a hash
- key prefix shown in UI
- key can be revoked

Important production hardening:

- key scopes
- key rotation reminders
- rate limits per key
- audit logs
- organization and project roles

## Content Capture

Prompt and output capture are off by default.

This is important because LLM content can contain:

- personal data
- secrets
- customer data
- internal business data

Use project config to enable content capture intentionally.

## Redaction

Current redaction supports:

- email-like strings
- API-key-like strings

Redaction is not a substitute for careful instrumentation. Avoid putting secrets in metadata or span names.
