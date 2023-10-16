const Transaction = require("../models/TransactionModel");
const Customer = require("../models/CustomerModel");
const asyncHandler = require("express-async-handler");

const userProjection = {
  password: 0,
  updatedAt: 0,
  createdAt: 0,
  accountBalance: 0,
};

// Create a new transaction
const createTransaction = asyncHandler(async (req, res) => {
  const { customerId, amount, type } = req.body;
  // const staffId = req.user.id;
  const customer = await Customer.findById(customerId);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  if (type === "deposit") {
    customer.accountBalance =
      parseFloat(customer.accountBalance) + parseFloat(amount);
  } else if (type === "withdrawal") {
    if (parseFloat(customer.accountBalance) < parseFloat(amount)) {
      return res.status(400).json({ message: "Insufficient account balance" });
    }
    customer.accountBalance =
      parseFloat(customer.accountBalance) - parseFloat(amount);
  } else {
    return res.status(400).json({ message: "Invalid transaction type" });
  }
  const transaction = new Transaction({
    customerId,
    amount,
    type,
    staffId: req.user.id,
  });
  const savedTransaction = await transaction.save();
  await customer.save();

  res.status(201).json(savedTransaction);
});

const getRecentTransactions = asyncHandler(async (req, res) => {
  const recentTransactions = await Transaction.find()
    .sort({ timestamp: -1 })
    .limit(10);
  res.json(recentTransactions);
});
const getAllTransactions = asyncHandler(async (req, res) => {
  const { id, type, customerId, staffId, amount, page } = req.query;

  const filter = {};
  if (id) {
    filter._id = id;
  }
  if (type) {
    filter.type = type;
  }

  if (customerId) {
    filter.customerId = customerId;
  }
  if (staffId) {
    filter.staffId = staffId;
  }

  if (amount) {
    filter.amount = amount;
  }
  const pageSize = 10;
  const pageNumber = page || 1;
  const skip = (pageNumber - 1) * pageSize;
  const limit = parseInt(pageSize);
  const total = await Transaction.countDocuments(filter);
  const transactions = await Transaction.find(filter)
    .populate({
      path: "staffId",
      select: userProjection,
    })
    .populate({
      path: "customerId",
      select: userProjection,
    })
    .skip(skip)
    .limit(limit)
    .exec();
  const Pages = Math.ceil(total / pageSize);

  res.json({
    transactions,
    Pages,
    Page: page || 1,
  });
});

// Get a specific transaction by ID
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate({
      path: "staffId",
      select: userProjection,
    })
    .populate({
      path: "customerId",
      select: userProjection,
    });
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  res.json(transaction);
});

// Update a transaction by ID
const updateTransaction = asyncHandler(async (req, res) => {
  const { amount, type } = req.body;

  const updatedTransaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    { amount, type },
    { new: true }
  );

  if (!updatedTransaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  if (type === "deposit") {
    const customer = await Customer.findById(updatedTransaction.customerId);
    if (customer) {
      customer.accountBalance =
        parseFloat(customer.accountBalance) -
        parseFloat(updatedTransaction.amount);
      customer.accountBalance =
        parseFloat(customer.accountBalance) + parseFloat(amount);
      await customer.save();
    }
  }
  if (type === "withdrawal") {
    const customer = await Customer.findById(updatedTransaction.customerId);
    if (customer) {
      if (customer.accountBalance < amount) {
        return res
          .status(400)
          .json({ message: "Insufficient account balance" });
      }
      customer.accountBalance =
        parseFloat(customer.accountBalance) +
        parseFloat(updatedTransaction.amount);
      customer.accountBalance =
        parseFloat(customer.accountBalance) - parseFloat(amount);
      await customer.save();
    }
  }

  res.json(updatedTransaction);
});

// Delete a transaction by ID
const deleteTransaction = asyncHandler(async (req, res) => {
  const deletedTransaction = await Transaction.findByIdAndRemove(req.params.id);
  if (!deletedTransaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  if (deletedTransaction.type === "deposit") {
    const customer = await Customer.findById(deletedTransaction.customerId);
    if (customer) {
      customer.accountBalance =
        parseFloat(customer.accountBalance) -
        parseFloat(deletedTransaction.amount);
      await customer.save();
    }
  }
  if (deletedTransaction.type === "withdrawal") {
    const customer = await Customer.findById(deletedTransaction.customerId);
    if (customer) {
      customer.accountBalance =
        parseFloat(customer.accountBalance) +
        parseFloat(deletedTransaction.amount);
      await customer.save();
    }
  }

  res.json({ message: "Transaction deleted" });
});

module.exports = {
  createTransaction,
  getRecentTransactions,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
