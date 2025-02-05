const IncomeSchema = require("../models/incomeModel");

exports.addIncome = async (req, res) => {
  const { title, amount, category, description, date } = req.body;

  
  try {
    //validations
    if (!title || !amount || !category || !description || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const income = IncomeSchema({
      title,
      amount,
      category,
      description,
      date,
      user: req.user.id
    });

    if (amount < 0 || !amount === Number) {
      return res.status(400).json({ message: "Amount cannot be negative" });
    }
    await income.save();
    res.status(201).json({ message: "Income added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIncomes = async (req, res) => {
  try {
    const incomes = await IncomeSchema.find({user: req.user.id}).sort({ createdAt: -1 });
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.deleteIncome = async (req, res) => {
  const { id } = req.params;
  IncomeSchema.findByIdAndDelete(id)
    .then((income) => {
      res.status(200).json({ message: "Income deleted successfully" });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};
