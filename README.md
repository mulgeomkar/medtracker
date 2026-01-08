# ⚕️MedTracker

MedTracker is a full-stack web application designed to streamline healthcare interactions between patients, doctors, 
and pharmacists. It provides specialized dashboards for different user roles to manage prescriptions, patient records, and pharmacy inventory.

## 🏥Features

- **Authentication**: Secure signup and signin for three roles: Patient, Doctor, and Pharmacist.
- **Doctor Dashboard**: Allows doctors to view patient history and create digital prescriptions.
- **Patient Dashboard**: Enables patients to view their medical history and active prescriptions.
- **Pharmacist Inventory**: Provides pharmacists with tools to manage medicine stock and fulfill prescriptions.
-  **Admin Dashboard**: Can manage and monitior the application.
- **Role-Based Access Control**: Protected routes ensure users can only access dashboards relevant to their role.



## 👨‍💻Getting Started

### Prerequisites
- Node.js (v14 or higher recommended)
- npm (Node Package Manager)

### ➡️Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mulgeomkar/medtracker
   cd medtracker
   ```

 2.  **Setup Backend**:

```

cd backend
npm install
```
3. **Setup Frontend**:

```

cd ../frontend
npm install

```
4. **Running the Application**:
Start the Backend Server: From the backend directory:
```

npm start
```
The backend runs on http://localhost:4000.

Start the Frontend Application: From the frontend directory:

```

npm start
```
The frontend typically runs on http://localhost:3000.
