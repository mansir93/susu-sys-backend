const ErrorResponse = require("../utils/errorResponse");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

exports.isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.Authorization || req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new ErrorResponse("Authorization header is missing or invalid", 401)
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    // console.log(decoded);
    const user = await User.findById(decoded.user.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(
      new ErrorResponse(
        "Invalid Token: Not authorized to access this route",
        401
      )
    );
  }
};
