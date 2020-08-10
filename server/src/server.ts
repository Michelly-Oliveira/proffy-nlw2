import express from "express";
import cors from "cors";

import routes from "./routes";

const app = express();

app.use(cors());

// Make server able to understand JSON
app.use(express.json());
app.use(routes);

app.listen("3333", () => {
  console.log("Server listening on port 3333!");
});
