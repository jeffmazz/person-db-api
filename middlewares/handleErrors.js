const { ZodError } = require("zod");

const handleErrors = (err, req, res, next) => {
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

  console.error("Unexpected server error: ", err);
  return res.status(500).json({ message: " Internal error." });
};

module.exports = { handleErrors };
