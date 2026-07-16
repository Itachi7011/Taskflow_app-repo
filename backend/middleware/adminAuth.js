// middleware/adminAuth.js
// this must run AFTER the protect middleware, it just checks the role
// that protect already attached to req.user
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "Restricted area, admins only",
    });
  }
  next();
};

module.exports = adminOnly;
