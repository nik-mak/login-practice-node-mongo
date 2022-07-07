const mongoose = require("../config/database") 

const UserModel = mongoose.model(
  "User",
  new mongoose.Schema({
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String, default: "customer" },
  })
)

module.exports = UserModel