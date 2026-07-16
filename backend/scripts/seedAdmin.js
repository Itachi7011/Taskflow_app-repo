require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function seedAdmin() {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment before running this script.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (admin) {
    if (admin.role === "admin") {
      console.log(`${ADMIN_EMAIL} is already an admin. Nothing to do.`);
    } else {
      admin.role = "admin";
      await admin.save();
      console.log(`Promoted existing user ${ADMIN_EMAIL} to admin.`);
    }
  } else {
    admin = new User({
      name: ADMIN_NAME || "Admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // pre-save hook hashes it, same as normal signup
      role: "admin",
      emailVerified: true,
    });
    await admin.save();
    console.log(`Created first admin account: ${ADMIN_EMAIL}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});