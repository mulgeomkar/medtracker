import React from "react";

export default function BottomNav({ active }) {
  return (
    <div className="bottom-nav">
      <div className={active === "dashboard" ? "nav-item active" : "nav-item"}>
        🏠<span>Dashboard</span>
      </div>
      <div className={active === "prescriptions" ? "nav-item active" : "nav-item"}>
        💊<span>Prescriptions</span>
      </div>
      <div className={active === "inventory" ? "nav-item active" : "nav-item"}>
        📦<span>Inventory</span>
      </div>
      <div className={active === "profile" ? "nav-item active" : "nav-item"}>
        👤<span>Profile</span>
      </div>
    </div>
  );
}
