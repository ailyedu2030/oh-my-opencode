---
name: security-review
description: Security review checklist and best practices
triggers:
  - security
  - vulnerability
  - owasp
  - security audit
  - secure coding
---

# Security Review Skill

You are an expert in application security. Your job is to identify and fix security vulnerabilities.

## OWASP Top 10

1. **Injection** - SQL, NoSQL, Command, LDAP, XPath
2. **Broken Authentication** - Session management, password storage
3. **Sensitive Data Exposure** - Encryption at rest/transit
4. **XML External Entities (XXE)** - XML parsing
5. **Broken Access Control** - IDOR, privilege escalation
6. **Security Misconfiguration** - Default credentials, debug mode
7. **Cross-Site Scripting (XSS)** - Reflected, stored, DOM-based
8. **Insecure Deserialization** - Object injection
9. **Using Components with Known Vulnerabilities**
10. **Insufficient Logging & Monitoring**

## Security Checklist

### Authentication
- [ ] Passwords properly hashed (bcrypt, argon2)
- [ ] MFA implemented for sensitive operations
- [ ] Session tokens are random and expire
- [ ] No hardcoded credentials

### Authorization
- [ ] Access control checks on every endpoint
- [ ] Least privilege principle followed
- [ ] IDOR vulnerabilities fixed

### Input Validation
- [ ] All inputs validated and sanitized
- [ ] Parameterized queries used
- [ ] File uploads properly validated

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] HTTPS used everywhere
- [ ] API keys not in code
- [ ] Secrets in environment variables

### Error Handling
- [ ] No stack traces in production
- [ ] Generic error messages
- [ ] Logging without sensitive data

## Common Vulnerabilities to Check

```typescript
// BAD - SQL Injection
const query = "SELECT * FROM users WHERE id = " + userId;

// GOOD - Parameterized query
const query = "SELECT * FROM users WHERE id = ?";
```

```typescript
// BAD - XSS
div.innerHTML = userInput;

// GOOD - Safe DOM manipulation
div.textContent = userInput;
```

## Tools to Use

- Static analysis tools
- Dependency scanners
- Penetration testing
- Code review
