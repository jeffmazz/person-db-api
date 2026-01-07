const express = require("express");
const pool = require("./db");
const { personSchema, updatePersonSchema } = require("./schemas");
const { personExists } = require("./middlewares/personExists");
const { handleErrors } = require("./middlewares/handleErrors");

const routes = express.Router();

routes.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM person");
    return res.status(200).json({ people: rows });
  } catch (err) {
    next(err);
  }
});

routes.get("/person/:id", personExists, async (req, res) => {
  return res.status(200).json({ user: req.person });
});

routes.post("/person", async (req, res, next) => {
  try {
    const data = personSchema.parse(req.body);

    const [exists] = await pool.query("SELECT id FROM person WHERE email = ?", [
      data.email.trim(),
    ]);

    if (exists.length)
      return res.status(409).json({ message: "Email already in use." });

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
    next(err);
  }
});

routes.put("/person/:id", personExists, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Object.keys(req.body).length)
      return res
        .status(400)
        .json({ message: "At least one field must be provided." });

    const data = updatePersonSchema.parse(req.body);
    const person = req.person;

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

    await pool.query(`UPDATE person SET ${fields} WHERE id = ?`, [
      ...values,
      id,
    ]);

    return res
      .status(200)
      .json({ message: "Person updated successfully!", id, ...data });
  } catch (err) {
    next(err);
  }
});

routes.delete("/person/:id", personExists, async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM person WHERE id = ?", [
      req.person.id,
    ]);

    if (!result.affectedRows)
      return res.status(404).json({ error: "Person not found." });

    return res
      .status(200)
      .json({ message: "User deleted successfully!", user: req.person });
  } catch (err) {
    next(err);
  }
});

routes.use(handleErrors);

module.exports = routes;
