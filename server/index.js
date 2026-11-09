
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const usersRouter = require("./routes/users");

const {
    notFoundHandler,
    errorHandler
} = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CampusConnect API is running."
    });
});

// Member 2: Protected user routes
app.use("/api/v1/users", usersRouter);

// Temporary testing endpoint for 500 errors
// Remove this endpoint before final production submission.
if (process.env.ENABLE_ERROR_TEST === "true") {
    app.get("/api/v1/test-error", (req, res, next) => {
        next(new Error("Test server error"));
    });
}

// 404 handler - must come after all routes
app.use(notFoundHandler);

// 500 error handler - must come last
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `CampusConnect API running on port ${PORT}`
    );
});

module.exports = app;
