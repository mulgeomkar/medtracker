import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiSignin } from "../api";
import { useAuth } from "../authContext";

export default function SigninPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const role = form.role.value;

    if (!email || !password || !role) {
      setMsg({ type: "error", text: "Fill email, password and role." });
      setLoading(false);
      return;
    }

    try {
      const data = await apiSignin({ email, password, role });
      login(data.user, data.token);
      setMsg({ type: "success", text: "Signed in!" });
      setTimeout(() => {
        if (data.user.role === "patient") navigate("/patient");
        else if (data.user.role === "doctor") navigate("/doctor");
        else if (data.user.role === "pharmacist") navigate("/pharmacist");
        else navigate("/");
      }, 700);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="card">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input name="email" type="email" placeholder="Email" />
          <input name="password" type="password" placeholder="Password" />
          <select name="role" defaultValue="">
            <option value="">Select Role</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
            <option value="pharmacist">Pharmacist</option>
          </select>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
          {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
        </form>
        <div className="small-text">
          New user? <Link to="/signup">Create account</Link>
        </div>
      </div>
    </div>
  );
}
