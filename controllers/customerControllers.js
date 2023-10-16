const Customer = require("../models/CustomerModel");
const asyncHandler = require("express-async-handler");

// Create a new customer
const createCustomer = asyncHandler(async (req, res) => {
  const { fullName, email, phoneNumber, address } = req.body;
  if (!fullName || !email || !phoneNumber) {
    throw Object.assign(new Error("All fields are required"), { status: 400 });
  }
  const userAvailble = await Customer.findOne({ email });
  if (userAvailble) {
    throw Object.assign(new Error("customer already registered"), {
      status: 400,
    });
  }

  const customer = await Customer.create({
    fullName,
    email,
    phoneNumber,
    address,
    staffId: req.user.id,
  });

  if (customer) {
    res.status(201).json({ customer });
  } else {
    throw Object.assign(new Error("Data is not valid"), { status: 400 });
  }
});

// Get all customers
const getAllCustomers = asyncHandler(async (req, res) => {
  const { name, email, id, sortBy, sortOrder, page } = req.query;
  const filter = {};
  if (name) {
    filter.fullName = { $regex: new RegExp(name, "i") };
  }
  if (email) {
    filter.email = { $regex: new RegExp(email, "i") };
  }
  if (id) {
    filter._id = id;
  }
  const pageSize = 10;
  const pageNumber = page || 1;
  const skip = (pageNumber - 1) * pageSize;
  const limit = parseInt(pageSize);
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  }
  const total = await Customer.countDocuments(filter);
  const customers = await Customer.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const Pages = Math.ceil(total / pageSize);

  res.json({
    customers,
    Pages,
    Page: page || 1,
  });
});
const userProjection = {
  password: 0,
  updatedAt: 0,
  createdAt: 0,
};
// Get a specific customer by ID
const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id).populate({
    path: "staffId",
    select: userProjection,
  });
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }
  res.json(customer);
});

// Update a customer by ID
const updateCustomer = asyncHandler(async (req, res) => {
  let customer = await Customer.findById(req.params.id);
  if (!customer) {
    throw Object.assign(new Error("customer not found"), { status: 404 });
  }
  const updateCustomer = await Customer.findByIdAndUpdate(req.params.id, {
    $set: req.body,
  });
  res.status(200).json({
    success: true,
    message: "the customer has been updated",
    updateCustomer,
  });
});

// Delete a customer by ID
const deleteCustomer = asyncHandler(async (req, res) => {
  let customer = await Customer.findById(req.params.id);
  if (!customer) {
    throw Object.assign(new Error("customer not found"), { status: 404 });
  }
  const deletedCustomer = await Customer.findByIdAndRemove(req.params.id);
  if (!deletedCustomer) {
    return res.status(404).json({ message: "Customer not found" });
  }
  res.json({ message: "Customer deleted" });
});

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
