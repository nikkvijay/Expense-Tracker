const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [0, "Amount must be positive"],
  },
  comments: {
    type: String,
    trim: true,
  },
  paymentMethod: {
    type: String,
    required: [true, "Payment method is required"],
    enum: ['card', 'cash', 'account', 'digital'],
    default: 'card',
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

expenseSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Expense", expenseSchema);
