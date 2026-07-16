// quick standalone sanity checks for the pieces that dont need a real
// mongo/redis connection - jwt signing and bcrypt hashing. run with:
//   node __manual_tests__/logic.test.js
require("dotenv").config({ path: ".env.example", quiet: true });
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_for_local_checks";

const assert = require("assert");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const { runOperation } = require("../utils/textOperations");

async function run() {
  // --- jwt round trip ---
  const token = generateToken("64f1a2b3c4d5e6f7a8b9c0d1", "user");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert.strictEqual(decoded.id, "64f1a2b3c4d5e6f7a8b9c0d1");
  assert.strictEqual(decoded.role, "user");
  console.log("PASS: generateToken produces a verifiable jwt with correct payload");

  // --- bcrypt hash + compare ---
  const plain = "SuperSecret123";
  const hash = await bcrypt.hash(plain, 12);
  assert.notStrictEqual(hash, plain);
  const matches = await bcrypt.compare(plain, hash);
  assert.strictEqual(matches, true);
  const wrongMatches = await bcrypt.compare("wrong-password", hash);
  assert.strictEqual(wrongMatches, false);
  console.log("PASS: bcrypt hash/compare works as expected");

  // --- textOperations (the redis-bypass fallback's JS port of operations.py) ---
  assert.strictEqual(runOperation("uppercase", "hello world"), "HELLO WORLD");
  assert.strictEqual(runOperation("lowercase", "HELLO World"), "hello world");
  assert.strictEqual(runOperation("reverse", "abcdef"), "fedcba");
  assert.strictEqual(runOperation("word_count", "the quick brown fox"), "4");
  assert.strictEqual(runOperation("word_count", "hello    world\n\nfoo"), "3");
  assert.throws(() => runOperation("not_real", "x"), /Unknown operation type/);
  console.log("PASS: textOperations (redis-bypass fallback) matches worker/operations.py behavior");

  console.log("\nAll manual logic checks passed.");
}

run().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});