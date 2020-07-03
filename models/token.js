const mongoose = require("mongoose");


const refreshToken = new mongoose.Schema({
    value: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("RefreshToken", refreshToken);