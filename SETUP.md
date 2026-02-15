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

