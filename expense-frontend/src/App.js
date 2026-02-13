import React, { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ---------------- AUTH ----------------

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email && password) {
      setIsLoggedIn(true);
      setPage("dashboard");
    }
  };

  const handleRegister = () => {
    if (name && email && password) {
      alert("Registered Successfully!");
      setPage("login");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    setPage("login");
  };

  const handleDeleteAccount = () => {
    alert("Account Deleted");
    setIsLoggedIn(false);
    setPage("login");
  };

  // ---------------- EXPENSE ----------------

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState([]);

  const addExpense = () => {
    if (!title || !amount) return;
    setExpenses([
      ...expenses,
      { id: Date.now(), title, amount: Number(amount) },
    ]);
    setTitle("");
    setAmount("");
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

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
      {/* LOGIN PAGE */}
      {page === "login" && (
        <div className="card">
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="primary-btn" onClick={handleLogin}>
            Login
          </button>
          <p>
            Don't have account?{" "}
            <span
              className="link"
              onClick={() => setPage("register")}
            >
              Register
            </span>
          </p>
        </div>
      )}

      {/* REGISTER PAGE */}
      {page === "register" && (
        <div className="card">
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="primary-btn" onClick={handleRegister}>
            Register
          </button>
          <p>
            Already have account?{" "}
            <span
              className="link"
              onClick={() => setPage("login")}
            >
              Login
            </span>
          </p>
        </div>
      )}

      {/* DASHBOARD */}
      {page === "dashboard" && isLoggedIn && (
        <div className="card">
          <div className="top-bar">
            <button onClick={() => setPage("split")}>
              Split Expenses
            </button>
            <div>
              <button onClick={handleLogout}>Logout</button>
              <button
                className="danger-btn"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </div>

          <h2>Expense Dashboard</h2>

          <input
            type="text"
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
            <div key={exp.id} className="expense-item">
              {exp.title} - ₹{exp.amount}
              <button
                className="danger-btn"
                onClick={() => deleteExpense(exp.id)}
              >
                X
              </button>
            </div>
          ))}

          <h3>Total: ₹{total}</h3>
        </div>
      )}

      {/* SPLIT PAGE */}
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
