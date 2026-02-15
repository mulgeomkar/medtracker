# MedTrack - Healthcare Management System

A comprehensive full-stack healthcare management application built with React and Spring Boot, designed to streamline interactions between patients, doctors, and pharmacists.

## 🎯 Features

### Patient Features
- **Dashboard**: View health summary, active medications, and adherence rates
- **Prescriptions**: Access and track all prescriptions
- **Medication Reminders**: Set custom medication schedules
- **Health Analytics**: Track medication adherence and health trends
- **Profile Management**: Update personal and medical information

### Doctor Features
- **Dashboard**: Overview of patients, prescriptions, and pending reviews
- **Patient Management**: View and manage patient records
- **Prescription Creation**: Create and manage digital prescriptions
- **Practice Analytics**: View practice statistics and trends
- **Profile Management**: Update professional credentials

### Pharmacist Features
- **Dashboard**: Inventory overview and low stock alerts
- **Inventory Management**: Track medicine stock, batch numbers, and expiry dates
- **Order Fulfillment**: Process prescription orders
- **Analytics**: Inventory distribution and top medicines by stock
- **Profile Management**: Update professional information

## 🏗️ Architecture

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**: Custom components with Lucide icons
- **Charts**: Recharts
- **Styling**: Custom CSS with CSS variables

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: MongoDB (with MySQL alternative)
- **Security**: Spring Security + JWT
- **API Style**: RESTful
- **Build Tool**: Maven

## 📁 Project Structure

```
medtrack/
├── frontend/                 # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── common/      # Shared components (Sidebar, Layout)
│   │   │   ├── patient/     # Patient-specific components
│   │   │   ├── doctor/      # Doctor-specific components
│   │   │   └── pharmacist/  # Pharmacist-specific components
│   │   ├── pages/           # Page components
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── patient/     # Patient dashboard pages
│   │   │   ├── doctor/      # Doctor dashboard pages
│   │   │   └── pharmacist/  # Pharmacist dashboard pages
│   │   ├── services/        # API service layer
│   │   ├── context/         # React Context providers
│   │   ├── styles/          # Global styles
│   │   ├── utils/           # Utility functions
│   │   ├── App.js           # Main App component
│   │   └── index.js         # Entry point
│   ├── package.json
│   └── README.md
│
└── backend/                  # Spring Boot backend application
    ├── src/main/
    │   ├── java/com/medtrack/
    │   │   ├── config/       # Configuration classes
    │   │   ├── controller/   # REST controllers
    │   │   ├── dto/          # Data Transfer Objects
    │   │   ├── model/        # Entity models
    │   │   ├── repository/   # Data repositories
    │   │   ├── security/     # Security configuration
    │   │   ├── service/      # Business logic layer
    │   │   └── MedtrackApplication.java
    │   └── resources/
    │       └── application.properties
    ├── pom.xml
    └── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Java 17+
- Maven 3.8+
- MongoDB 4.4+ (or MySQL 8.0+)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
REACT_APP_API_URL=http://localhost:8080/api
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Configure database in `src/main/resources/application.properties`:

For MongoDB:
```properties
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=medtrack
```

For MySQL (alternative):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/medtrack
spring.datasource.username=root
spring.datasource.password=yourpassword
```

3. Build the project:
```bash
mvn clean install
```

4. Run the application:
```bash
mvn spring-boot:run
```

The backend will run on `http://localhost:8080`

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `PUT /api/auth/profile` - Update user profile

### Patient Endpoints
- `GET /api/patient/dashboard` - Get dashboard stats
- `GET /api/patient/prescriptions` - Get all prescriptions
- `GET /api/patient/reminders` - Get all reminders
- `POST /api/patient/reminders` - Create reminder
- `GET /api/patient/analytics` - Get health analytics
- `GET /api/patient/profile` - Get patient profile

### Doctor Endpoints
- `GET /api/doctor/dashboard` - Get dashboard stats
- `GET /api/doctor/patients` - Get all patients
- `GET /api/doctor/prescriptions` - Get all prescriptions
- `POST /api/doctor/prescriptions` - Create prescription
- `GET /api/doctor/analytics` - Get practice analytics

### Pharmacist Endpoints
- `GET /api/pharmacist/dashboard` - Get dashboard stats
- `GET /api/pharmacist/inventory` - Get inventory items
- `POST /api/pharmacist/inventory` - Add inventory item
- `GET /api/pharmacist/analytics` - Get inventory analytics

## 🎨 Design System

The application uses a consistent design system with:
- **Primary Color**: Teal (#00d9a5)
- **Background**: Dark blue (#0a0e27)
- **Card Background**: Navy (#1a1f3a)
- **Typography**: Inter font family
- **Icons**: Lucide React

## 🔐 Security

- JWT-based authentication
- Password encryption using BCrypt
- Role-based access control (RBAC)
- Protected API endpoints
- CORS configuration

## 🧪 Testing

Frontend:
```bash
cd frontend
npm test
```

Backend:
```bash
cd backend
mvn test
```

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

Built with ❤️ for better healthcare management

## 📧 Support

For issues and questions, please create an issue in the repository.

## 🚀 Deployment

### Frontend Deployment
- Build: `npm run build`
- Deploy to Vercel, Netlify, or any static hosting

### Backend Deployment
- Package: `mvn package`
- Deploy JAR to Heroku, AWS, or any Java hosting platform

## 🔄 Future Enhancements

- Real-time notifications
- Telemedicine integration
- Prescription barcode scanning
- Multi-language support
- Mobile applications (React Native)
- Advanced analytics and reporting
- Email notifications for reminders
- Two-factor authentication
