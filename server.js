require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const recordsRouter = require("./routes/records");

const app = express();

// Middleware
const origins = (process.env.CLIENT_ORIGINS || "").split(",").map(v => v.trim()).filter(Boolean);
app.use(cors({ origin: origins }));
app.use(express.json());

// API Guide Route
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>Campus Maintenance API</title></head>
      <body style="font-family: sans-serif; padding: 2rem;">
        <h1>Campus Maintenance API</h1>
        <p><strong>Student:</strong> Musafili Justine (202508384)</p>
        <p><strong>System:</strong> Campus Maintenance Requests</p>
        <p><strong>Base URL:</strong> <a href="https://campus-maintenance-api-vt5t.onrender.com">https://campus-maintenance-api-vt5t.onrender.com</a></p>
        
        <h3>Endpoints</h3>
        <ul>
          <li><code>GET /health</code> - Database health check</li>
          <li><code>GET /api/records</code> - Read all records</li>
          <li><code>GET /api/records/:id</code> - Read one record</li>
          <li><code>POST /api/records</code> - Create a record</li>
          <li><code>PUT /api/records/:id</code> - Update a record</li>
          <li><code>DELETE /api/records/:id</code> - Delete a record</li>
        </ul>
        
        <h3>POST / PUT Body Format</h3>
        <pre>{ "title": "Broken light", "category": "Electrical", "description": "Room B12 light is dead.", "status": "Pending" }</pre>
      </body>
    </html>
  `);
});

// Health Check Route
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "OK", database: "Connected" });
  } catch (error) {
    res.status(503).json({ message: "Database connection failed." });
  }
});

// Main API Routes
app.use("/api/records", recordsRouter);

// 404 Handler (Must be after all routes)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON in request body." });
  }
  res.status(500).json({ message: "Internal server error." });
});

// Start Server
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});