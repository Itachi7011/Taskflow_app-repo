// server.js
require("dotenv").config({ quiet: true });
const app = require("./app");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");

const PORT = process.env.PORT || 5000;

// wrapping startup in an async function so we can await both
// connections before actually accepting traffic - no point starting
// the http server if mongo/redis arent ready yet
const startServer = async () => {
  await connectDB();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`TaskFlow backend running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
