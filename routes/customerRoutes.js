const express = require("express");
const router = express.Router();

const { isAuthenticated } = require("../middleware/auth");
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerControllers");

router.post("/", isAuthenticated, createCustomer);

router.get("/", isAuthenticated, getAllCustomers);

router.get("/:id", isAuthenticated, getCustomerById);

router.put("/:id", isAuthenticated, updateCustomer);

router.delete("/:id", isAuthenticated, deleteCustomer);

module.exports = router;
