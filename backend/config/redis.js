// config/redis.js
// single redis client shared across the app, mainly used by queues/taskQueue.js
const { createClient } = require("redis");

// set DISABLE_REDIS=true in .env to skip redis entirely (e.g. no redis
// account/instance available yet). nothing else needs to change - see
// queues/taskQueue.js, which falls back to processing tasks directly in
// node instead of queuing them for the python worker whenever redis
// isnt connected, whether thats because its disabled here or because it
// just failed to connect.
const REDIS_DISABLED = process.env.DISABLE_REDIS === "true";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    // without an explicit strategy some setups seem to stop retrying
    // after the first failure - this keeps trying forever with a capped
    // backoff, and logs every attempt so a dropped connection is
    // obvious in the terminal instead of silently going stale
    reconnectStrategy: (retries) => {
      const delay = Math.min(retries * 200, 5000);
      console.warn(`Redis reconnect attempt #${retries}, retrying in ${delay}ms...`);
      return delay;
    },
  },
});

redisClient.on("error", (err) => {
  // dont crash the whole server if redis hiccups for a sec, just log it -
  // the reconnectStrategy above handles actually getting back online
  console.error("Redis client error:", err.message);
});

redisClient.on("connect", () => {
  console.log("Redis: socket connected, finishing handshake...");
});

redisClient.on("ready", () => {
  console.log("Redis: connected and ready to accept commands");
});

redisClient.on("reconnecting", () => {
  console.warn("Redis: connection lost, attempting to reconnect...");
});

redisClient.on("end", () => {
  console.warn("Redis: connection closed, no more reconnect attempts will be made");
});

const connectRedis = async () => {
  if (REDIS_DISABLED) {
    console.warn(
      "DISABLE_REDIS=true - skipping redis entirely. Tasks will be processed " +
      "directly by the backend instead of being queued for the python worker.",
    );
    return redisClient; // stays closed on purpose, isOpen will be false
  }

  if (redisClient.isOpen) return redisClient;

  // redisClient.connect() wont settle on its own while reconnectStrategy
  // keeps returning a retry delay - if redis is just unreachable (not
  // explicitly disabled), awaiting it directly would hang server startup
  // forever. race it against a timeout instead: if redis hasnt answered
  // within a few seconds, move on without it. the .catch() here matters
  // too - it stops an eventual background failure from becoming an
  // unhandled rejection after we've already stopped waiting on it.
  const CONNECT_TIMEOUT_MS = 3000;
  const connectPromise = redisClient
    .connect()
    .then(() => "connected")
    .catch((err) => {
      console.warn(`Redis connect() failed in the background: ${err.message}`);
      return "failed";
    });
  const timeoutPromise = new Promise((resolve) => setTimeout(resolve, CONNECT_TIMEOUT_MS, "timeout"));

  const outcome = await Promise.race([connectPromise, timeoutPromise]);

  if (outcome !== "connected") {
    console.warn(
      `Redis isn't reachable yet (${outcome === "timeout" ? "no response within " + CONNECT_TIMEOUT_MS + "ms" : "connection failed"}). ` +
      "Starting WITHOUT it for now - tasks will be processed directly by the backend until " +
      "redis becomes reachable (it keeps retrying quietly in the background and picks up " +
      "automatically once available).",
    );
  }

  return redisClient;
};

module.exports = { redisClient, connectRedis, REDIS_DISABLED };