const pool = require("../db");

const personExists = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      return res.status(400).json({ error: "Invalid id" });

    const [rows] = await pool.query("SELECT * FROM person WHERE id = ?", [id]);

    if (!rows.length)
      return res.status(404).json({ error: "Person not found." });

    req.person = rows[0];

    return next();
  } catch (err) {
    console.error("personExists middleware error: ", err);
    return res.status(500).json({ error: "Internal error." });
  }
};

module.exports = { personExists };
