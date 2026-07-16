// config/db.js
// just a small wrapper so app.js doesnt look messy with mongoose stuff inline
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log("Mongo connected ->", mongoose.connection.host);
  } catch (err) {
    // if db doesnt connect theres no point running the server at all
    console.error("Mongo connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
