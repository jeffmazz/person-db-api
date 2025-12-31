const express = require("express");
const pool = require("./db");
const { personSchema } = require("./schemas");

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
        data.name,
        data.email,
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
    if (err.errors) {
      console.log(err.errors);
      return res.status(400).json({ errors: err.errors });
    }
    return res.status(500).json({ message: "Internal error." });
  }
});

module.exports = routes;
