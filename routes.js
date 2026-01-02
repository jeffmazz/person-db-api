const express = require("express");
const pool = require("./db");
const { personSchema } = require("./schemas");
const { ZodError } = require("zod");

const routes = express.Router();

routes.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM person");
    return res.status(200).json({ rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Error" });
  }
});

routes.post("/person", async (req, res) => {
  try {
    const data = personSchema.parse(req.body);
    const [result] = await pool.query(
      `INSERT INTO person (name, email, height, weight, is_working, salary) VALUES (?,?,?,?,?,?)`,
      [
        data.name.trim(),
        data.email.trim(),
        data.height,
        data.weight,
        data.isWorking,
        data.salary ?? null,
      ]
    );
    return res.status(201).json({
      message: "User registered successfully!",
      id: result.insertId,
      ...data,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      const formattedError = err.issues.map((e) => {
        return {
          field: e.path[0],
          message: e.message,
        };
      });
      console.log("Zod validation error:", err.issues);
      return res.status(400).json({ errors: formattedError });
    }

    console.error("Server error", err);
    return res.status(500).json({ message: "Internal error." });
  }
});

module.exports = routes;
