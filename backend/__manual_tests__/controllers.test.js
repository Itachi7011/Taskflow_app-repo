// __manual_tests__/controllers.test.js
//
// these tests monkeypatch the static/prototype methods on the actual
// User and Task model objects (findOne, save, etc) instead of hitting a
// real mongo connection. its not a full integration test, but it does
// exercise every branch (validation, error paths, status codes) in the
// controllers exactly the way express would call them.
process.env.APP_NAME = process.env.APP_NAME || "TaskFlow";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_for_local_checks";
process.env.ADMIN_SIGNUP_CODE = "correct-code";

const assert = require("assert");
const { mockRes, mockNext } = require("./mockHttp");

const User = require("../models/User");
const Task = require("../models/Task");
const authController = require("../controllers/authController");
const taskController = require("../controllers/taskController");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/auth");
const adminOnly = require("../middleware/adminAuth");
const errorHandler = require("../middleware/errorHandler");
const { redisClient } = require("../config/redis");

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`PASS: ${name}`);
  } catch (err) {
    failed++;
    console.log(`FAIL: ${name}`);
    console.log("   ", err.message);
  }
}

async function main() {
  // ---------- authController.register ----------

  await test("register: missing fields returns 400", async () => {
    const req = { body: { email: "a@a.com" } };
    const res = mockRes();
    await authController.register(req, res, mockNext());
    assert.strictEqual(res.statusCode, 400);
  });

  await test("register: short password returns 400", async () => {
    const req = { body: { name: "A", email: "a@a.com", password: "short" } };
    const res = mockRes();
    await authController.register(req, res, mockNext());
    assert.strictEqual(res.statusCode, 400);
  });

  await test("register: existing email returns 400", async () => {
    User.findOne = async () => ({ _id: "existing" });
    const req = { body: { name: "A", email: "a@a.com", password: "longenough1" } };
    const res = mockRes();
    await authController.register(req, res, mockNext());
    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.body.message.includes("already exists"));
  });

  await test("register: wrong adminCode returns 403 and does not create user", async () => {
    User.findOne = async () => null;
    let saveCalled = false;
    User.prototype.save = async function () { saveCalled = true; return this; };
    const req = { body: { name: "A", email: "a@a.com", password: "longenough1", adminCode: "wrong-code" } };
    const res = mockRes();
    await authController.register(req, res, mockNext());
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(saveCalled, false, "should never save a user when the admin code is wrong");
  });

  await test("register: correct adminCode creates an admin user", async () => {
    User.findOne = async () => null;
    User.prototype.save = async function () { return this; };
    User.prototype.generateEmailVerificationToken = function () { return "tok123"; };
    const req = { body: { name: "A", email: "admin@a.com", password: "longenough1", adminCode: "correct-code" } };
    const res = mockRes();
    await authController.register(req, res, mockNext());
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.user.role, "admin");
    assert.ok(res.body.token, "expected a jwt token in the response");
  });

  await test("register: normal signup (no adminCode) gets role user", async () => {
    User.findOne = async () => null;
    User.prototype.save = async function () { return this; };
    User.prototype.generateEmailVerificationToken = function () { return "tok123"; };
    const req = { body: { name: "A", email: "user@a.com", password: "longenough1" } };
    const res = mockRes();
    await authController.register(req, res, mockNext());
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.user.role, "user");
  });

  // ---------- authController.login ----------

  await test("login: missing fields returns 400", async () => {
    const req = { body: { email: "a@a.com" } };
    const res = mockRes();
    await authController.login(req, res, mockNext());
    assert.strictEqual(res.statusCode, 400);
  });

  await test("login: unknown user returns 401", async () => {
    User.findOne = () => ({ select: async () => null });
    const req = { body: { email: "nope@a.com", password: "whatever1" } };
    const res = mockRes();
    await authController.login(req, res, mockNext());
    assert.strictEqual(res.statusCode, 401);
  });

  await test("login: blocked user returns 403", async () => {
    User.findOne = () => ({ select: async () => ({ isBlocked: true }) });
    const req = { body: { email: "blocked@a.com", password: "whatever1" } };
    const res = mockRes();
    await authController.login(req, res, mockNext());
    assert.strictEqual(res.statusCode, 403);
  });

  await test("login: wrong password returns 401", async () => {
    User.findOne = () => ({
      select: async () => ({ isBlocked: false, comparePassword: async () => false }),
    });
    const req = { body: { email: "user@a.com", password: "wrongpass1" } };
    const res = mockRes();
    await authController.login(req, res, mockNext());
    assert.strictEqual(res.statusCode, 401);
  });

  await test("login: correct credentials returns 200 with a token", async () => {
    User.findOne = () => ({
      select: async () => ({
        _id: "u1",
        role: "user",
        isBlocked: false,
        comparePassword: async () => true,
        save: async function () { return this; },
        getPublicProfile() { return { id: "u1", role: "user" }; },
      }),
    });
    const req = { body: { email: "user@a.com", password: "rightpass1" } };
    const res = mockRes();
    await authController.login(req, res, mockNext());
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.token);
  });

  // ---------- authController.verifyEmail / forgotPassword / resetPassword ----------

  await test("verifyEmail: invalid/expired token returns 400", async () => {
    User.findOne = async () => null;
    const req = { params: { token: "bad" } };
    const res = mockRes();
    await authController.verifyEmail(req, res, mockNext());
    assert.strictEqual(res.statusCode, 400);
  });

  await test("verifyEmail: valid token returns 200", async () => {
    User.findOne = async () => ({ save: async function () { return this; } });
    const req = { params: { token: "good" } };
    const res = mockRes();
    await authController.verifyEmail(req, res, mockNext());
    assert.strictEqual(res.statusCode, 200);
  });

  await test("forgotPassword: unknown email still returns 200 (no user enumeration)", async () => {
    User.findOne = async () => null;
    const req = { body: { email: "ghost@a.com" } };
    const res = mockRes();
    await authController.forgotPassword(req, res, mockNext());
    assert.strictEqual(res.statusCode, 200);
  });

  await test("resetPassword: weak password returns 400", async () => {
    const req = { params: { token: "x" }, body: { password: "short" } };
    const res = mockRes();
    await authController.resetPassword(req, res, mockNext());
    assert.strictEqual(res.statusCode, 400);
  });

  await test("resetPassword: invalid token returns 400", async () => {
    User.findOne = () => ({ select: async () => null });
    const req = { params: { token: "bad" }, body: { password: "longenough1" } };
    const res = mockRes();
    await authController.resetPassword(req, res, mockNext());
    assert.strictEqual(res.statusCode, 400);
  });

  await test("resetPassword: valid token returns 200", async () => {
    User.findOne = () => ({ select: async () => ({ save: async function () { return this; } }) });
    const req = { params: { token: "good" }, body: { password: "longenough1" } };
    const res = mockRes();
    await authController.resetPassword(req, res, mockNext());
    assert.strictEqual(res.statusCode, 200);
  });

  // ---------- taskController ----------

  await test("createTask: missing fields returns 400", async () => {
    const req = { body: { title: "x" }, user: { _id: "u1" } };
    const res = mockRes();
    await taskController.createTask(req, res, mockNext());
    assert.strictEqual(res.statusCode, 400);
  });

  await test("createTask: invalid operationType returns 400", async () => {
    const req = { body: { title: "x", inputText: "y", operationType: "not_real" }, user: { _id: "u1" } };
    const res = mockRes();
    await taskController.createTask(req, res, mockNext());
    assert.strictEqual(res.statusCode, 400);
  });

  await test("createTask: falls back to in-process processing when redis isn't connected (bypass mode)", async () => {
    Object.defineProperty(redisClient, "isOpen", { value: false, configurable: true });
    Task.create = async (data) => ({ _id: "t1", ...data });

    // this is the separate doc the fallback path fetches via findById to
    // actually run the operation and update status/result on
    const fakeTaskDoc = {
      _id: "t1",
      operationType: "uppercase",
      inputText: "hello",
      logs: [],
      save: async function () { return this; },
    };
    Task.findById = async () => fakeTaskDoc;

    const req = { body: { title: "x", inputText: "hello", operationType: "uppercase" }, user: { _id: "u1" } };
    const res = mockRes();
    await taskController.createTask(req, res, mockNext());

    // the request still succeeds (this is the whole point of the
    // bypass) instead of failing just because redis is unavailable
    assert.strictEqual(res.statusCode, 201);
    // and the fallback actually ran the operation and updated the task
    // in mongo, exactly like the python worker would have
    assert.strictEqual(fakeTaskDoc.status, "success");
    assert.strictEqual(fakeTaskDoc.result, "HELLO");
  });

  await test("createTask: valid input creates a task and pushes it to the queue", async () => {
    let pushedPayload = null;
    Object.defineProperty(redisClient, "isOpen", { value: true, configurable: true });
    redisClient.lPush = async (queueName, payload) => { pushedPayload = payload; };
    Task.create = async (data) => ({ _id: "t1", ...data });
    const req = { body: { title: "Test", inputText: "hello", operationType: "uppercase" }, user: { _id: "u1" } };
    const res = mockRes();
    await taskController.createTask(req, res, mockNext());
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.task.operationType, "uppercase");
    assert.ok(pushedPayload && JSON.parse(pushedPayload).taskId === "t1", "expected the new task's id to be pushed onto the queue");
  });

  await test("rerunTask: task not found returns 404", async () => {
    Task.findOne = async () => null;
    const req = { params: { id: "doesnotexist" }, user: { _id: "u1" } };
    const res = mockRes();
    await taskController.rerunTask(req, res, mockNext());
    assert.strictEqual(res.statusCode, 404);
  });

  await test("rerunTask: existing task gets requeued", async () => {
    const fakeTask = {
      _id: "t1",
      status: "failed",
      result: "OLD",
      errorMessage: "boom",
      logs: [],
      save: async function () { return this; },
    };
    Task.findOne = async () => fakeTask;
    const req = { params: { id: "t1" }, user: { _id: "u1" } };
    const res = mockRes();
    await taskController.rerunTask(req, res, mockNext());
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(fakeTask.status, "pending");
    assert.strictEqual(fakeTask.result, null);
  });

  // ---------- adminController ----------

  await test("getAllUsers: excludes sensitive token fields from the select chain", async () => {
    let selectedFields = null;
    User.find = () => ({
      select(fields) {
        selectedFields = fields;
        return this;
      },
      sort: async () => [{ _id: "u1", name: "A", email: "a@a.com", isBlocked: false }],
    });
    const req = {};
    const res = mockRes();
    await adminController.getAllUsers(req, res, mockNext());
    assert.strictEqual(res.statusCode, 200);
    assert.ok(selectedFields.includes("-verificationToken"), "expected verificationToken to be excluded");
    assert.ok(selectedFields.includes("-resetPasswordToken"), "expected resetPasswordToken to be excluded");
    assert.strictEqual(res.body.users[0]._id, "u1");
  });

  await test("getAllTasks: populates owner and returns tasks", async () => {
    Task.find = () => ({
      populate() { return this; },
      sort() { return this; },
      limit: async () => [{ _id: "t1", title: "x", owner: { name: "A", email: "a@a.com" } }],
    });
    const req = {};
    const res = mockRes();
    await adminController.getAllTasks(req, res, mockNext());
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.count, 1);
  });

  await test("getStats: returns all six counters", async () => {
    User.countDocuments = async () => 5;
    Task.countDocuments = async () => 2;
    const req = {};
    const res = mockRes();
    await adminController.getStats(req, res, mockNext());
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.stats.totalUsers, 5);
    assert.ok("pending" in res.body.stats && "running" in res.body.stats && "success" in res.body.stats && "failed" in res.body.stats);
  });

  await test("toggleBlockUser: user not found returns 404", async () => {
    User.findById = async () => null;
    const req = { params: { id: "ghost" } };
    const res = mockRes();
    await adminController.toggleBlockUser(req, res, mockNext());
    assert.strictEqual(res.statusCode, 404);
  });

  await test("toggleBlockUser: flips isBlocked and saves", async () => {
    const fakeUser = {
      isBlocked: false,
      save: async function () { return this; },
      getPublicProfile() { return { id: "u1" }; },
    };
    User.findById = async () => fakeUser;
    const req = { params: { id: "u1" } };
    const res = mockRes();
    await adminController.toggleBlockUser(req, res, mockNext());
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(fakeUser.isBlocked, true);
    assert.strictEqual(res.body.isBlocked, true);
  });

