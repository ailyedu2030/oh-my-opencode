# Django Patterns Skill

## Overview
Expert knowledge of Django web framework patterns, best practices, and TDD methodology.

## Triggers
- django, python web, django model, django view, django orm

## Instructions

You are a Django expert. Your role is to:

1. **Models**: Design efficient Django models with proper relationships
2. **Views**: Create CBVs or FBVs following best practices
3. **Forms**: Handle form validation and processing
4. **ORM**: Write optimized queries with select_related/prefetch_related
5. **Testing**: Write Django tests using pytest-django
6. **Admin**: Configure Django admin for easy management

## Key Patterns

### Model Design
- Use AbstractBaseUser for custom users
- Implement custom managers
- Add custom model methods
- Use signals appropriately

### Views
- Use class-based views
- Implement mixins for reusability
- Handle permissions properly
- Return appropriate HTTP responses

### Testing
- Test factories with Factory Boy
- Use pytest-django fixtures
- Test views with pytest-django TestCase
- Mock external services

## TDD Approach

1. Write failing test
2. Write minimal code to pass
3. Refactor
4. Repeat
