---
name: backend-patterns
description: Backend architecture patterns, API design patterns, database patterns, microservice patterns, and best practices
triggers:
  - backend patterns
  - backend architecture
  - api design patterns
  - database patterns
  - microservice patterns
  - server-side patterns
  - rest api
  - graphql
  - microservices
---

# Backend Patterns Skill

You are an expert in backend development, architecture, and design patterns. Your role is to help design and implement robust, scalable, and maintainable backend systems.

## Core Backend Architecture Patterns

### Layered Architecture
- **Presentation Layer**: Handles HTTP requests/responses, API endpoints
- **Service Layer**: Business logic, use cases, workflow orchestration
- **Data Access Layer**: Database interactions, repositories, DAOs
- **Infrastructure Layer**: External services, file systems, message queues

### Domain-Driven Design (DDD)
- **Bounded Contexts**: Clear boundaries around subdomains
- **Entities**: Objects with identity and lifecycle
- **Value Objects**: Immutable objects without identity
- **Aggregates**: Cluster of entities and value objects
- **Domain Events**: Notifications of state changes
- **Repositories**: Abstraction for data access

### Design Patterns

#### Creational Patterns
- **Factory Method**: Creates objects without specifying exact class
- **Abstract Factory**: Creates families of related objects
- **Builder**: Constructs complex objects step by step
- **Singleton**: Ensures single instance of a class
- **Prototype**: Creates objects by cloning existing ones

#### Structural Patterns
- **Adapter**: Converts interface of a class into another interface
- **Bridge**: Separates abstraction from implementation
- **Composite**: Composes objects into tree structures
- **Decorator**: Adds responsibilities to objects dynamically
- **Facade**: Provides unified interface to a set of interfaces
- **Flyweight**: Uses sharing to support large numbers of fine-grained objects
- **Proxy**: Provides surrogate or placeholder for another object

#### Behavioral Patterns
- **Chain of Responsibility**: Passes request along a chain of handlers
- **Command**: Encapsulates a request as an object
- **Interpreter**: Implements a language interpreter
- **Iterator**: Accesses elements of an aggregate sequentially
- **Mediator**: Defines object that encapsulates how a set of objects interact
- **Memento**: Captures and externalizes object's internal state
- **Observer**: Defines one-to-many dependency between objects
- **State**: Allows an object to alter its behavior when its internal state changes
- **Strategy**: Defines family of algorithms, encapsulates each one, makes them interchangeable
- **Template Method**: Defines skeleton of an algorithm in an operation
- **Visitor**: Represents an operation to be performed on elements of an object structure

### Architectural Patterns

#### Microservices Architecture
- **Service Decomposition**: Split by business capability, subdomain, or layer
- **Database per Service**: Each service has its own database
- **API Gateway**: Single entry point for all clients
- **Service Discovery**: Dynamic service registration and discovery
- **Circuit Breaker**: Prevents cascading failures
- **Saga Pattern**: Manages distributed transactions
- **Event-Driven**: Services communicate via events

#### Event-Driven Architecture
- **Event Sourcing**: Stores state as sequence of events
- **CQRS (Command Query Responsibility Segregation)**: Separates read and write models
- **Message Brokers**: Kafka, RabbitMQ, AWS SQS/SNS
- **Event Streams**: Processing events in real-time

#### Serverless Architecture
- **Function as a Service (FaaS)**: Lambda, Cloud Functions, Azure Functions
- **Event Triggers**: HTTP, S3, DynamoDB, SQS, etc.
- **Stateless Functions**: Each function invocation is independent
- **Pay-per-Use**: Cost based on actual execution time

## API Design Patterns

### RESTful API Design
- **Resource-Based URLs**: `/users`, `/users/{id}`, `/users/{id}/orders`
- **HTTP Methods**: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove)
- **Status Codes**: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 422 (Unprocessable Entity), 500 (Internal Server Error)
- **Request/Response Formats**: JSON with consistent structure
- **Versioning**: `/api/v1/users`, `/api/v2/users`
- **Pagination**: `?page=1&limit=20`
- **Filtering/Sorting**: `?status=active&sort=-created_at`
- **Rate Limiting**: Headers like `X-RateLimit-Limit`, `X-RateLimit-Remaining`
- **HATEOAS**: Hypermedia as the Engine of Application State

### GraphQL API Design
- **Schema Definition**: Type definitions with queries, mutations, and subscriptions
- **Queries**: Fetch data declaratively
- **Mutations**: Modify data
- **Subscriptions**: Real-time data updates
- **Resolvers**: Functions that resolve fields
- **Data Loaders**: Batch and cache database requests to prevent N+1 problems
- **Error Handling**: Structured error responses with extensions

### RPC API Design
- **gRPC**: High-performance RPC using Protocol Buffers
- **Service Definition**: `.proto` files defining services and messages
- **Streaming**: Unary, server streaming, client streaming, bidirectional streaming
- **Code Generation**: Generates client and server code in multiple languages

## Database Patterns

### Relational Database Patterns
- **Normalization**: Organize data to reduce redundancy (1NF, 2NF, 3NF, BCNF)
- **Denormalization**: Optimize read performance by adding redundant data
- **Indexing**: B-tree, composite, covering, partial indexes
- **Transactions**: ACID properties (Atomicity, Consistency, Isolation, Durability)
- **Connection Pooling**: Reuse database connections
- **Sharding**: Split large databases across multiple servers
- **Replication**: Master-slave, master-master, read replicas
- **Materialized Views**: Pre-computed query results

### NoSQL Database Patterns
- **Document Stores**: MongoDB, Couchbase (store JSON-like documents)
- **Key-Value Stores**: Redis, DynamoDB (simple key-value pairs)
- **Column-Family Stores**: Cassandra, HBase (store data in columns)
- **Graph Databases**: Neo4j, Amazon Neptune (store data as graphs)

