const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

// register
exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber } = req.body;

  if (!firstName || !lastName || !email || !password || !phoneNumber) {
    throw Object.assign(new Error("All fields are required"), { status: 400 });
  }
  const userAvailble = await User.findOne({ email });
  if (userAvailble) {
    throw Object.assign(new Error("user already registered"), { status: 400 });
  }

  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phoneNumber,
  });
  if (user) {
    res.status(201).json({ user });
  } else {
    throw Object.assign(new Error("Data is not valid"), { status: 400 });
  }
});

// login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw Object.assign(new Error("All fields are required"), { status: 400 });
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw Object.assign(new Error("user not found"), { status: 404 });
  }
  // compare password with hashPassword
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        },
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "5d" }
    );
    res.status(200).json({ token });
  } else {
    throw Object.assign(new Error("password Incorrect"), { status: 401 });
  }
});
