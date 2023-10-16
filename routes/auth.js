const express = require("express");
const { register, login } = require("../controllers/authController");

const router = require("express").Router();

router.post("/signup", register);

router.post("/signin", login);

module.exports = router;
