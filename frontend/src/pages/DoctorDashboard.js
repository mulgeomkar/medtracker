import React from "react";
import BottomNav from "../components/BottomNav";

export default function DoctorDashboard() {
  const alerts = [
    { message: "Adherence for patient #2 fell to 60%." },
    { message: "Adherence for patient #5 fell to 50%." },
  ];

  return (
    <div className="page-wrapper with-nav">
      <div className="card full">
        <h2>Doctor Alerts</h2>
        <p className="muted" style={{ marginBottom: 10 }}>
          Automatic alerts when patient adherence is below threshold.
        </p>
        {alerts.map((a, i) => (
          <div className="alert-item" key={i}>
            {a.message}
          </div>
        ))}
      </div>
      <BottomNav active="dashboard" />
    </div>
  );
}
