import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiSignup } from "../api";
import { useAuth } from "../authContext";

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const confirmPassword = form.confirmPassword.value.trim();

    if (!name || !email || !password || !confirmPassword || !role) {
      setMsg({ type: "error", text: "Please fill all required fields." });
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setMsg({ type: "error", text: "Passwords do not match." });
      setLoading(false);
      return;
    }

    const extra = {};
    if (role === "doctor") {
      extra.license = form.doctorLicense.value.trim();
      extra.specialization = form.specialization.value.trim();
    } else if (role === "patient") {
      extra.diagnosis = form.diagnosis.value.trim();
    } else if (role === "admin") {
      extra.adminCode = form.adminCode.value.trim();
    } else if (role === "pharmacist") {
      extra.pharmLicense = form.pharmLicense.value.trim();
    }

    try {
      const data = await apiSignup({ name, email, password, role, extra });
      login(data.user, data.token);
      setMsg({ type: "success", text: "Account created!" });
      setTimeout(() => {
        if (role === "patient") navigate("/patient");
        else if (role === "doctor") navigate("/doctor");
        else if (role === "pharmacist") navigate("/pharmacist");
        else navigate("/signin");
      }, 800);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const showDoctor = role === "doctor";
  const showPatient = role === "patient";
  const showAdmin = role === "admin";
  const showPharmacist = role === "pharmacist";

  return (
    <div className="page-wrapper">
      <div className="card">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Full Name" />
          <input name="email" type="email" placeholder="Email" />
          <input name="password" type="password" placeholder="Password" />
          <input name="confirmPassword" type="password" placeholder="Confirm Password" />
          <select name="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select Role</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
            <option value="pharmacist">Pharmacist</option>
          </select>

          {showDoctor && (
            <div className="extra-group active">
              <input name="doctorLicense" placeholder="License Number" />
              <input name="specialization" placeholder="Specialization" />
            </div>
          )}
          {showPatient && (
            <div className="extra-group active">
              <textarea name="diagnosis" placeholder="Diagnosis (short)" />
            </div>
          )}
          {showAdmin && (
            <div className="extra-group active">
              <input name="adminCode" placeholder="Admin Code" />
            </div>
          )}
          {showPharmacist && (
            <div className="extra-group active">
              <input name="pharmLicense" placeholder="Pharmacist License Number" />
            </div>
          )}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </button>
          {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
        </form>
        <div className="small-text">
          Already have an account? <Link to="/signin">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
