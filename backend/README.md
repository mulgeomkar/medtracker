# MedTrack Backend

Spring Boot backend for the MedTrack healthcare management system.

## Technologies

- Spring Boot 3.2.0
- Spring Security + JWT
- Spring Data MongoDB
- Lombok
- Maven

## Project Structure

```
src/main/java/com/medtrack/
├── config/          # Configuration classes
├── controller/      # REST API controllers
├── dto/             # Data Transfer Objects
├── model/           # Entity models
├── repository/      # MongoDB repositories
├── security/        # Security & JWT configuration
├── service/         # Business logic layer
└── MedtrackApplication.java
```

## Models

### User
Base user model with role-based fields:
- Common: id, name, email, password, role
- Patient: medicalHistory, allergies, emergencyContact
- Doctor: licenseNumber, specialization
- Pharmacist: licenseNumber

### Prescription
- patient, doctor (references)
- medications list
- diagnosis, notes
- status (ACTIVE, COMPLETED, CANCELLED)

### Reminder
- patient (reference)
- medicineName, dosage, frequency
- times, startDate, endDate
- active status

### InventoryItem
- pharmacist (reference)
- medicineName, batchNumber
- quantity, price, expiryDate
- status (IN_STOCK, LOW_STOCK, OUT_OF_STOCK, EXPIRED)

## API Documentation

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user.

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "User registered successfully"
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token.

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "PATIENT",
    ...
  }
}
```

#### PUT /api/auth/profile
Update user profile (requires authentication).

Request headers:
```
Authorization: Bearer {jwt_token}
```

Request body:
```json
{
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "role": "PATIENT",
  ...
}
```

## Security

- JWT authentication with HS512 algorithm
- Password encryption using BCrypt
- Role-based access control
- Protected endpoints with @PreAuthorize

## Database Configuration

### MongoDB (Default)
```properties
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=medtrack
```

### MySQL (Alternative)
Uncomment in application.properties:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/medtrack
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
```

And update pom.xml to use MySQL connector instead of MongoDB.

## Running the Application

### Development Mode
```bash
mvn spring-boot:run
```

### Production Build
```bash
mvn clean package
java -jar target/medtrack-backend-1.0.0.jar
```

## Environment Variables

Create application-{profile}.properties for different environments:

```properties
# JWT
jwt.secret=your-secret-key-min-256-bits
jwt.expiration=86400000

# Database
spring.data.mongodb.host=${MONGO_HOST:localhost}
spring.data.mongodb.port=${MONGO_PORT:27017}
spring.data.mongodb.database=${MONGO_DB:medtrack}

# CORS
cors.allowed-origins=${ALLOWED_ORIGINS:http://localhost:3000}
```

## Testing

Run tests:
```bash
mvn test
```

## Error Handling

The API returns consistent error responses:
```json
{
  "timestamp": "2024-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/endpoint"
}
```

## Deployment

### Docker
Create Dockerfile:
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/medtrack-backend-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

Build and run:
```bash
docker build -t medtrack-backend .
docker run -p 8080:8080 medtrack-backend
```

### Cloud Deployment
- AWS: Deploy to Elastic Beanstalk or EC2
- Heroku: `git push heroku main`
- Azure: Deploy to App Service

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License
