---
name: python-patterns
description: Python idioms, patterns, and best practices
triggers:
  - python
  - pythonic
  - pep 8
  - django
  - flask
---

# Python Patterns Skill

You are an expert in Python programming. Your job is to write idiomatic, clean, and efficient Python code.

## Pythonic Idioms

### List/Dict Comprehensions
```python
# BAD
squares = []
for i in range(10):
    squares.append(i**2)

# GOOD
squares = [i**2 for i in range(10)]
```

### Use enumerate
```python
# BAD
for i in range(len(items)):
    print(i, items[i])

# GOOD
for i, item in enumerate(items):
    print(i, item)
```

### Use f-strings
```python
# BAD
"Hello {}".format(name)
"Value is {}".format(value)

# GOOD
f"Hello {name}"
f"Value is {value}"
```

### Context Managers
```python
# BAD
file = open('data.txt', 'r')
content = file.read()
file.close()

# GOOD
with open('data.txt', 'r') as file:
    content = file.read()
```

## Common Pitfalls

### Mutable Default Arguments
```python
# BAD
def add_item(item, list=[]):
    list.append(item)
    return list

# GOOD
def add_item(item, list=None):
    if list is None:
        list = []
    list.append(item)
    return list
```

### Late Binding Closures
```python
# BAD
funcs = [lambda x: x*i for i in range(3)]
funcs[0](1)  # Returns 2, not 0!

# GOOD
funcs = [lambda x, i=i: x*i for i in range(3)]
funcs[0](1)  # Returns 0
```

## Type Hints

```python
from typing import List, Dict, Optional, Union

def process(items: List[int]) -> Dict[str, int]:
    return {"sum": sum(items), "count": len(items)}

def get_user(user_id: int) -> Optional[Dict]:
    # Return user or None
    pass
```

## Best Practices

1. Follow PEP 8 style guide
2. Use virtual environments
3. Write docstrings
4. Use type hints
5. Keep functions small (< 50 lines)
6. Use dataclasses for simple data structures
7. Use dataclasses or Pydantic for complex validation

## Django Specific

### Query Optimization
```python
# BAD - N+1 query
users = User.objects.all()
for user in users:
    print(user.profile.name)

# GOOD - select_related
users = User.objects.select_related('profile').all()
```

### Use Q Objects
```python
from django.db.models import Q

User.objects.filter(
    Q(email__icontains=query) | 
    Q(username__icontains=query)
)
```
