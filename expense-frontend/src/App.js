import React, { useState, useEffect } from "react";
import "./App.css";

const API = "https://expense-tracker-rpa8.onrender.com/api";

function App() {
  const [page, setPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // ---------------- AUTH ----------------
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Registered Successfully!");
        setPage("login");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Registration failed");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setIsLoggedIn(true);
        setPage("dashboard");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Login failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setPage("login");
  };

  // ---------------- EXPENSE ----------------
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState([]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API}/expenses`, {
        headers: { Authorization: token },
      });
      const data = await res.json();
      if (res.ok) setExpenses(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      setPage("dashboard");
      fetchExpenses();
    }
  }, [token]);

  const addExpense = async () => {
    if (!title || !amount) return;

    try {
      const res = await fetch(`${API}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ title, amount }),
      });

      if (res.ok) {
        fetchExpenses();
        setTitle("");
        setAmount("");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await fetch(`${API}/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      fetchExpenses();
    } catch (err) {
      console.log(err);
    }
  };

  const total = expenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0
  );

  // ---------------- SPLIT ----------------
  const [members, setMembers] = useState([
    { id: 1, name: "", spent: 0 },
  ]);

  const addMember = () => {
    setMembers([
      ...members,
      { id: Date.now(), name: "", spent: 0 },
    ]);
  };

  const removeMember = (id) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const updateMember = (id, field, value) => {
    setMembers(
      members.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  const splitTotal = members.reduce(
    (sum, m) => sum + Number(m.spent),
    0
  );

  const perPerson =
    members.length > 0 ? splitTotal / members.length : 0;

  // ---------------- UI ----------------
  return (
    <div className="app-container">
      {page === "login" && (
        <div className="card">
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="primary-btn" onClick={handleLogin}>
            Login
          </button>
          <p onClick={() => setPage("register")} className="link">
            Create Account
          </p>
        </div>
      )}

      {page === "register" && (
        <div className="card">
          <h2>Register</h2>
          <input
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="primary-btn"
            onClick={handleRegister}
          >
            Register
          </button>
          <p onClick={() => setPage("login")} className="link">
            Back to Login
          </p>
        </div>
      )}

      {page === "dashboard" && (
        <div className="card">
          <div className="top-bar">
            <button onClick={() => setPage("split")}>
              Split Expenses
            </button>
            <button onClick={handleLogout}>Logout</button>
          </div>

          <h2>Expense Dashboard</h2>

          <input
            placeholder="Expense Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button className="primary-btn" onClick={addExpense}>
            Add Expense
          </button>

          {expenses.map((exp) => (
            <div key={exp._id} className="expense-item">
              {exp.title} - ₹{exp.amount}
              <button
                className="danger-btn"
                onClick={() => deleteExpense(exp._id)}
              >
                X
              </button>
            </div>
          ))}

          <h3>Total: ₹{total}</h3>
        </div>
      )}

      {page === "split" && (
        <div className="card">
          <button onClick={() => setPage("dashboard")}>
            ← Back
          </button>
          <h2>Split Expenses</h2>

          {members.map((member) => (
            <div key={member.id} className="member-row">
              <input
                placeholder="Name"
                value={member.name}
                onChange={(e) =>
                  updateMember(
                    member.id,
                    "name",
                    e.target.value
                  )
                }
              />
              <input
                type="number"
                placeholder="Amount"
                value={member.spent}
                onChange={(e) =>
                  updateMember(
                    member.id,
                    "spent",
                    e.target.value
                  )
                }
              />
              <button
                className="danger-btn"
                onClick={() => removeMember(member.id)}
              >
                Remove
              </button>
            </div>
          ))}

          <button className="primary-btn" onClick={addMember}>
            + Add Member
          </button>

          <h3>Total Group: ₹{splitTotal}</h3>
          <h3>Each Pays: ₹{perPerson.toFixed(2)}</h3>
        </div>
      )}
    </div>
  );
}

export default App;