// ---------- middleware/auth.js ----------

  await test("auth middleware: no token returns 401", async () => {
    const req = { headers: {}, cookies: {} };
    const res = mockRes();
    const next = mockNext();
    await authMiddleware(req, res, next);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(next.called, false);
  });

  await test("auth middleware: valid token but user no longer exists returns 401", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: "ghost" }, process.env.JWT_SECRET);
    User.findById = async () => null;
    const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
    const res = mockRes();
    const next = mockNext();
    await authMiddleware(req, res, next);
    assert.strictEqual(res.statusCode, 401);
  });

  await test("auth middleware: blocked user returns 403", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: "u1" }, process.env.JWT_SECRET);
    User.findById = async () => ({ isBlocked: true });
    const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
    const res = mockRes();
    const next = mockNext();
    await authMiddleware(req, res, next);
    assert.strictEqual(res.statusCode, 403);
  });

  await test("auth middleware: valid + active user calls next() with req.user set", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: "u1" }, process.env.JWT_SECRET);
    User.findById = async () => ({ isBlocked: false, _id: "u1" });
    const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
    const res = mockRes();
    const next = mockNext();
    await authMiddleware(req, res, next);
    assert.strictEqual(next.called, true);
    assert.strictEqual(req.user._id, "u1");
  });

  // ---------- middleware/adminAuth.js ----------

  await test("adminAuth: non-admin user returns 403", () => {
    const req = { user: { role: "user" } };
    const res = mockRes();
    const next = mockNext();
    adminOnly(req, res, next);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(next.called, false);
  });

  await test("adminAuth: admin user calls next()", () => {
    const req = { user: { role: "admin" } };
    const res = mockRes();
    const next = mockNext();
    adminOnly(req, res, next);
    assert.strictEqual(next.called, true);
  });

  // ---------- middleware/errorHandler.js ----------

  await test("errorHandler: CastError becomes 400", () => {
    const err = { name: "CastError", message: "boom" };
    const req = {};
    const res = mockRes();
    errorHandler(err, req, res, mockNext());
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, "Invalid id format");
  });

  await test("errorHandler: duplicate key becomes 400 naming the field", () => {
    const err = { code: 11000, keyValue: { email: "a@a.com" } };
    const req = {};
    const res = mockRes();
    errorHandler(err, req, res, mockNext());
    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.body.message.includes("email"));
  });

  await test("errorHandler: ValidationError joins field messages", () => {
    const err = {
      name: "ValidationError",
      errors: { name: { message: "Name is required" }, email: { message: "Email is required" } },
    };
    const req = {};
    const res = mockRes();
    errorHandler(err, req, res, mockNext());
    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.body.message.includes("Name is required"));
  });

  await test("errorHandler: unknown error defaults to 500", () => {
    const err = new Error("something exploded");
    const req = {};
    const res = mockRes();
    errorHandler(err, req, res, mockNext());
    assert.strictEqual(res.statusCode, 500);
  });

}

main().then(() => {
  console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) if (failed > 0) process.exit(1);
});