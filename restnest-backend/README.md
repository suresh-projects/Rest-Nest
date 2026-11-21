# RestNest Backend - Phase 1

Spring Boot 3.3 + PostgreSQL + JWT (Guest / Host / Admin)

## Run steps
1. PostgreSQL la database create pannu:
   CREATE DATABASE restnest;
2. src/main/resources/application.properties la DB username/password check pannu.
3. IntelliJ la folder open pannu (pom.xml detect aagum) -> RestNestApplication run pannu.
   (illa terminal la: mvn spring-boot:run)
4. Server: http://localhost:8080

## Test (curl / Postman)

Register (Host):
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d '{"fullName":"Ravi Kumar","email":"ravi@test.com","phone":"9876543210","password":"Pass@1234","role":"HOST"}'

Login:
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"email":"ravi@test.com","password":"Pass@1234"}'

Current user (token paste pannu):
curl http://localhost:8080/api/me -H "Authorization: Bearer <TOKEN>"

Admin only (admin@restnest.com / Admin@12345 la login panni test pannu):
curl http://localhost:8080/api/admin/ping -H "Authorization: Bearer <ADMIN_TOKEN>"

## Expected
- Register -> 201 + token
- Duplicate email -> 409
- Wrong password -> 401
- Guest token la /api/admin/ping -> 403
- No token la /api/me -> 401
