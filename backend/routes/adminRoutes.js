// routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const { getAllTasks, getAllUsers, getStats, toggleBlockUser } = require("../controllers/adminController");
const protect = require("../middleware/auth");
const adminOnly = require("../middleware/adminAuth");

router.use(protect, adminOnly);

router.get("/tasks", getAllTasks);
router.get("/users", getAllUsers);
router.get("/stats", getStats);
router.patch("/users/:id/block", toggleBlockUser);

module.exports = router;
