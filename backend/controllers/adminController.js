// controllers/adminController.js
//
// kept intentionally small - assignment doesnt ask for a full admin
// system, this is just enough for an admin to see whats going on across
// all users, mainly for demo/monitoring purposes
const Task = require("../models/Task");
const User = require("../models/User");

// GET /api/admin/tasks
// every task, from every user, newest first. populate owner name/email
// so the admin table can show who ran what
exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({})
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .limit(500); // just a sane cap, this is a dashboard not an export tool

    res.status(200).json({ status: "success", count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ status: "success", count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/stats
// tiny summary block for the admin dashboard cards
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTasks, pending, running, success, failed] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: "pending" }),
      Task.countDocuments({ status: "running" }),
      Task.countDocuments({ status: "success" }),
      Task.countDocuments({ status: "failed" }),
    ]);

    res.status(200).json({
      status: "success",
      stats: { totalUsers, totalTasks, pending, running, success, failed },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id/block
exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({ status: "success", user: user.getPublicProfile(), isBlocked: user.isBlocked });
  } catch (err) {
    next(err);
  }
};
