// routes/taskRoutes.js
const express = require("express");
const router = express.Router();

const { createTask, getMyTasks, getTaskById, rerunTask } = require("../controllers/taskController");
const protect = require("../middleware/auth");

// every route here needs a logged in user, so just protect the whole router
router.use(protect);

router.post("/", createTask);
router.get("/", getMyTasks);
router.get("/:id", getTaskById);
router.post("/:id/rerun", rerunTask);

module.exports = router;
