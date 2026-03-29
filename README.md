# Task Manager – CS515 Assignment 3

A two-tier Task Manager application deployed on Kubernetes (Minikube).

## Stack
- **Frontend/API**: Node.js + Express
- **Database**: Redis 7
- **Containerization**: Docker (multi-stage build)
- **Orchestration**: Kubernetes on Minikube

## Quick Start

### Local (Docker Compose)
```bash
docker compose up --build
# Visit http://localhost:3000
```

### Kubernetes (Minikube)
```bash
minikube start
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/app-deployment.yaml
minikube service task-manager-service
```

## Architecture
- 2 replicas of the app pod (load balanced)
- Redis ClusterIP service (internal only)
- NodePort service to expose the app externally
