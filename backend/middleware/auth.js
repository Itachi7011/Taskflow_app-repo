// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// protects routes, expects "Authorization: Bearer <token>" header
// (also checks the cookie as a fallback incase frontend stores it there)
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ status: "error", message: "Not authorized, no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ status: "error", message: "User belonging to this token no longer exists" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ status: "error", message: "This account has been blocked" });
    }

    req.user = user;
    next();
  } catch (err) {
    // jwt.verify throws if token is expired / tampered with
    return res.status(401).json({ status: "error", message: "Not authorized, token invalid or expired" });
  }
};

module.exports = protect;
