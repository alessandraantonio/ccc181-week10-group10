
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    // Check authorization header
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Access denied. No token provided."
        });
    }

    // Check Bearer token format
    const [scheme, token, ...extra] = authHeader.split(" ");

    if (
        scheme !== "Bearer" ||
        !token ||
        extra.length > 0
    ) {
        return res.status(401).json({
            success: false,
            message: "Invalid authorization format. Use Bearer token."
        });
    }

    // Check JWT secret configuration
    if (!process.env.JWT_SECRET) {
        return next(new Error("JWT_SECRET is not configured."));
    }

    try {
        // Verify the token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store authenticated user information
        req.user = decoded;

        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired."
            });
        }

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or inactive token."
            });
        }

        next(error);
    }
}

module.exports = authMiddleware;

