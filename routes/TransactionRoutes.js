const express = require("express");
const router = express.Router();

const { isAuthenticated } = require("../middleware/auth");
const {
  createTransaction,
  getRecentTransactions,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionControllers");

// Define transaction routes
router.post("/", isAuthenticated, createTransaction);

router.get("/recent", isAuthenticated, getRecentTransactions);

router.get("/", isAuthenticated, getAllTransactions);

router.get("/:id", isAuthenticated, getTransactionById);

router.put("/:id", isAuthenticated, updateTransaction);

router.delete("/:id", isAuthenticated, deleteTransaction);

module.exports = router;
