import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const API = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  // ================= LOGIN =================
  const login = async () => {
    try {
      const res = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setExpenses([]);
  };

  // ================= FETCH EXPENSES =================
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (token) fetchExpenses();
  }, [token]);

  // ================= ADD EXPENSE =================
  const addExpense = async () => {
    if (!title || !amount) return;

    await axios.post(
      `${API}/expenses`,
      { title, amount, category },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setTitle("");
    setAmount("");
    fetchExpenses();
  };

  // ================= DELETE =================
  const deleteExpense = async (id) => {
    await axios.delete(`${API}/expenses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchExpenses();
  };

  // ================= UPDATE =================
  const updateExpense = async (id) => {
    const newTitle = prompt("Enter new title:");
    const newAmount = prompt("Enter new amount:");

    if (!newTitle || !newAmount) return;

    await axios.put(
      `${API}/expenses/${id}`,
      {
        title: newTitle,
        amount: newAmount,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchExpenses();
  };

  // ================= SEARCH + FILTER =================
  const filteredExpenses = expenses
    .filter((exp) =>
      exp.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((exp) =>
      filter ? exp.category === filter : true
    );

  // ================= TOTAL =================
  const total = filteredExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0
  );

  // ================= CHART DATA =================
  const categoryTotals = {};

  expenses.forEach((exp) => {
    if (!categoryTotals[exp.category]) {
      categoryTotals[exp.category] = 0;
    }
    categoryTotals[exp.category] += Number(exp.amount);
  });

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4CAF50",
        ],
      },
    ],
  };

  // ================= LOGIN SCREEN =================
  if (!token) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Login</h2>
        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />
        <button onClick={login}>Login</button>
      </div>
    );
  }

  // ================= MAIN UI =================
  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h2>Expense Tracker</h2>
          <button className="logout" onClick={logout}>
            Logout
          </button>
        </div>

        {/* ADD EXPENSE */}
        <div className="add-section">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Bills">Bills</option>
            <option value="Shopping">Shopping</option>
          </select>

          <button onClick={addExpense}>Add</button>
        </div>

        {/* SEARCH + FILTER */}
        <div className="search-filter">
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Bills">Bills</option>
            <option value="Shopping">Shopping</option>
          </select>
        </div>

        {/* TOTAL */}
        <h3>Total: ₹{total}</h3>

        {/* LIST */}
        <div className="expense-list">
          {filteredExpenses.map((exp) => (
            <div key={exp._id} className="expense-item">
              <span>
                {exp.title} - ₹{exp.amount} ({exp.category})
              </span>
              <div>
                <button onClick={() => updateExpense(exp._id)}>
                  ✏️
                </button>
                <button
                  className="delete"
                  onClick={() => deleteExpense(exp._id)}
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PIE CHART */}
        <div style={{ marginTop: 20 }}>
          <Pie data={chartData} />
        </div>
      </div>
    </div>
  );
}

export default App;
