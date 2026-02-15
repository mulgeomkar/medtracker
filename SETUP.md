# MedTrack Setup Guide

## Quick Start Guide

Follow these steps to get the MedTrack application running on your local machine.

### 1. Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (usually comes with Node.js)
- **Java** (JDK 17 or higher)
- **Maven** (v3.8 or higher)
- **MongoDB** (v4.4 or higher) OR **MySQL** (v8.0 or higher)

### 2. Database Setup

#### Option A: MongoDB (Recommended)

1. Install MongoDB:
   - **Mac**: `brew install mongodb-community`
   - **Windows**: Download from https://www.mongodb.com/download-center/community
   - **Linux**: Follow instructions at https://docs.mongodb.com/manual/administration/install-on-linux/

2. Start MongoDB:
   ```bash
   # Mac/Linux
   mongod --config /usr/local/etc/mongod.conf

   # Windows
   net start MongoDB
   ```

3. Create database (optional, will be created automatically):
   ```bash
   mongo
   use medtrack
   ```

#### Option B: MySQL

1. Install MySQL:
   - Download from https://dev.mysql.com/downloads/mysql/

2. Create database:
   ```sql
   CREATE DATABASE medtrack;
   ```

3. Update backend configuration:
   - Open `backend/src/main/resources/application.properties`
   - Comment out MongoDB configuration
   - Uncomment MySQL configuration
   - Update username/password

4. Update pom.xml:
   - Comment out spring-boot-starter-data-mongodb
   - Uncomment mysql-connector-j

### 3. Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies and build:
   ```bash
   mvn clean install
   ```

3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

   You should see:
   ```
   Started MedtrackApplication in X.XXX seconds
   ```

### 4. Frontend Setup

1. Open a new terminal and navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   # Create .env file
   echo "REACT_APP_API_URL=http://localhost:8080/api" > .env
   ```

4. Start the development server:
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:3000` and open in your browser.

### 5. Verify Installation

1. Open browser to `http://localhost:3000`
2. You should see the MedTrack login page
3. Click "Sign up" to create a new account
4. Complete the registration process

### 6. Testing the Application

#### Create a Patient Account:
1. Sign up with your email
2. Select "Patient" role
3. Fill in basic information
4. Complete medical information setup
5. You'll be redirected to the patient dashboard

#### Create a Doctor Account:
1. Sign up with a different email
2. Select "Doctor" role
3. Enter license number and specialization
4. Access the doctor dashboard

#### Create a Pharmacist Account:
1. Sign up with another email
2. Select "Pharmacist" role
3. Enter license number
4. Access the pharmacist dashboard

### Common Issues and Solutions

#### Backend won't start
- **Error**: "Port 8080 already in use"
  - Solution: Change port in `application.properties`: `server.port=8081`

- **Error**: "Cannot connect to database"
  - Solution: Ensure MongoDB/MySQL is running
  - Check database credentials in `application.properties`

#### Frontend won't start
- **Error**: "Port 3000 already in use"
  - Solution: Kill the process or use a different port
  - Mac/Linux: `lsof -ti:3000 | xargs kill -9`
  - Windows: Find and kill the process in Task Manager

- **Error**: "Module not found"
  - Solution: Delete node_modules and reinstall
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

#### Login/Signup issues
- **Error**: "Cannot connect to backend"
  - Solution: Check if backend is running on port 8080
  - Verify REACT_APP_API_URL in .env file

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development

2. **API Testing**: Use tools like Postman or curl to test backend APIs:
   ```bash
   # Login
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password123"}'
   ```

3. **Database GUI Tools**:
   - MongoDB: MongoDB Compass, Robo 3T
   - MySQL: MySQL Workbench, DBeaver

4. **Debugging**:
   - Frontend: Use browser DevTools (F12)
   - Backend: Add breakpoints in your IDE or use logging

### Production Deployment

#### Frontend
```bash
cd frontend
npm run build
# Deploy the 'build' folder to your hosting service
```

#### Backend
```bash
cd backend
mvn clean package
# Deploy target/medtrack-backend-1.0.0.jar to your server
```

### Environment Variables for Production

Create production configuration files:

**Frontend** (.env.production):
```
REACT_APP_API_URL=https://your-api-domain.com/api
```

**Backend** (application-prod.properties):
```
spring.data.mongodb.uri=mongodb://username:password@your-mongodb-host:27017/medtrack
jwt.secret=your-production-secret-key-must-be-at-least-256-bits
cors.allowed-origins=https://your-frontend-domain.com
```

### Next Steps

1. Explore the application features
2. Check the API documentation in backend/README.md
3. Customize the UI in frontend/src/styles/index.css
4. Add more features as needed

### Support

If you encounter issues not covered here:
1. Check the main README.md
2. Review the code comments
3. Create an issue in the repository

Happy coding! 🚀
