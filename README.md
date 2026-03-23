# HireFlow Lite

A full-stack Applicant Tracking System (ATS) tailored for small recruiting teams.

## Local Development Setup

### 1. Environment Setup
Copy the `.env.example` file to create your local environment values:
```bash
cp .env.example .env
```
Ensure you load or export these variables before running the application if you modify the defaults.

### 2. Database Infrastructure
Stand up the local PostgreSQL database using Docker Compose:
```bash
docker compose up -d
```
The database will map to `localhost:5432` with the following credentials:
- **User**: `postgres`
- **Password**: `password`
- **Database**: `hireflow`

### 2. Backend (Spring Boot)
To run the Spring Boot API:
```bash
cd backend
./mvnw spring-boot:run
```
The application will start on `http://localhost:8080`.

You can verify it's running by visiting the Actuator health endpoint:
[http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
