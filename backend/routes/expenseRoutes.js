const express = require("express");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// DELETE expense by id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// GET all expenses (protected)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ADD expense (protected)
router.post("/", authMiddleware, async (req, res) => {
  const { title, amount } = req.body;

  try {
    const expense = await Expense.create({
      title,
      amount,
      user: req.user.id,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: "Invalid data" });
  }
});

// Update expense
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.title = req.body.title || expense.title;
    expense.amount = req.body.amount || expense.amount;

    const updatedExpense = await expense.save();

    res.json(updatedExpense);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
