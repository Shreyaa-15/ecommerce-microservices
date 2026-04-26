# Full-Scale E-Commerce Microservices System

Production-grade e-commerce platform built with microservices architecture, event-driven communication, and container orchestration.

## Architecture

4 independent microservices, each with its own database, communicating via REST (sync) and Kafka (async):

- **Auth service** — JWT authentication, bcrypt password hashing
- **Product service** — catalog management, inventory tracking
- **Order service** — cart, checkout, service-to-service REST calls to product service
- **Payment service** — Kafka consumer, processes payments async, SAGA pattern for distributed transactions
- **API Gateway** — Nginx reverse proxy, single entry point for all services

## Key Concepts Demonstrated

**Database-per-service** — each service owns its PostgreSQL database. No shared state, no coupling.

**Event-driven architecture** — order service publishes `order.created` to Kafka. Payment service consumes it asynchronously and publishes `payment.processed` back. Zero direct coupling between services.

**SAGA pattern** — distributed transaction across order + payment services. If payment fails, a compensating event cancels the order.

**Service-to-service REST** — order service calls product service synchronously to validate stock before creating an order.

## Tech Stack

| Layer | Technology |
|---|---|
| Services | Python FastAPI × 4 |
| Gateway | Nginx |
| Message queue | Apache Kafka + Zookeeper |
| Databases | PostgreSQL × 4 (one per service) |
| Containers | Docker + Docker Compose |
| Orchestration | Kubernetes manifests (minikube) |
| Frontend | React + Vite |
| Load testing | Locust |

## Load Test Results

50 concurrent users · 5 users/sec spawn rate

| Endpoint | Median | 95th percentile | RPS |
|---|---|---|---|
| GET /products/ | 8ms | 17ms | 10.7 |
| GET /products/{id} | 7ms | 12ms | 0.7-0.9 |
| POST /auth/register | 55ms | 77ms | 2.2 |

Zero failures on product and order endpoints.

## Run Locally

```bash
docker-compose up --build
```

All services start automatically. Open:
- http://localhost:5173 — React frontend
- http://localhost:8000/health — API gateway
- http://localhost:8001/docs — Auth service
- http://localhost:8002/docs — Product service
- http://localhost:8003/docs — Order service
- http://localhost:8004/docs — Payment service

## Load Testing

```bash
cd loadtest
python3 -m pip install locust
python3 -m locust -f locustfile.py --host=http://localhost:8000
```

Open http://localhost:8089

## Kubernetes

Manifests in `k8s/` — deploy to any K8s cluster:

```bash
kubectl apply -f k8s/
minikube service gateway --url
```

## API Flow

1. User registers/logs in → Auth service issues JWT
2. User browses products → Product service (direct via gateway)
3. User places order → Order service validates stock via REST call to Product service → publishes `order.created` to Kafka
4. Payment service consumes `order.created` → processes payment → publishes `payment.processed`
5. Order status updated based on payment result