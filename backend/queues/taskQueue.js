// queues/taskQueue.js
//
// keeping this super plain on purpose - just a redis LIST, not bullmq or
// anything fancy. reason is the worker is written in python, and a plain
// list that both sides speak (LPUSH from node, BRPOP from python) is way
// less of a headache than trying to share a node only queue library
// across two different languages.
const { redisClient } = require("../config/redis");

const QUEUE_NAME = process.env.TASK_QUEUE_NAME || "taskflow:task-queue";

// we only push the task id, not the whole task object. worker will go
// fetch the full doc from mongo itself when it picks the job up, this
// way mongo always stays the single source of truth for task data
const pushTaskToQueue = async (taskId) => {
  // isReady (not isOpen!) is the correct check here - isOpen can be true
  // even while the socket is mid-reconnect, before its actually able to
  // accept commands. checking isOpen instead would let a command through
  // while reconnecting and bring back the exact "client is closed" style
  // error this bypass is meant to avoid.
  if (redisClient.isReady) {
    // normal path - redis is up, the python worker picks this up via BRPOP.
    // this line never changes regardless of the fallback below.
    await redisClient.lPush(QUEUE_NAME, JSON.stringify({ taskId: taskId.toString() }));
    return;
  }

  // ---- bypass path: redis isnt available (disabled, or just unreachable) ----
  // rather than failing the request, process the task right here in node
  // instead of queuing it for a worker that isnt going to get it anyway.
  // this keeps the whole app usable without redis or a running python
  // worker at all - the moment redis IS available again, the branch
  // above takes over automatically and this path is never touched.
  console.warn(`Redis not available - processing task ${taskId} directly in the backend instead of queuing it`);
  await processTaskInline(taskId);
};

// mimics what worker/worker.py's process_task does, just in plain node
// instead of python + BRPOP. only ever called from the bypass path above.
const processTaskInline = async (taskId) => {
  // required here instead of at the top of the file to avoid a require
  // cycle - models/Task.js has no idea this queue module exists, only
  // this one fallback function needs it
  const Task = require("../models/Task");
  const { runOperation } = require("../utils/textOperations");

  const task = await Task.findById(taskId);
  if (!task) {
    console.warn(`Task ${taskId} not found, skipping in-process fallback`);
    return;
  }

  task.status = "running";
  task.startedAt = new Date();
  task.logs.push("Redis unavailable - task processed directly by the backend instead of a worker");
  await task.save();

  try {
    const result = runOperation(task.operationType, task.inputText);
    task.status = "success";
    task.result = result;
    task.finishedAt = new Date();
    task.logs.push("Operation completed successfully (in-process fallback)");
  } catch (err) {
    task.status = "failed";
    task.errorMessage = err.message;
    task.finishedAt = new Date();
    task.logs.push(`Task failed: ${err.message}`);
  }
  await task.save();
};

module.exports = { pushTaskToQueue, QUEUE_NAME };