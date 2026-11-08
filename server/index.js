require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const app = express();
const PORT = process.env.PORT || 3000;


// Demo users (no database). Passwords are stored HASHED.
const users = [
    {
        id: 1,
        name: "Demo Student",
        email: "student@campusconnect.test",
        passwordHash: bcrypt.hashSync("Campus26", 10)
    }
];


// CORS first, then JSON, then routes
app.use(cors({
    origin: process.env.CLIENT_ORIGIN
}));
app.use(express.json());


// JWT authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;


    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;


    if (!token) {
        return res.status(401).json({ error: "Not logged in." });
    }


    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Not logged in." });
        }


        req.user = decoded;
        next();
    });
}


// GET /api/v1/health
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});


// POST /api/v1/sessions (login)
app.post("/api/v1/sessions", (req, res) => {
    const { email, password } = req.body || {};


    // 1. Validate input -> 400
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !emailRegex.test(email.trim()) ||
        !password
    ) {
        return res.status(400).json({
            error: "Email and password are required."
        });
    }


    // 2. Find the user (lowercase the email first)
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email === normalizedEmail);


    // 3-4. Unknown email OR wrong password -> same 401 message
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(401).json({
            error: "Invalid email or password."
        });
    }


    // 5. Correct -> token (expires in 1 hour) + user (never send the hash)
    const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );


    return res.status(200).json({
        token,
        user: { id: user.id, name: user.name, email: user.email }
    });
});


// GET /api/v1/users/me (needs a valid token)
app.get("/api/v1/users/me", authenticateToken, (req, res) => {
    res.status(200).json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});


// Unknown routes -> 404
app.use((req, res) => {
    res.status(404).json({ error: "Not found." });
});


// Unexpected errors -> 500 (no stack trace sent to the client)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
});


app.listen(PORT, () => {
    console.log(API running on http://localhost:${PORT});
});