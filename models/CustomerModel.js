const mongoose = require("mongoose");
const uuid = require("uuid");

const CustomerSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      // required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    accountBalance: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Customer", CustomerSchema);
