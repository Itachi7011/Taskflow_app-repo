// controllers/taskController.js
const Task = require("../models/Task");
const { OPERATION_TYPES } = require("../models/Task");
const { pushTaskToQueue } = require("../queues/taskQueue");

// POST /api/tasks
// this is basically the "Run Task" button on the frontend - it creates
// the task record AND pushes it to the queue in one go, per the workflow
// in the assignment (create with status pending -> push to redis)
exports.createTask = async (req, res, next) => {
  try {
    const { title, inputText, operationType } = req.body;

    if (!title || !inputText || !operationType) {
      return res.status(400).json({
        status: "error",
        message: "title, inputText and operationType are all required",
      });
    }

    if (!OPERATION_TYPES.includes(operationType)) {
      return res.status(400).json({
        status: "error",
        message: `operationType must be one of: ${OPERATION_TYPES.join(", ")}`,
      });
    }

    const task = await Task.create({
      owner: req.user._id,
      title,
      inputText,
      operationType,
      status: "pending",
      logs: ["Task created and queued"],
    });

    // push AFTER the mongo doc is saved, so the worker can always find it
    await pushTaskToQueue(task._id);

    res.status(201).json({ status: "success", task });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks
// returns only the logged in user's own tasks, newest first
exports.getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ status: "success", count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

    if (!task) {
      return res.status(404).json({ status: "error", message: "Task not found" });
    }

    res.status(200).json({ status: "success", task });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks/:id/rerun
// lets a user re-queue a failed (or even successful) task without retyping everything
exports.rerunTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

    if (!task) {
      return res.status(404).json({ status: "error", message: "Task not found" });
    }

    task.status = "pending";
    task.result = null;
    task.errorMessage = null;
    task.logs.push("Task re-queued by user");
    await task.save();

    await pushTaskToQueue(task._id);

    res.status(200).json({ status: "success", task });
  } catch (err) {
    next(err);
  }
};
