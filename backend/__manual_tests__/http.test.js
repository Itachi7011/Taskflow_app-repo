// __manual_tests__/http.test.js
//
// this is one level more real than controllers.test.js - it actually
// starts the express app (the real app.js, with all its middleware:
// helmet, cors, rate limiting, json parsing, routing) and fires real
// http requests at it with node's http client. only the model layer is
// mocked, so this catches wiring bugs (wrong route path, wrong http
// verb, middleware order) that calling a controller function directly
// never would.
process.env.APP_NAME = "TaskFlow";
process.env.JWT_SECRET = "test_secret_for_local_checks";
process.env.CLIENT_URL = "http://localhost:5173";

const assert = require("assert");
const http = require("http");

const User = require("../models/User");
const Task = require("../models/Task");
const { redisClient } = require("../config/redis");
const app = require("../app");

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

function request(server, { method, path, body, headers = {} }) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        method,
        path,
        port: server.address().port,
        headers: {
          "Content-Type": "application/json",
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
          ...headers,
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let json = null;
          try { json = JSON.parse(raw); } catch (e) { /* not json, fine */ }
          resolve({ status: res.statusCode, body: json, raw });
        });
      },
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  const server = app.listen(0); // 0 = pick any free port

  await test("GET /health returns 200 and a success status", async () => {
    const res = await request(server, { method: "GET", path: "/health" });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, "success");
  });

  await test("GET /api/made-up-route returns 404 with json error shape", async () => {
    const res = await request(server, { method: "GET", path: "/api/made-up-route" });
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.status, "error");
  });

  await test("POST /api/auth/register end-to-end through real middleware returns 201", async () => {
    User.findOne = async () => null;
    User.prototype.save = async function () { return this; };
    User.prototype.generateEmailVerificationToken = function () { return "tok"; };
    const res = await request(server, {
      method: "POST",
      path: "/api/auth/register",
      body: { name: "Jane", email: "jane@example.com", password: "longenough1" },
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
  });

  await test("GET /api/tasks with no auth header returns 401 (protect middleware wired correctly)", async () => {
    const res = await request(server, { method: "GET", path: "/api/tasks" });
    assert.strictEqual(res.status, 401);
  });

  await test("GET /api/tasks with a valid token returns 200 and the user's tasks", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: "u1" }, process.env.JWT_SECRET);
    User.findById = async () => ({ isBlocked: false, _id: "u1" });
    Task.find = () => ({ sort: async () => [{ _id: "t1", title: "hi" }] });
    const res = await request(server, {
      method: "GET",
      path: "/api/tasks",
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.count, 1);
  });

  await test("GET /api/admin/tasks as a non-admin user returns 403 (adminAuth wired after protect)", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: "u1" }, process.env.JWT_SECRET);
    User.findById = async () => ({ isBlocked: false, _id: "u1", role: "user" });
    const res = await request(server, {
      method: "GET",
      path: "/api/admin/tasks",
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(res.status, 403);
  });

  await test("POST /api/tasks creates a task through the real http stack", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: "u1" }, process.env.JWT_SECRET);
    User.findById = async () => ({ isBlocked: false, _id: "u1" });
    Task.create = async (data) => ({ _id: "t1", ...data });
    Object.defineProperty(redisClient, "isReady", { value: true, configurable: true });
    redisClient.lPush = async () => {};
    const res = await request(server, {
      method: "POST",
      path: "/api/tasks",
      headers: { Authorization: `Bearer ${token}` },
      body: { title: "Test", inputText: "hello world", operationType: "word_count" },
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.task.operationType, "word_count");
  });

  await test("POST /api/tasks still succeeds end-to-end when redis is down (bypass mode)", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: "u1" }, process.env.JWT_SECRET);
    User.findById = async () => ({ isBlocked: false, _id: "u1" });
    Task.create = async (data) => ({ _id: "t2", ...data });
    Object.defineProperty(redisClient, "isReady", { value: false, configurable: true });
    const fakeTaskDoc = {
      _id: "t2",
      operationType: "reverse",
      inputText: "abcdef",
      logs: [],
      save: async function () { return this; },
    };
    Task.findById = async () => fakeTaskDoc;
    const res = await request(server, {
      method: "POST",
      path: "/api/tasks",
      headers: { Authorization: `Bearer ${token}` },
      body: { title: "Test", inputText: "abcdef", operationType: "reverse" },
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(fakeTaskDoc.status, "success");
    assert.strictEqual(fakeTaskDoc.result, "fedcba");
  });

  server.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();