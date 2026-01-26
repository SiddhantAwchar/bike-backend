require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const mysql = require("mysql2");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "../images")));

/* -------------------- MYSQL CONNECTION -------------------- */
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.MYSQL_PASSWORD,
    database: "bike_store"
});

db.connect(err => {
    if (err) {
        console.error("❌ MySQL connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL database");
    }
});

/* -------------------- MULTER CONFIG -------------------- */
const storage = multer.diskStorage({
    destination: "../images",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

/* -------------------- ADMIN LOGIN -------------------- */
app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;

    if (password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true, token: "admin-authenticated" });
    } else {
        res.status(401).json({ success: false, message: "Wrong password" });
    }
});

/* -------------------- ADMIN AUTH MIDDLEWARE -------------------- */
function adminAuth(req, res, next) {
    const token = req.headers["authorization"];

    if (token === "admin-authenticated") {
        next();
    } else {
        res.status(403).json({ message: "Unauthorized" });
    }
}

/* -------------------- HELPER: SAFE IMAGE PARSE -------------------- */
function parseImages(images) {
    if (!images) return [];

    try {
        return JSON.parse(images);
    } catch {
        return [images]; // fallback for old bad data
    }
}

/* -------------------- PUBLIC ROUTES -------------------- */

// GET ALL BIKES
app.get("/api/bikes", (req, res) => {
    db.query("SELECT * FROM bikes", (err, rows) => {
        if (err) return res.status(500).json(err);

        rows.forEach(b => {
            b.images = parseImages(b.images);
        });

        res.json(rows);
    });
});

// GET BIKE BY ID
app.get("/api/bikes/:id", (req, res) => {
    db.query(
        "SELECT * FROM bikes WHERE id = ?",
        [req.params.id],
        (err, rows) => {
            if (!rows.length) {
                return res.status(404).json({ message: "Bike not found" });
            }

            const bike = rows[0];
            bike.images = parseImages(bike.images);
            res.json(bike);
        }
    );
});

/* -------------------- ADMIN ROUTES -------------------- */

// ADD BIKE
app.post("/api/bikes", adminAuth, upload.array("images", 5), (req, res) => {
    const images = req.files.map(f => f.filename);

    db.query(
        `INSERT INTO bikes (name, price, year, type, status, description, images)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            req.body.name,
            req.body.price,
            req.body.year,
            req.body.type,
            req.body.status,
            req.body.description,
            JSON.stringify(images)
        ],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.json({
                message: "Bike added successfully",
                id: result.insertId
            });
        }
    );
});

// UPDATE BIKE STATUS
app.put("/api/bikes/:id/status", adminAuth, (req, res) => {
    db.query(
        "UPDATE bikes SET status = ? WHERE id = ?",
        [req.body.status, req.params.id],
        () => res.json({ message: "Status updated" })
    );
});

// DELETE BIKE
app.delete("/api/bikes/:id", adminAuth, (req, res) => {
    db.query(
        "DELETE FROM bikes WHERE id = ?",
        [req.params.id],
        () => res.json({ message: "Bike deleted" })
    );
});

/* -------------------- START SERVER -------------------- */
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
