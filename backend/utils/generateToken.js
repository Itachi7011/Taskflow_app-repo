// utils/generateToken.js
const jwt = require("jsonwebtoken");

// signs a jwt with just the userId and role in it, keep the payload small
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;
