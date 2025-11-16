require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
// Initialize Express
const app = express();
const server = http.createServer(app);
// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST"],
  },
});
// Connect to MongoDB

connectDB();
// Trust proxy - important for accurate client IP when behind reverse proxy (e.g., Render, Heroku, etc.)
app.set("trust proxy", 1);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - configured to work properly with proxy
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  // Use the X-Forwarded-For header to identify clients
  keyGenerator: (req, res) => {
    // Get the client IP from the request
    // trust proxy setting above ensures this works correctly
    return req.ip;
  },
  skip: (req, res) => {
    // Skip rate limiting for health checks
    return req.path === "/health";
  },
});
app.use("/api/", limiter);
// Routes
const authRoutes = require("./routes/authRoute");
const projectRoutes = require("./routes/projectRoute");
const taskRoutes = require("./routes/taskRoute");
const messageRoutes = require("./routes/messageRoute");
const teamRoutes = require("./routes/teamRoute");
const settingsRoutes = require("./routes/settingsRoute");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/settings", settingsRoutes);
// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});
// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});
// Socket.IO setup with real-time handlers
const setupSocketIO = require("./socket/socketHandler");
setupSocketIO(io);
// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
module.exports = { app, server, io };