### Data Access Patterns
- **Repository Pattern**: Mediates between domain and data mapping layers
- **Unit of Work**: Maintains list of objects affected by business transaction
- **Active Record**: Object that wraps a row in database table
- **Data Mapper**: Layer that moves data between objects and database
- **Identity Map**: Ensures each object gets loaded only once
- **Lazy Loading**: Loads objects only when needed
- **Eager Loading**: Loads related objects upfront

## Security Patterns

### Authentication
- **Session-Based**: Server stores session, client uses cookie with session ID
- **Token-Based**: JWT, OAuth 2.0, OpenID Connect
- **API Keys**: Simple key for authenticating requests
- **Multi-Factor Authentication (MFA)**: Requires two or more verification factors
- **Single Sign-On (SSO)**: Authenticate once to access multiple systems

### Authorization
- **Role-Based Access Control (RBAC)**: Permissions assigned to roles
- **Attribute-Based Access Control (ABAC)**: Permissions based on attributes
- **Policy-Based Access Control**: Permissions defined in policies
- **Principle of Least Privilege**: Grant minimum necessary permissions

### Data Protection
- **Encryption**: At rest (database encryption) and in transit (TLS/SSL)
- **Hashing**: Store passwords with bcrypt, argon2, PBKDF2
- **Input Validation**: Validate and sanitize all user inputs
- **Output Encoding**: Escape outputs to prevent XSS
- **SQL Injection Prevention**: Parameterized queries, ORMs
- **CSRF Protection**: Anti-CSRF tokens, SameSite cookies

## Performance & Scalability Patterns

### Caching
- **Application-Level Caching**: In-memory caches (Redis, Memcached)
- **HTTP Caching**: Cache-Control headers, ETags, Last-Modified
- **Database Caching**: Query caching, application-level caching
- **CDN**: Content Delivery Network for static assets

### Performance Optimization
- **Asynchronous Processing**: Queue tasks with background workers (Celery, BullMQ, Sidekiq)
- **Batch Processing**: Process large datasets in batches
- **Lazy Loading**: Load data only when needed
- **Database Optimization**: Indexing, query optimization, connection pooling
- **Load Balancing**: Distribute traffic across multiple servers

### Scalability Patterns
- **Horizontal Scaling**: Add more servers
- **Vertical Scaling**: Add more resources to a server
- **Stateless Services**: Services don't store client state
- **Partitioning**: Split data/load across partitions (sharding)

## Error Handling & Resilience Patterns

### Error Handling
- **Global Exception Handling**: Centralized error handling
- **Error Codes**: Consistent error code system
- **Structured Error Responses**: Standard JSON format for errors
- **Logging**: Structured logging with context
- **Monitoring**: Metrics, alerts, dashboards

### Resilience Patterns
- **Circuit Breaker**: Stop calling service that's failing (Hystrix, Resilience4j)
- **Retry**: Retry failed operations with backoff
- **Fallback**: Provide alternative when service fails
- **Rate Limiting**: Control rate of requests
- **Bulkhead**: Isolate failures to prevent cascading issues
- **Idempotency**: Ensure operations can be retried safely

## Testing Patterns

### Testing Pyramid
- **Unit Tests**: Test individual components in isolation (fast, many)
- **Integration Tests**: Test interactions between components (medium)
- **End-to-End (E2E) Tests**: Test entire system from user perspective (slow, few)

### Testing Patterns
- **Test Doubles**: Dummies, fakes, stubs, mocks, spies
- **Test Data Builders**: Create test data with builder pattern
- **Object Mother**: Predefined test data factories
- **Test Containers**: Spin up real services in containers for testing
- **Contract Testing**: Ensure API providers and consumers adhere to contracts (Pact)

## Deployment & Operations Patterns

### Deployment
- **Continuous Integration (CI)**: Automate build and test on every commit
- **Continuous Deployment (CD)**: Automatically deploy to production
- **Blue-Green Deployment**: Deploy to two identical environments, switch traffic
- **Canary Deployment**: Roll out to small percentage of users first
- **Rolling Deployment**: Update instances one by one
- **Infrastructure as Code (IaC)**: Terraform, CloudFormation, Ansible

### Containerization & Orchestration
- **Docker**: Package application and dependencies into containers
- **Kubernetes**: Orchestrate containerized applications
- **Docker Compose**: Define and run multi-container Docker applications

### Observability
- **Logging**: Centralized logging (ELK Stack, Datadog, New Relic)
- **Metrics**: Collect and visualize metrics (Prometheus, Grafana)
- **Tracing**: Distributed tracing (Jaeger, Zipkin, OpenTelemetry)

## Guidelines

- **Separation of Concerns**: Keep different concerns in different layers/components
- **Dependency Injection**: Inject dependencies instead of hardcoding them
- **Single Responsibility Principle**: Each component should have only one reason to change
- **Open/Closed Principle**: Open for extension, closed for modification
- **Liskov Substitution Principle**: Subtypes must be substitutable for their base types
- **Interface Segregation Principle**: Many specific interfaces are better than one general-purpose interface
- **Dependency Inversion Principle**: Depend on abstractions, not concretions
- **KISS (Keep It Simple, Stupid)**: Avoid unnecessary complexity
- **DRY (Don't Repeat Yourself)**: Avoid code duplication
- **YAGNI (You Aren't Gonna Need It)**: Don't build features until you need them
- **Convention Over Configuration**: Follow conventions to reduce configuration
- **Fail Fast**: Detect and report errors as early as possible
- **Defensive Programming**: Anticipate and handle errors gracefully
