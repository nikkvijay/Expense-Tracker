const Expense = require("../models/Expenses");
const mongoose = require("mongoose");
const ErrorResponse = require("../utils/errorHandler");

exports.createExpense = async (req, res, next) => {
  try {
    const { category, amount, comments, date, paymentMethod } = req.body;
    if (!category || !amount) {
      throw new ErrorResponse("Category and amount are required", 400);
    }
    if (!req.user || !req.user.id) {
      throw new ErrorResponse("User not authenticated", 401);
    }

    const expense = new Expense({
      user: req.user.id, // Changed from userId to user to match schema
      category,
      amount,
      comments,
      paymentMethod: paymentMethod || 'card',
      date: date ? new Date(date) : new Date(),
    });

    await expense.save();

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Create expense error:", error);
    next(error);
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      throw new ErrorResponse("User not authenticated", 401);
    }
    const expenses = await Expense.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);
    next(error);
  }
};

exports.getDistribution = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      throw new ErrorResponse("User not authenticated", 401);
    }
    const distribution = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json(distribution);
  } catch (error) {
    console.error("Get distribution error:", error);
    next(error);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, amount, comments, date, paymentMethod } = req.body;

    if (typeof id !== "string") {
      throw new ErrorResponse("Expense ID must be a string", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorResponse("Invalid expense ID format", 400);
    }
    if (!req.user || !req.user.id) {
      throw new ErrorResponse("User not authenticated", 401);
    }

    const updateData = {
      category,
      amount,
      comments,
      updatedAt: Date.now()
    };
    
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }
    
    if (date) {
      updateData.date = new Date(date);
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!expense) {
      throw new ErrorResponse("Expense not found", 404);
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Update expense error:", error);
    next(error);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      throw new ErrorResponse("Expense ID must be a string", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorResponse("Invalid expense ID format", 400);
    }
    if (!req.user || !req.user.id) {
      throw new ErrorResponse("User not authenticated", 401);
    }

    const expense = await Expense.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!expense) {
      throw new ErrorResponse("Expense not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error);
    next(error);
  }
};
