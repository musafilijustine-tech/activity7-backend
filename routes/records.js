const router = require("express").Router();
const pool = require("../db"); // Connects to your db.js file

// --- VALIDATION HELPER ---
function validateRecord(body) {
  const { title, category, description, status } = body;
  const validStatuses = ["Pending", "In progress", "Completed"];

  if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 80)
    return "Title must be between 3 and 80 characters.";
  if (typeof category !== "string" || category.trim().length < 2 || category.trim().length > 40)
    return "Category must be between 2 and 40 characters.";
  if (typeof description !== "string" || description.trim().length < 5 || description.trim().length > 300)
    return "Description must be between 5 and 300 characters.";
  if (!validStatuses.includes(status))
    return "Status must be Pending, In progress, or Completed.";

  return null; // No errors
}

// 1. GET ALL RECORDS
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM records ORDER BY id");
    res.status(200).json(result.rows);
  } catch (error) { next(error); }
});

// 2. GET ONE RECORD
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ message: "ID must be a positive number." });

    const result = await pool.query("SELECT * FROM records WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Record not found." });

    res.status(200).json(result.rows[0]);
  } catch (error) { next(error); }
});

// 3. CREATE A RECORD (POST)
router.post("/", async (req, res, next) => {
  try {
    const error = validateRecord(req.body);
    if (error) return res.status(400).json({ message: error });

    const { title, category, description, status } = req.body;
    const result = await pool.query(
      "INSERT INTO records (title, category, description, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [title.trim(), category.trim(), description.trim(), status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
});

// 4. UPDATE A RECORD (PUT)
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ message: "ID must be a positive number." });

    const error = validateRecord(req.body);
    if (error) return res.status(400).json({ message: error });

    const { title, category, description, status } = req.body;
    const result = await pool.query(
      "UPDATE records SET title=$1, category=$2, description=$3, status=$4 WHERE id=$5 RETURNING *",
      [title.trim(), category.trim(), description.trim(), status, id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ message: "Record not found." });
    res.status(200).json(result.rows[0]);
  } catch (error) { next(error); }
});

// 5. DELETE A RECORD
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ message: "ID must be a positive number." });

    const result = await pool.query("DELETE FROM records WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Record not found." });

    res.status(200).json({ message: "Record deleted." });
  } catch (error) { next(error); }
});

module.exports = router;