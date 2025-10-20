---
trigger: manual
---

# Security Rules

- Never expose environment variables or secrets.
- Always validate and sanitize user input.
- Avoid using unsafe functions like `eval`, `exec`, or raw database queries.
- Encrypt sensitive data when applicable.
- Enforce role-based access and HTTPS where possible.
- Do not log sensitive or personal information.
