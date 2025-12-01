import React, { useState } from "react";
import BottomNav from "../components/BottomNav";

export default function PharmacistInventory() {
  const [query, setQuery] = useState("");

  const inventory = [
    { drug: "Drug A", batch: "123456", exp: "2024-12-31", qty: 50 },
    { drug: "Drug B", batch: "789012", exp: "2025-06-30", qty: 25 },
    { drug: "Drug C", batch: "345678", exp: "2024-10-15", qty: 100 },
    { drug: "Drug D", batch: "901234", exp: "2025-03-20", qty: 75 },
  ];

  const filtered = inventory.filter((d) =>
    d.drug.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page-wrapper with-nav">
      <div className="card full">
        <h2>Inventory</h2>
        <input
          placeholder="Search for drugs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div style={{ marginTop: 8 }}>
          {filtered.map((d, i) => (
            <div className="inv-item" key={i}>
              <div className="thumb" />
              <div>
                <div className="title">{d.drug}</div>
                <div className="muted">
                  Batch: {d.batch}, Exp: {d.exp}, Qty: {d.qty}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="inventory" />
    </div>
  );
}
