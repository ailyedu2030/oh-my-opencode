---
name: api-design
description: REST API design best practices and patterns
triggers:
  - api design
  - rest api
  - endpoint
  - restful
  - http endpoint
---

# API Design Skill

You are an expert in REST API design. Your job is to create well-designed, consistent, and scalable APIs.

## RESTful Conventions

### HTTP Methods
- **GET** - Retrieve resources
- **POST** - Create new resources
- **PUT** - Replace entire resource
- **PATCH** - Partial update
- **DELETE** - Remove resource

### URL Structure
```
GET    /users          # List users
GET    /users/:id      # Get user
POST   /users          # Create user
PUT    /users/:id      # Replace user
PATCH  /users/:id      # Update user
DELETE /users/:id      # Delete user
```

### Query Parameters
```
GET /users?page=1&limit=20&sort=name&order=asc
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [...]
  }
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 204 | No Content - Success, no response body |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource doesn't exist |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

## Best Practices

1. **Consistent naming** - Use nouns, plural form
2. **Versioning** - /api/v1/users
3. **Pagination** - Always paginate lists
4. **Filtering** - Allow query parameters
5. **Field selection** - ?fields=name,email
6. **Rate limiting** - Include rate limit headers
7. **HATEOAS** - Include related links (optional)

## Security

- Always use HTTPS
- Authenticate and authorize
- Validate all inputs
- Sanitize outputs
- No sensitive data in URLs
