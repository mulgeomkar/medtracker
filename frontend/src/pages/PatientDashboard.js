import React from "react";
import BottomNav from "../components/BottomNav";

export default function PatientDashboard() {
  const active = [
    { name: "Antibiotic", sub: "Amoxicillin 500mg" },
    { name: "Pain Relief", sub: "Ibuprofen 200mg" },
    { name: "Blood Pressure", sub: "Lisinopril 10mg" },
  ];
  const past = [
    { name: "Diabetes", sub: "Metformin 500mg" },
    { name: "Cholesterol", sub: "Atorvastatin 20mg" },
  ];

  const renderList = (list) =>
    list.map((p, idx) => (
      <div className="pres-item" key={idx}>
        <div className="pill-icon">💊</div>
        <div>
          <div className="title">{p.name}</div>
          <div className="muted">{p.sub}</div>
        </div>
      </div>
    ));

  return (
    <div className="page-wrapper with-nav">
      <div className="card full">
        <h2>Prescriptions</h2>
        <h3>Active Prescriptions</h3>
        {renderList(active)}
        <h3 style={{ marginTop: 16 }}>Past Prescriptions</h3>
        {renderList(past)}
      </div>
      <BottomNav active="prescriptions" />
    </div>
  );
}
