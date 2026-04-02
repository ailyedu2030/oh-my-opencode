import type { BuiltinSkill } from "../types"

export const pythonPatternsSkill: BuiltinSkill = {
  name: "python-patterns",
  description: "Python idioms, patterns, testing patterns (pytest), Django patterns, and best practices",
  template: `# Python Patterns / Testing Skill

## Overview
You are an expert in Python programming, testing, and Django development. Your job is to write idiomatic, clean, testable, and efficient Python code following industry best practices.

## Pythonic Idioms

### List/Dict/Set Comprehensions
\`\`\`python
# BAD
squares = []
for i in range(10):
    squares.append(i**2)

# GOOD
squares = [i**2 for i in range(10)]
even_squares = [i**2 for i in range(10) if i % 2 == 0]
square_dict = {i: i**2 for i in range(10)}
unique_squares = {i**2 for i in range(-5, 6)}
\`\`\`

### Use enumerate()
\`\`\`python
# BAD
for i in range(len(items)):
    print(i, items[i])

# GOOD
for i, item in enumerate(items):
    print(i, item)
\`\`\`

### Use f-strings (Python 3.6+)
\`\`\`python
# BAD
"Hello {}".format(name)
"Value is %d" % value

# GOOD
f"Hello {name}"
f"Value is {value}"
f"Result: {calculate():.2f}"
\`\`\`

### Context Managers (with statement)
\`\`\`python
# BAD
file = open('data.txt', 'r')
content = file.read()
file.close()

# GOOD
with open('data.txt', 'r') as file:
    content = file.read()

# Custom context manager
from contextlib import contextmanager

@contextmanager
def temporary_change_dir(path):
    import os
    old_dir = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old_dir)
\`\`\`

### Use zip() for parallel iteration
\`\`\`python
names = ["Alice", "Bob", "Charlie"]
ages = [25, 30, 35]

# GOOD
for name, age in zip(names, ages):
    print(f"{name} is {age} years old")
\`\`\`

### Walrus Operator (Python 3.8+)
\`\`\`python
# BAD
value = calculate()
if value > 0:
    process(value)

# GOOD
if (value := calculate()) > 0:
    process(value)
\`\`\`

## Common Pitfalls to Avoid

### Mutable Default Arguments
\`\`\`python
# BAD
def add_item(item, items=[]):
    items.append(item)
    return items

# GOOD
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
\`\`\`

### Late Binding Closures
\`\`\`python
# BAD
funcs = [lambda x: x * i for i in range(3)]
funcs[0](1)  # Returns 2, not 0!

# GOOD
funcs = [lambda x, i=i: x * i for i in range(3)]
funcs[0](1)  # Returns 0
\`\`\`

## Type Hints (Python 3.5+)
\`\`\`python
from typing import List, Dict, Optional, Union, Tuple, Any, Callable, Iterable
from dataclasses import dataclass
from pydantic import BaseModel

# Basic types
def process_items(items: List[int]) -> Dict[str, int]:
    return {"sum": sum(items), "count": len(items)}

def get_user(user_id: int) -> Optional[Dict[str, Any]]:
    # Return user or None
    pass

# Union types
def parse_value(value: Union[str, int]) -> float:
    return float(value)

# Dataclasses (Python 3.7+)
@dataclass
class User:
    name: str
    age: int
    email: Optional[str] = None

# Pydantic models (for validation)
class UserCreate(BaseModel):
    name: str
    age: int
    email: str
\`\`\`

## Testing with pytest

### Basic Test Structure
\`\`\`python
# test_math_functions.py
import pytest

def add(a: int, b: int) -> int:
    return a + b

def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
    assert add(0, 0) == 0

# Using pytest.mark for grouping
@pytest.mark.math
def test_multiply():
    assert 2 * 3 == 6
\`\`\`

### Parametrized Tests
\`\`\`python
import pytest

@pytest.mark.parametrize("a, b, expected", [
    (2, 3, 5),
    (-1, 1, 0),
    (0, 0, 0),
    (10, -5, 5),
])
def test_add_parametrized(a, b, expected):
    assert add(a, b) == expected
\`\`\`

### Fixtures
\`\`\`python
import pytest

@pytest.fixture
def sample_user():
    return {"name": "Alice", "age": 30}

@pytest.fixture
def sample_database():
    db = {"users": []}
    yield db  # Provide the fixture value
    # Teardown code runs after test
    db["users"].clear()

def test_user_creation(sample_user, sample_database):
    sample_database["users"].append(sample_user)
    assert len(sample_database["users"]) == 1
\`\`\`

### Testing Exceptions
\`\`\`python
import pytest

def divide(a: int, b: int) -> float:
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

def test_divide_by_zero():
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        divide(5, 0)
\`\`\`

### Mocking with unittest.mock
\`\`\`python
from unittest.mock import Mock, patch, MagicMock

def test_api_call():
    # Create a mock
    mock_api = Mock()
    mock_api.get.return_value = {"status": "ok", "data": [1, 2, 3]}
    
    # Use the mock
    result = mock_api.get("/users")
    assert result["status"] == "ok"
    mock_api.get.assert_called_once_with("/users")

# Using patch as decorator
@patch("requests.get")
def test_external_api(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {"data": "test"}
    
    response = fetch_external_data()
    assert response == {"data": "test"}
    mock_get.assert_called_once()
\`\`\`

## Django Patterns

### Query Optimization
\`\`\`python
# BAD - N+1 query problem
users = User.objects.all()
for user in users:
    print(user.profile.name)  # Extra query for each user

# GOOD - Use select_related() for foreign keys
users = User.objects.select_related('profile').all()
for user in users:
    print(user.profile.name)

# GOOD - Use prefetch_related() for many-to-many
posts = Post.objects.prefetch_related('tags').all()
for post in posts:
    print(post.tags.all())

# Use only() or defer() to fetch specific fields
users = User.objects.only('name', 'email')
users = User.objects.defer('password')
\`\`\`

### Using Q Objects for Complex Queries
\`\`\`python
from django.db.models import Q, F, Count, Sum, Avg

# OR conditions
User.objects.filter(
    Q(email__icontains="example.com") | 
    Q(username__icontains="test")
)

# AND with OR
User.objects.filter(
    Q(is_active=True) &
    (Q(age__gt=18) | Q(has_parental_consent=True))
)

# F expressions - refer to model fields
Product.objects.update(price=F('price') * 1.1)

# Annotate with aggregations
Category.objects.annotate(product_count=Count('product'))
\`\`\`

### Django REST Framework (DRF) Patterns
\`\`\`python
from rest_framework import viewsets, serializers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email']

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'status': 'activated'})
\`\`\`

### Django Form Patterns
\`\`\`python
from django import forms
from .models import User

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['name', 'email', 'age']
    
    def clean_age(self):
        age = self.cleaned_data['age']
        if age < 0:
            raise forms.ValidationError("Age cannot be negative")
        return age
\`\`\`

## Best Practices

### General Python
1. Follow PEP 8 style guide
2. Use virtual environments (venv, virtualenv, or poetry)
3. Write docstrings for modules, classes, and functions
4. Use type hints for better code clarity and tooling
5. Keep functions small and focused (< 50 lines)
6. Use dataclasses or attrs for simple data structures
7. Prefer composition over inheritance
8. Use descriptive variable and function names

### Testing
1. Write tests before implementation (TDD)
2. Use descriptive test names (test_should_do_X_when_Y)
3. Test happy path and edge cases
4. Keep tests fast and isolated
5. Use fixtures for setup/teardown
6. Mock external dependencies
7. Aim for high test coverage

### Django
1. Use select_related() and prefetch_related() to avoid N+1 queries
2. Keep views thin - put business logic in models or services
3. Use Django's built-in authentication and authorization
4. Use Django REST Framework for APIs
5. Use migrations for database schema changes
6. Use environment variables for configuration (django-environ)
7. Use caching for expensive operations
8. Write tests for views, models, and APIs

## Anti-Patterns to Avoid

### Python
- Using mutable default arguments
- Using \`\`\`*args and **kwargs\`\`\` excessively
- Not handling exceptions properly
- Using global variables
- Writing monolithic functions
- Reinventing the wheel (use standard library)

### Django
- Writing raw SQL unnecessarily
- Putting business logic in templates
- Not using database indexes
- Ignoring Django's security features
- Not testing views and APIs
- Overusing \`\`\`__str__\`\`\` for complex logic

Remember: Great Python code is readable, maintainable, testable, and follows the principle of least surprise!
`,
}
