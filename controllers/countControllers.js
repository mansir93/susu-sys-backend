const asyncHandler = require("express-async-handler");
const Transaction = require("../models/TransactionModel");
const Customer = require("../models/CustomerModel");

// Define a route to get the combined summary
exports.getCounts = asyncHandler(async (req, res) => {
  const [customers, transactions] = await Promise.all([
    Customer.find(),
    Transaction.find(),
  ]);

  const totalCustomers = customers.length;
  const totalTransactions = transactions.length;

  let totalDeposits = 0;
  let totalWithdrawals = 0;

  for (const transaction of transactions) {
    if (transaction.type === "deposit") {
      totalDeposits += transaction.amount;
    } else if (transaction.type === "withdrawal") {
      totalWithdrawals += transaction.amount;
    }
  }

  let totalAccountBalance = 0;

  for (const customer of customers) {
    totalAccountBalance += customer.accountBalance;
  }

  const averageAccountBalance =
    (totalAccountBalance / totalCustomers).toFixed(2) || 0;

  const counts = {
    totalCustomers,
    totalTransactions,
    totalAccountBalance,
    averageAccountBalance,
    totalDeposits,
    totalWithdrawals,
  };

  res.json({ counts: counts });
});
