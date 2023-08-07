const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String , required: true},
  email: { type: String , required: true , unique: true},
  age: { type: String , required: true},
  cnic: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  userType: { type: String, required: true },
  password: { type: String, required: true },
}, { collection: "user-data" });

const User = mongoose.model('usersData', UserSchema);

module.exports = User;
