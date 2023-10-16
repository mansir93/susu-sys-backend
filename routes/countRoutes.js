const express = require("express");
const router = express.Router();

const { isAuthenticated } = require("../middleware/auth");
const { getCounts } = require("../controllers/countControllers");

router.get("/", isAuthenticated, getCounts);

module.exports = router;


