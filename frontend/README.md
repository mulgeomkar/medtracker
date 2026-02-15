# MedTrack Frontend

React-based frontend for the MedTrack healthcare management system.

## Features

- Role-based authentication (Patient, Doctor, Pharmacist)
- Responsive dashboard for each role
- Prescription management
- Medication reminders
- Health analytics
- Profile management

## Tech Stack

- React 18
- React Router v6
- Axios for API calls
- Lucide React for icons
- Recharts for data visualization

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:8080/api
```

## Running the Application

```bash
npm start
```

The application will run on `http://localhost:3000`

## Building for Production

```bash
npm run build
```

## Folder Structure

```
src/
├── components/
│   ├── common/          # Shared components
│   ├── patient/         # Patient-specific components
│   ├── doctor/          # Doctor-specific components
│   └── pharmacist/      # Pharmacist-specific components
├── pages/
│   ├── auth/            # Authentication pages
│   ├── patient/         # Patient dashboard pages
│   ├── doctor/          # Doctor dashboard pages
│   └── pharmacist/      # Pharmacist dashboard pages
├── services/            # API service layers
├── context/             # React Context providers
├── styles/              # Global styles
└── utils/               # Utility functions
```

## Available Routes

### Auth Routes
- `/login` - Login page
- `/signup` - Signup page
- `/forgot-password` - Password reset
- `/role-selection` - Role selection after signup
- `/setup/patient` - Patient profile setup
- `/setup/doctor` - Doctor profile setup
- `/setup/pharmacist` - Pharmacist profile setup

### Patient Routes
- `/patient/dashboard` - Patient dashboard
- `/patient/prescriptions` - View prescriptions
- `/patient/reminders` - Medication reminders
- `/patient/analytics` - Health analytics
- `/patient/profile` - Profile management

### Doctor Routes
- `/doctor/dashboard` - Doctor dashboard
- `/doctor/patients` - Patient management
- `/doctor/prescriptions` - Prescription management
- `/doctor/analytics` - Practice analytics
- `/doctor/profile` - Profile management

### Pharmacist Routes
- `/pharmacist/dashboard` - Pharmacist dashboard
- `/pharmacist/inventory` - Inventory management
- `/pharmacist/analytics` - Inventory analytics
- `/pharmacist/profile` - Profile management
