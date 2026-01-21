# TrustLens Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20.x (for local development)
- PostgreSQL 15 (for local development)
- Redis 7 (for caching)

## Environment Setup

1. **Copy environment variables**:

   ```bash
   cp Backend/.env.example Backend/.env
   ```

2. **Update production secrets** in `.env`:
   - `JWT_SECRET`: Use a strong random string
   - `DATABASE_URL`: Production database connection string
   - `REDIS_URL`: Production Redis connection string

## Local Development

1. **Install dependencies**:

   ```bash
   cd Backend && npm install
   cd ../frontend && npm install
   ```

2. **Start database**:

   ```bash
   docker-compose up db redis -d
   ```

3. **Run migrations**:

   ```bash
   cd Backend
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start dev servers**:

   ```bash
   # Terminal 1 - Backend
   cd Backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

## Testing

```bash
# Backend tests
cd Backend
npm test

# Coverage report
npm run test:coverage
```

## Docker Deployment

### Development

```bash
docker-compose up
```

### Production

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f api

# Scale services
docker-compose up --scale api=3
```

## Health Checks

- **API Health**: `GET http://localhost:3000/health`
- **Database**: Checked automatically in health endpoint
- **Redis**: Checked automatically in health endpoint

## Monitoring

### Logs

- Backend logs: `Backend/logs/`
- Error logs: `Backend/logs/error.log`
- Combined logs: `Backend/logs/combined.log`

### Metrics

- System metrics: `GET /metrics`
- Audit logs: `GET /audit`
- Admin analytics: `GET /admin/stats`

## CI/CD

GitHub Actions workflows are configured in `.github/workflows/ci-cd.yml`:

- Runs on push to `main` and `develop`
- Linting, testing, and building
- Docker image creation
- Artifacts uploaded for deployment

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers (Helmet)
- [ ] Regular dependency updates
- [ ] Database backups configured

## Performance Optimization

- Redis caching enabled for read-heavy endpoints
- Database indexes on frequently queried fields
- Cursor-based pagination for large datasets
- Docker multi-stage builds for smaller images

## Troubleshooting

### Database Connection Issues

```bash
docker-compose logs db
docker exec -it trustlens-db psql -U postgres
```

### Redis Connection Issues

```bash
docker-compose logs redis
docker exec -it trustlens-redis redis-cli ping
```

### Application Logs

```bash
docker-compose logs --tail=100 api
```

## Backup and Restore

### Database Backup

```bash
docker exec trustlens-db pg_dump -U postgres trustlens > backup.sql
```

### Database Restore

```bash
docker exec -i trustlens-db psql -U postgres trustlens < backup.sql
```
