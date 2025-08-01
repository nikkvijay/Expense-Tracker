const Income = require("../models/Income");
const mongoose = require("mongoose");
const ErrorResponse = require("../utils/errorHandler");

exports.createIncome = async (req, res, next) => {
  try {
    const { source, amount, description, date, isRecurring, frequency } = req.body;
    if (!source || !amount) {
      throw new ErrorResponse("Source and amount are required", 400);
    }
    if (!req.user || !req.user.id) {
      throw new ErrorResponse("User not authenticated", 401);
    }

    const income = new Income({
      user: req.user.id,
      source,
      amount,
      description,
      date: date ? new Date(date) : new Date(),
      isRecurring: isRecurring || false,
      frequency: frequency || 'monthly',
    });

    await income.save();

    res.status(201).json({
      success: true,
      data: income,
    });
  } catch (error) {
    console.error("Create income error:", error);
    next(error);
  }
};

exports.getIncomes = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      throw new ErrorResponse("User not authenticated", 401);
    }
    const incomes = await Income.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(incomes);
  } catch (error) {
    console.error("Get incomes error:", error);
    next(error);
  }
};

exports.getTotalIncome = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      throw new ErrorResponse("User not authenticated", 401);
    }
    
    const { month, year } = req.query;
    let matchCondition = { user: new mongoose.Types.ObjectId(req.user.id) };
    
    // If month and year are provided, filter by that month
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      matchCondition.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const totalIncome = await Income.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({
      total: totalIncome.length > 0 ? totalIncome[0].total : 0
    });
  } catch (error) {
    console.error("Get total income error:", error);
    next(error);
  }
};

exports.updateIncome = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { source, amount, description, date, isRecurring, frequency } = req.body;

    if (typeof id !== "string") {
      throw new ErrorResponse("Income ID must be a string", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorResponse("Invalid income ID format", 400);
    }
    if (!req.user || !req.user.id) {
      throw new ErrorResponse("User not authenticated", 401);
    }

    const updateData = {
      source,
      amount,
      description,
      isRecurring,
      frequency,
      updatedAt: Date.now()
    };
    
    if (date) {
      updateData.date = new Date(date);
    }

    const income = await Income.findOneAndUpdate(
      { _id: id, user: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!income) {
      throw new ErrorResponse("Income not found", 404);
    }

    res.status(200).json({
      success: true,
      data: income,
    });
  } catch (error) {
    console.error("Update income error:", error);
    next(error);
  }
};

exports.deleteIncome = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      throw new ErrorResponse("Income ID must be a string", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorResponse("Invalid income ID format", 400);
    }
    if (!req.user || !req.user.id) {
      throw new ErrorResponse("User not authenticated", 401);
    }

    const income = await Income.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!income) {
      throw new ErrorResponse("Income not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Income deleted successfully",
    });
  } catch (error) {
    console.error("Delete income error:", error);
    next(error);
  }
};