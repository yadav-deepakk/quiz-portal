# Quiz Portal

A full-stack quiz/exam application.

| Part     | Location  | Stack                                         |
| -------- | --------- | --------------------------------------------- |
| Frontend | `client/` | Angular 22, Angular Material 22, TypeScript 6 |
| Backend  | `api/`    | Spring Boot 4.1, Spring Security 7, Java 25   |

## Prerequisites

- Node.js 20.19+ / 22.12+ / 24+ and npm
- JDK 25
- Maven 3.9+ (or Maven 4)
- PostgreSQL 14+

## Database

Create the `examportal` database:

```sql
CREATE DATABASE examportal;
```

The backend connects to `jdbc:postgresql://localhost:5432/examportal` using
`postgres` / `postgres` by default. Override either value with environment
variables when your local PostgreSQL setup is different:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/examportal
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
```

Hibernate creates/updates the schema automatically (`ddl-auto=update`).

## Run the backend

```bash
cd api
mvn spring-boot:run
```

The API is available at `http://localhost:8080`.

## Run the frontend

```bash
cd client
npm install
npm start
```

The UI is available at `http://localhost:4200`.

## Tests

```bash
cd client && npm run test:coverage   # Vitest + coverage (80% thresholds)
cd api && mvn clean verify           # JUnit + JaCoCo (80% thresholds)
```

- Frontend coverage is written to `client/coverage/client/` (HTML report at
  `client/coverage/client/index.html`).
- Backend coverage is written to `api/target/site/jacoco/` (HTML report at
  `api/target/site/jacoco/index.html`).
- Both builds fail if the configured 80% coverage thresholds are not met.

Backend tests use an H2 in-memory database (`MODE=PostgreSQL`), so they do not
need a running PostgreSQL server.
