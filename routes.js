const express = require("express");
const pool = require("./db");
const { personSchema, updatePersonSchema } = require("./schemas");
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
      const errors = err.issues.map((e) => {
        return {
          field: e.path[0],
          message: e.message,
        };
      });
      console.log("Zod validation error:", err.issues);
      return res.status(400).json({ errors });
    }

    console.error("Server error", err);
    return res.status(500).json({ message: "Internal error." });
  }
});

routes.put("/person/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Object.keys(req.body).length)
      return res
        .status(400)
        .json({ message: "At least one field must be provided." });

    const data = updatePersonSchema.parse(req.body);

    const [personRows] = await pool.query("SELECT * FROM person WHERE id = ?", [
      id,
    ]);

    if (!personRows.length)
      return res.status(404).json({ message: "Person not found." });

    const person = personRows[0];

    const dbData = { ...data };

    if ("isWorking" in data) {
      dbData.is_working = data.isWorking;
      delete dbData.isWorking;
    }

    let exists = [];

    if ("email" in data) {
      if (data.email === person.email) {
        delete dbData.email;
      } else {
        const [rows] = await pool.query(
          "SELECT id FROM person WHERE email = ? AND id <> ?",
          [data.email, id]
        );
        exists = rows;
      }
    }

    if (!Object.keys(dbData).length)
      return res.status(200).json({ message: "No changes applied" });

    if (exists.length)
      return res.status(409).json({ message: "Email already in use." });

    const fields = Object.keys(dbData)
      .map((key) => `${key} = ?`)
      .join(", ");

    const values = Object.values(dbData);

    const [result] = await pool.query(
      `UPDATE person SET ${fields} WHERE id = ?`,
      [...values, id]
    );

    return res
      .status(200)
      .json({ message: "Person updated successfully!", id, ...data });
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.issues.map((e) => {
        return {
          field: e.path[0],
          message: e.message,
        };
      });
      console.log("Zod validation error: ", err.issues);
      return res.status(400).json({ errors });
    }

    console.error(err);
    return res.status(500).json({ message: "Internal error." });
  }
});

module.exports = routes;
