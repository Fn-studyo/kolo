const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    savings: Array,
    account_number: String,
    bank_code: String,
    verified: Boolean,
    userToken: String,
      pin: Number,
    resetPasswordExpire: Date,
    password: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", UserSchema);
