const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
    {
        pin: Number,
        name: String,
        email: String,
        phone: String,
        savings: Array,
        account_number: String,
        bank_code: String,
        verified: Boolean,
        userToken: String,
        resetPasswordExpire: Date,
        password: String
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", UserSchema);
