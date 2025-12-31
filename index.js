const express = require("express");
const routes = require("./routes");
require("dotenv").config();

const port = Number(process.env.SERVER_PORT);
const app = express();

app.use(express.json());
app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
