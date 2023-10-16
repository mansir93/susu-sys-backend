const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

require("dotenv").config();

const connectDB = require("./config/dbConnection");
const ErrorHandler = require("./middleware/errorHandler");
const { swaggerUiServe, swaggerUiSetup } = require("./config/SwaggerConfig");
const session = require("express-session");
const authRoutes = require("./routes/auth");
const countRoutes = require("./routes/countRoutes");
const transactionRoutes = require("./routes/TransactionRoutes");
const customerRoutes = require("./routes/customerRoutes");

const PORT = process.env.PORT || 5001;
const app = express();
connectDB();

app.use(
  session({
    secret: process.env.TOKEN_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Enable CORS for all routes
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://susu-sys-frontend.vercel.app",
  ],
  credentials: true,
  exposedHeaders: ["Authorization"],
};
app.use(cors(corsOptions));

// middleware

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// routes
app.use("/api/auth/", authRoutes);
app.use("/api/counts/", countRoutes);
app.use("/api/transactions/", transactionRoutes);
app.use("/api/customers/", customerRoutes);

app.use("/", swaggerUiServe, swaggerUiSetup);
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found. Please check the URL." });
});

app.use(ErrorHandler);
app.listen(PORT, () => {
  console.log(`server running on Port ${PORT}`);
});
