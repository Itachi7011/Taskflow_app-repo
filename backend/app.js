// app.js
const express = require("express");
const app = express();
require("dotenv").config({ quiet: true });
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const AuthRoutes = require("./routes/authRoutes");
const TaskRoutes = require("./routes/taskRoutes");
const AdminRoutes = require("./routes/adminRoutes");
const errorHandler = require("./middleware/errorHandler");

// behind an ingress/load balancer in k8s so we need this for rate
// limiting + req.ip to actually work right, otherwise everything looks
// like it comes from the same ip (the ingress pod)
app.set("trust proxy", 1);

const corsOptions = {
  origin: [
    "http://localhost:5173",
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmet());

// general rate limit for the whole api
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

// tighter limit specifically on auth routes so people cant brute force
// login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many auth attempts, please try again later.",
});

app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(hpp());

// routes
app.use("/api/auth", AuthRoutes);
app.use("/api/tasks", TaskRoutes);
app.use("/api/admin", AdminRoutes);

// health check, k8s liveness/readiness probes hit this
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "TaskFlow API is running",
    timestamp: new Date().toISOString(),
  });
});

// anything that falls through all the above routes is a 404
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Cant find ${req.originalUrl} on this server`,
  });
});

// this HAS to be the last app.use() call, express only treats a
// middleware as an error handler if it has all 4 arguments
app.use(errorHandler);

module.exports = app;
